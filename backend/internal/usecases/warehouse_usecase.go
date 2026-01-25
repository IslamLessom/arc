package usecases

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

type WarehouseUseCase struct {
	repo         repositories.WarehouseRepository
	supplierRepo repositories.SupplierRepository
}

func NewWarehouseUseCase(repo repositories.WarehouseRepository, supplierRepo repositories.SupplierRepository) *WarehouseUseCase {
	return &WarehouseUseCase{
		repo:         repo,
		supplierRepo: supplierRepo,
	}
}

// ——— Warehouses ———

func (uc *WarehouseUseCase) ListWarehouses(ctx context.Context, establishmentID uuid.UUID) ([]*models.Warehouse, error) {
	return uc.repo.ListWarehouses(ctx, establishmentID)
}

func (uc *WarehouseUseCase) GetWarehouse(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.Warehouse, error) {
	return uc.repo.GetWarehouseByID(ctx, id, &establishmentID)
}

func (uc *WarehouseUseCase) CreateWarehouse(ctx context.Context, w *models.Warehouse, establishmentID uuid.UUID) error {
	w.EstablishmentID = establishmentID
	return uc.repo.CreateWarehouse(ctx, w)
}

func (uc *WarehouseUseCase) UpdateWarehouse(ctx context.Context, w *models.Warehouse, establishmentID uuid.UUID) error {
	if _, err := uc.repo.GetWarehouseByID(ctx, w.ID, &establishmentID); err != nil {
		return err
	}
	return uc.repo.UpdateWarehouse(ctx, w)
}

