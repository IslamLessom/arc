package usecases

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

type InventoryUseCase struct {
	repo         repositories.InventoryRepository
	warehouseRepo repositories.WarehouseRepository
}

func NewInventoryUseCase(repo repositories.InventoryRepository, warehouseRepo repositories.WarehouseRepository) *InventoryUseCase {
	return &InventoryUseCase{
		repo:         repo,
		warehouseRepo: warehouseRepo,
	}
}

// CreateInventoryRequest запрос на создание инвентаризации
type CreateInventoryRequest struct {
	WarehouseID   uuid.UUID                       `json:"warehouse_id" binding:"required"`
	Type          models.InventoryType            `json:"type" binding:"required"`
	ScheduledDate *time.Time                      `json:"scheduled_date"`
	Comment       string                          `json:"comment"`
	Items         []CreateInventoryItemRequest    `json:"items"`
}

// CreateInventoryItemRequest запрос на создание элемента инвентаризации
type CreateInventoryItemRequest struct {
	Type             models.InventoryItemType `json:"type" binding:"required"`
	IngredientID     *uuid.UUID               `json:"ingredient_id,omitempty"`
	ProductID        *uuid.UUID               `json:"product_id,omitempty"`
	TechCardID       *uuid.UUID               `json:"tech_card_id,omitempty"`
	SemiFinishedID   *uuid.UUID               `json:"semi_finished_id,omitempty"`
	ActualQuantity   float64                  `json:"actual_quantity"`
	Comment          string                   `json:"comment"`
}

// UpdateInventoryItemRequest запрос на обновления элемента инвентаризации
type UpdateInventoryItemRequest struct {
	ActualQuantity float64 `json:"actual_quantity"`
	Comment        string  `json:"comment"`
}

// List возвращает список инвентаризаций
func (uc *InventoryUseCase) List(ctx context.Context, establishmentID uuid.UUID, filter *repositories.InventoryFilter) ([]*models.Inventory, error) {
	if filter == nil {
		filter = &repositories.InventoryFilter{}
	}
	filter.EstablishmentID = &establishmentID
	return uc.repo.List(ctx, filter)
}

// GetByID возвращает инвентаризацию по ID
func (uc *InventoryUseCase) GetByID(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.Inventory, error) {
	inventory, err := uc.repo.GetByID(ctx, id, &establishmentID)
	if err != nil {
		return nil, err
	}
	if inventory == nil {
		return nil, errors.New("inventory not found")
	}
	return inventory, nil
}

// Create создает новую инвентаризацию
func (uc *InventoryUseCase) Create(ctx context.Context, req *CreateInventoryRequest, establishmentID uuid.UUID, createdBy *uuid.UUID) (*models.Inventory, error) {
	// Проверяем существование склада
	warehouse, err := uc.warehouseRepo.GetWarehouseByID(ctx, req.WarehouseID, &establishmentID)
	if err != nil || warehouse == nil {
		return nil, errors.New("warehouse not found or access denied")
	}

	// Валидация типа инвентаризации
	if req.Type != models.InventoryTypeFull && req.Type != models.InventoryTypePartial {
		return nil, errors.New("invalid inventory type")
	}

	// Для частичной инвентаризации проверяем наличие элементов
	if req.Type == models.InventoryTypePartial && len(req.Items) == 0 {
		return nil, errors.New("at least one item required for partial inventory")
	}

	inventory := &models.Inventory{
		EstablishmentID: establishmentID,
		WarehouseID:     req.WarehouseID,
		Type:            req.Type,
		Status:          models.InventoryStatusDraft,
		ScheduledDate:   req.ScheduledDate,
		Comment:         req.Comment,
		CreatedBy:       createdBy,
	}

	// Подготавливаем элементы инвентаризации
	items := make([]models.InventoryItem, 0, len(req.Items))
	for _, itemReq := range req.Items {
		// Валидация элемента
		if err := uc.validateInventoryItem(&itemReq); err != nil {
			return nil, err
		}

		// Получаем ожидаемое количество из остатков
		expectedQuantity, unit, pricePerUnit, err := uc.getStockData(ctx, req.WarehouseID, &itemReq)
		if err != nil {
			return nil, err
		}

		item := models.InventoryItem{
			Type:             itemReq.Type,
			IngredientID:     itemReq.IngredientID,
			ProductID:        itemReq.ProductID,
			TechCardID:       itemReq.TechCardID,
			SemiFinishedID:   itemReq.SemiFinishedID,
			ExpectedQuantity: expectedQuantity,
			ActualQuantity:   itemReq.ActualQuantity,
			Unit:             unit,
			PricePerUnit:     pricePerUnit,
			Comment:          itemReq.Comment,
		}

		// Вычисляем разницу
		item.Difference = item.ActualQuantity - item.ExpectedQuantity
		item.DifferenceValue = item.Difference * item.PricePerUnit

		items = append(items, item)
	}

	inventory.Items = items

	if err := uc.repo.Create(ctx, inventory); err != nil {
		return nil, err
	}

	return inventory, nil
}

// validateInventoryItem валидирует элемент инвентаризации
func (uc *InventoryUseCase) validateInventoryItem(req *CreateInventoryItemRequest) error {
	// Проверяем, что указан ровно один ID сущности
	ids := 0
	if req.IngredientID != nil {
		ids++
	}
	if req.ProductID != nil {
		ids++
	}
	if req.TechCardID != nil {
		ids++
	}
	if req.SemiFinishedID != nil {
		ids++
	}

	if ids != 1 {
		return errors.New("exactly one of ingredient_id, product_id, tech_card_id or semi_finished_id must be specified")
	}

	// Проверяем соответствие типа и ID
	switch req.Type {
	case models.InventoryItemTypeIngredient:
		if req.IngredientID == nil {
			return errors.New("ingredient_id required for ingredient type")
		}
	case models.InventoryItemTypeProduct:
		if req.ProductID == nil {
			return errors.New("product_id required for product type")
		}
	case models.InventoryItemTypeTechCard:
		if req.TechCardID == nil {
			return errors.New("tech_card_id required for tech_card type")
		}
	case models.InventoryItemTypeSemiFinished:
		if req.SemiFinishedID == nil {
			return errors.New("semi_finished_id required for semi_finished type")
		}
	default:
		return errors.New("invalid inventory item type")
	}

	return nil
}

// getStockData получает данные об остатках для элемента инвентаризации
func (uc *InventoryUseCase) getStockData(ctx context.Context, warehouseID uuid.UUID, req *CreateInventoryItemRequest) (quantity float64, unit string, pricePerUnit float64, err error) {
	quantity = 0
	unit = "шт"
	pricePerUnit = 0

	switch req.Type {
	case models.InventoryItemTypeIngredient:
		if req.IngredientID != nil {
			stock, stockErr := uc.warehouseRepo.GetStockByIngredientAndWarehouse(ctx, *req.IngredientID, warehouseID)
			if stockErr == nil && stock != nil {
				quantity = stock.Quantity
				unit = stock.Unit
				pricePerUnit = stock.PricePerUnit
			}
		}
	case models.InventoryItemTypeProduct, models.InventoryItemTypeSemiFinished:
		var productID *uuid.UUID
		if req.Type == models.InventoryItemTypeProduct {
			productID = req.ProductID
		} else {
			productID = req.SemiFinishedID
		}

		if productID != nil {
			stock, stockErr := uc.warehouseRepo.GetStockByProductAndWarehouse(ctx, *productID, warehouseID)
			if stockErr == nil && stock != nil {
				quantity = stock.Quantity
				unit = stock.Unit
				pricePerUnit = stock.PricePerUnit
			}
		}
	case models.InventoryItemTypeTechCard:
		// Для техкарт можно получить данные из ингредиентов или оставить 0
		// Сейчас оставляем 0, так как остатки техкарт не хранятся напрямую
	}

	return quantity, unit, pricePerUnit, nil
}