func (uc *WarehouseUseCase) DeleteWarehouse(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error {
	if _, err := uc.repo.GetWarehouseByID(ctx, id, &establishmentID); err != nil {
		return err
	}
	return uc.repo.DeleteWarehouse(ctx, id)
}

// ——— Suppliers ———

func (uc *WarehouseUseCase) ListSuppliers(ctx context.Context, filter *repositories.SupplierFilter) ([]*models.Supplier, error) {
	return uc.supplierRepo.List(ctx, filter)
}

func (uc *WarehouseUseCase) GetSupplier(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.Supplier, error) {
	return uc.supplierRepo.GetByID(ctx, id, &establishmentID)
}

func (uc *WarehouseUseCase) CreateSupplier(ctx context.Context, s *models.Supplier, establishmentID uuid.UUID) error {
	s.EstablishmentID = establishmentID
	return uc.supplierRepo.Create(ctx, s)
}

func (uc *WarehouseUseCase) UpdateSupplier(ctx context.Context, s *models.Supplier, establishmentID uuid.UUID) error {
	if _, err := uc.supplierRepo.GetByID(ctx, s.ID, &establishmentID); err != nil {
		return err
	}
	return uc.supplierRepo.Update(ctx, s)
}

func (uc *WarehouseUseCase) DeleteSupplier(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error {
	if _, err := uc.supplierRepo.GetByID(ctx, id, &establishmentID); err != nil {
		return err
	}
	return uc.supplierRepo.Delete(ctx, id)
}

// ——— Stock ———

func (uc *WarehouseUseCase) GetStock(ctx context.Context, establishmentID uuid.UUID, filter *repositories.StockFilter) ([]*models.Stock, error) {
	if filter == nil {
		filter = &repositories.StockFilter{}
	}
	filter.EstablishmentID = &establishmentID
	return uc.repo.GetStockForEstablishment(ctx, establishmentID, filter)
}

func (uc *WarehouseUseCase) UpdateStockLimit(ctx context.Context, id uuid.UUID, limit float64, establishmentID uuid.UUID) error {
	stock, err := uc.repo.GetStockByID(ctx, id)
	if err != nil || stock == nil {
		return errors.New("stock not found")
	}
	// Проверяем, что остаток принадлежит заведению через склад или напрямую
	warehouse, err := uc.repo.GetWarehouseByID(ctx, stock.WarehouseID, &establishmentID)
	if err != nil || warehouse == nil {
		return errors.New("stock not found or access denied")
	}
	return uc.repo.UpdateStockLimit(ctx, id, limit)
}

// ——— Supply (поставка: создаём документ и увеличиваем остатки) ———

func (uc *WarehouseUseCase) CreateSupply(ctx context.Context, supply *models.Supply, establishmentID uuid.UUID) error {
	w, err := uc.repo.GetWarehouseByID(ctx, supply.WarehouseID, &establishmentID)
	if err != nil || w == nil {
		return errors.New("warehouse not found or access denied")
	}
	sup, err := uc.supplierRepo.GetByID(ctx, supply.SupplierID, &establishmentID)
	if err != nil || sup == nil {
		return errors.New("supplier not found or access denied")
	}
	_ = sup

	if err := uc.repo.CreateSupply(ctx, supply); err != nil {
		return err
	}

	for _, it := range supply.Items {
		var st *models.Stock
		if it.IngredientID != nil {
			st, _ = uc.repo.GetStockByIngredientAndWarehouse(ctx, *it.IngredientID, supply.WarehouseID)
		} else if it.ProductID != nil {
			st, _ = uc.repo.GetStockByProductAndWarehouse(ctx, *it.ProductID, supply.WarehouseID)
		}
		if st != nil {
			st.Quantity += it.Quantity
			// Обновляем цену за единицу из поставки, если она указана
			if it.PricePerUnit > 0 {
				st.PricePerUnit = it.PricePerUnit
			}
			_ = uc.repo.UpdateStock(ctx, st)
		} else {
			unit := it.Unit
			if unit == "" {
				unit = "шт"
			}
			pricePerUnit := it.PricePerUnit
			newSt := &models.Stock{
				WarehouseID:  supply.WarehouseID,
				IngredientID: it.IngredientID,
				ProductID:    it.ProductID,
				Quantity:     it.Quantity,
				Unit:         unit,
				PricePerUnit: pricePerUnit,
			}
			_ = uc.repo.CreateStock(ctx, newSt)
		}
	}
	return nil
}

// ——— WriteOff (списание: создаём документ и уменьшаем остатки) ———

func (uc *WarehouseUseCase) CreateWriteOff(ctx context.Context, writeOff *models.WriteOff, establishmentID uuid.UUID) error {
	if _, err := uc.repo.GetWarehouseByID(ctx, writeOff.WarehouseID, &establishmentID); err != nil {
		return errors.New("warehouse not found or access denied")
	}

	if err := uc.repo.CreateWriteOff(ctx, writeOff); err != nil {
		return err
	}

	for _, it := range writeOff.Items {
		var st *models.Stock
		if it.IngredientID != nil {
			st, _ = uc.repo.GetStockByIngredientAndWarehouse(ctx, *it.IngredientID, writeOff.WarehouseID)
		} else if it.ProductID != nil {
			st, _ = uc.repo.GetStockByProductAndWarehouse(ctx, *it.ProductID, writeOff.WarehouseID)
		}
		if st == nil {
			return errors.New("stock entry not found for write-off item")
		}
		if st.Quantity < it.Quantity {
			return errors.New("insufficient stock for write-off")
		}
		st.Quantity -= it.Quantity
		if err := uc.repo.UpdateStock(ctx, st); err != nil {
			return err
		}
	}
	return nil
}

// GetSuppliesByIngredientOrProduct возвращает поставки по ингредиенту или товару
func (uc *WarehouseUseCase) GetSuppliesByIngredientOrProduct(ctx context.Context, establishmentID uuid.UUID, ingredientID *uuid.UUID, productID *uuid.UUID) ([]*models.Supply, error) {
	if ingredientID == nil && productID == nil {
		return nil, errors.New("ingredient_id or product_id must be provided")
	}
	return uc.repo.GetSuppliesByIngredientOrProduct(ctx, establishmentID, ingredientID, productID)
}

// GetSupply возвращает поставку по ID
func (uc *WarehouseUseCase) GetSupply(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.Supply, error) {
	return uc.repo.GetSupplyByID(ctx, id, &establishmentID)
}

// GetSupplies возвращает список поставок
func (uc *WarehouseUseCase) GetSupplies(ctx context.Context, establishmentID uuid.UUID, warehouseID *uuid.UUID) ([]*models.Supply, error) {
	return uc.repo.GetSuppliesByWarehouse(ctx, establishmentID, warehouseID)
}

// GetWriteOffs возвращает список списаний
func (uc *WarehouseUseCase) GetWriteOffs(ctx context.Context, establishmentID uuid.UUID, warehouseID *uuid.UUID) ([]*models.WriteOff, error) {
	return uc.repo.GetWriteOffsByWarehouse(ctx, establishmentID, warehouseID)
}

// GetWriteOff возвращает списание по ID
func (uc *WarehouseUseCase) GetWriteOff(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.WriteOff, error) {
	return uc.repo.GetWriteOffByID(ctx, id, &establishmentID)
}

// GetMovements возвращает все движения по складу (Supply и WriteOff)
func (uc *WarehouseUseCase) GetMovements(ctx context.Context, establishmentID uuid.UUID, warehouseID *uuid.UUID) ([]interface{}, error) {
	movements := make([]interface{}, 0)
	
	// Получаем поставки
	supplies, err := uc.repo.GetSuppliesByWarehouse(ctx, establishmentID, warehouseID)
	if err != nil {
		return nil, err
	}
	
	// Преобразуем Supply в движения
	for _, supply := range supplies {
		warehouseName := ""
		if supply.Warehouse != nil {
			warehouseName = supply.Warehouse.Name
		}
		supplierName := ""
		if supply.Supplier != nil {
			supplierName = supply.Supplier.Name
		}
		movements = append(movements, map[string]interface{}{
			"type":            "supply",
			"id":              supply.ID,
			"warehouse_id":    supply.WarehouseID,
			"warehouse_name":  warehouseName,
			"supplier_id":     supply.SupplierID,
			"supplier_name":   supplierName,
			"date_time":       supply.DeliveryDateTime,
			"status":          supply.Status,
			"comment":         supply.Comment,
			"items":           supply.Items,
			"created_at":      supply.CreatedAt,
		})
	}
	
	// Получаем списания
	writeOffs, err := uc.repo.GetWriteOffsByWarehouse(ctx, establishmentID, warehouseID)
	if err != nil {
		return nil, err
	}
	
	// Преобразуем WriteOff в движения
	for _, writeOff := range writeOffs {
		warehouseName := ""
		if writeOff.Warehouse != nil {
			warehouseName = writeOff.Warehouse.Name
		}
		movements = append(movements, map[string]interface{}{
			"type":         "write_off",
			"id":           writeOff.ID,
			"warehouse_id": writeOff.WarehouseID,
			"warehouse_name": warehouseName,
			"date_time":    writeOff.WriteOffDateTime,
			"reason":       writeOff.Reason,
			"comment":      writeOff.Comment,
			"items":        writeOff.Items,
			"created_at":   writeOff.CreatedAt,
		})
	}
	
	return movements, nil
}