// UpdateItem обновляет элемент инвентаризации
func (uc *InventoryUseCase) UpdateItem(ctx context.Context, inventoryID, itemID uuid.UUID, establishmentID uuid.UUID, req *UpdateInventoryItemRequest) error {
	// Проверяем существование инвентаризации
	inventory, err := uc.repo.GetByID(ctx, inventoryID, &establishmentID)
	if err != nil || inventory == nil {
		return errors.New("inventory not found")
	}

	// Проверяем статус
	if inventory.Status != models.InventoryStatusDraft && inventory.Status != models.InventoryStatusInProgress {
		return errors.New("can only update items in draft or in_progress status")
	}

	// Находим элемент
	var item *models.InventoryItem
	for i := range inventory.Items {
		if inventory.Items[i].ID == itemID {
			item = &inventory.Items[i]
			break
		}
	}

	if item == nil {
		return errors.New("inventory item not found")
	}

	// Обновляем данные
	item.ActualQuantity = req.ActualQuantity
	item.Comment = req.Comment
	item.Difference = item.ActualQuantity - item.ExpectedQuantity
	item.DifferenceValue = item.Difference * item.PricePerUnit

	return uc.repo.UpdateItem(ctx, item)
}

// UpdateStatus обновляет статус инвентаризации
func (uc *InventoryUseCase) UpdateStatus(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID, status models.InventoryStatus, completedBy *uuid.UUID) error {
	// Проверяем существование
	inventory, err := uc.repo.GetByID(ctx, id, &establishmentID)
	if err != nil || inventory == nil {
		return errors.New("inventory not found")
	}

	// Валидация переходов статусов
	currentStatus := inventory.Status
	if !uc.isValidStatusTransition(currentStatus, status) {
		return errors.New("invalid status transition")
	}

	// При завершении вычисляем финальную дату
	if status == models.InventoryStatusCompleted {
		now := time.Now()
		inventory.ActualDate = &now
		inventory.CompletedBy = completedBy
	}

	return uc.repo.UpdateStatus(ctx, id, status)
}

// isValidStatusTransition проверяет валидность перехода статусов
func (uc *InventoryUseCase) isValidStatusTransition(current, new models.InventoryStatus) bool {
	validTransitions := map[models.InventoryStatus][]models.InventoryStatus{
		models.InventoryStatusDraft:     {models.InventoryStatusInProgress, models.InventoryStatusCancelled},
		models.InventoryStatusInProgress: {models.InventoryStatusCompleted, models.InventoryStatusCancelled, models.InventoryStatusDraft},
		models.InventoryStatusCompleted:  {}, // Финальный статус
		models.InventoryStatusCancelled:  {}, // Финальный статус
	}

	allowed, ok := validTransitions[current]
	if !ok {
		return false
	}

	for _, s := range allowed {
		if s == new {
			return true
		}
	}
	return false
}

// Delete удаляет инвентаризацию
func (uc *InventoryUseCase) Delete(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error {
	// Проверяем существование
	inventory, err := uc.repo.GetByID(ctx, id, &establishmentID)
	if err != nil || inventory == nil {
		return errors.New("inventory not found")
	}

	// Можно удалять только черновики
	if inventory.Status != models.InventoryStatusDraft {
		return errors.New("can only delete inventories in draft status")
	}

	return uc.repo.Delete(ctx, id)
}

// DeleteItem удаляет элемент инвентаризации
func (uc *InventoryUseCase) DeleteItem(ctx context.Context, inventoryID, itemID uuid.UUID, establishmentID uuid.UUID) error {
	// Проверяем существование инвентаризации
	inventory, err := uc.repo.GetByID(ctx, inventoryID, &establishmentID)
	if err != nil || inventory == nil {
		return errors.New("inventory not found")
	}

	// Проверяем статус
	if inventory.Status != models.InventoryStatusDraft {
		return errors.New("can only delete items from draft inventories")
	}

	return uc.repo.DeleteItem(ctx, itemID)
}

// GetStockSnapshot получает снапшот остатков на определенную дату
func (uc *InventoryUseCase) GetStockSnapshot(ctx context.Context, warehouseID uuid.UUID, date *time.Time, establishmentID uuid.UUID) ([]*models.Stock, error) {
	// Проверяем существование склада
	_, err := uc.warehouseRepo.GetWarehouseByID(ctx, warehouseID, &establishmentID)
	if err != nil {
		return nil, errors.New("warehouse not found")
	}

	return uc.repo.GetStockSnapshot(ctx, warehouseID, date)
}
