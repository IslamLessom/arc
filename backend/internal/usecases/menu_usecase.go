package usecases

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

type MenuUseCase struct {
	productRepo          repositories.ProductRepository
	techCardRepo         repositories.TechCardRepository
	semiFinishedRepo     repositories.SemiFinishedRepository
	ingredientRepo       repositories.IngredientRepository
	categoryRepo         repositories.CategoryRepository
	ingredientCategoryRepo repositories.IngredientCategoryRepository
	warehouseRepo        repositories.WarehouseRepository
}

func NewMenuUseCase(
	productRepo repositories.ProductRepository,
	techCardRepo repositories.TechCardRepository,
	semiFinishedRepo repositories.SemiFinishedRepository,
	ingredientRepo repositories.IngredientRepository,
	categoryRepo repositories.CategoryRepository,
	ingredientCategoryRepo repositories.IngredientCategoryRepository,
	warehouseRepo repositories.WarehouseRepository,
) *MenuUseCase {
	return &MenuUseCase{
		productRepo:           productRepo,
		techCardRepo:          techCardRepo,
		semiFinishedRepo:      semiFinishedRepo,
		ingredientRepo:        ingredientRepo,
		categoryRepo:          categoryRepo,
		ingredientCategoryRepo: ingredientCategoryRepo,
		warehouseRepo:         warehouseRepo,
	}
}

// CreateProduct создает товар и автоматически добавляет его в остатки с количеством 0
func (uc *MenuUseCase) CreateProduct(ctx context.Context, product *models.Product, warehouseID, establishmentID uuid.UUID) error {
	product.EstablishmentID = establishmentID
	product.CalculatePrice()

	if err := uc.productRepo.Create(ctx, product); err != nil {
		return err
	}

	// Автоматически создаем запись в остатках с количеством 0
	unit := "шт" // по умолчанию штуки, если весовой товар - может быть кг, л и т.д.
	if product.IsWeighted {
		unit = "кг" // для весового товара по умолчанию килограммы
	}

	stock := &models.Stock{
		WarehouseID: warehouseID,
		ProductID:   &product.ID,
		Quantity:    0, // Начальное количество = 0
		Unit:        unit,
	}

	if err := uc.warehouseRepo.CreateStock(ctx, stock); err != nil {
		return err
	}

	return nil
}

// UpdateProduct обновляет товар
func (uc *MenuUseCase) UpdateProduct(ctx context.Context, product *models.Product) error {
	// Пересчитываем цену при обновлении
	product.CalculatePrice()
	return uc.productRepo.Update(ctx, product)
}

// DeleteProduct удаляет товар (soft delete), только если он принадлежит заведению
func (uc *MenuUseCase) DeleteProduct(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error {
	if _, err := uc.productRepo.GetByID(ctx, id, &establishmentID); err != nil {
		return err
	}
	return uc.productRepo.Delete(ctx, id)
}

// GetProducts возвращает список товаров с фильтрацией
func (uc *MenuUseCase) GetProducts(ctx context.Context, filter *repositories.ProductFilter) ([]*models.Product, error) {
	return uc.productRepo.List(ctx, filter)
}

// GetProductByID возвращает товар по ID (с проверкой заведения)
func (uc *MenuUseCase) GetProductByID(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.Product, error) {
	return uc.productRepo.GetByID(ctx, id, &establishmentID)
}

// CreateTechCard создает тех-карту
// recalculateCost - если true, принудительно пересчитать себестоимость из ингредиентов
func (uc *MenuUseCase) CreateTechCard(ctx context.Context, techCard *models.TechCard, warehouseID, establishmentID uuid.UUID, recalculateCost bool) error {
	techCard.EstablishmentID = establishmentID

	// Пересчитываем себестоимость если:
	// 1. Запрошен принудительный пересчет (recalculateCost = true)
	// 2. ИЛИ если cost_price не задан вручную (равен 0) и есть ингредиенты
	shouldRecalculate := recalculateCost || (len(techCard.Ingredients) > 0 && techCard.CostPrice == 0)

	if shouldRecalculate {
		cost, err := uc.CalculateTechCardCost(ctx, techCard, warehouseID, establishmentID)
		if err == nil {
			techCard.CostPrice = cost
		}
		// Если warehouseID пустой, пытаемся получить склад по умолчанию
		if warehouseID == uuid.Nil && len(techCard.Ingredients) > 0 {
			// Получаем склад по умолчанию для заведения
			warehouses, err := uc.warehouseRepo.ListWarehouses(ctx, establishmentID)
			if err == nil && len(warehouses) > 0 {
				for _, w := range warehouses {
					if w.Active {
						warehouseID = w.ID
						cost, err = uc.CalculateTechCardCost(ctx, techCard, warehouseID, establishmentID)
						if err == nil {
							techCard.CostPrice = cost
						}
						break
					}
				}
			}
		}
	}

	techCard.CalculatePrice()
	return uc.techCardRepo.Create(ctx, techCard)
}

// UpdateTechCard обновляет тех-карту (проверка заведения через techCard.EstablishmentID при GetByID перед вызовом)
// recalculateCost - если true, принудительно пересчитать себестоимость из ингредиентов
func (uc *MenuUseCase) UpdateTechCard(ctx context.Context, techCard *models.TechCard, warehouseID, establishmentID uuid.UUID, recalculateCost bool) error {
	// Пересчитываем себестоимость если:
	// 1. Запрошен принудительный пересчет (recalculateCost = true)
	// 2. ИЛИ если cost_price не задан вручную (равен 0) и есть ингредиенты
	shouldRecalculate := recalculateCost || (len(techCard.Ingredients) > 0 && techCard.CostPrice == 0)

	if shouldRecalculate {
		// Если warehouseID пустой, пытаемся получить склад по умолчанию
		if warehouseID == uuid.Nil {
			warehouses, err := uc.warehouseRepo.ListWarehouses(ctx, establishmentID)
			if err == nil && len(warehouses) > 0 {
				for _, w := range warehouses {
					if w.Active {
						warehouseID = w.ID
						break
					}
				}
			}
		}

		cost, err := uc.CalculateTechCardCost(ctx, techCard, warehouseID, establishmentID)
		if err == nil {
			techCard.CostPrice = cost
		}
	}

	techCard.CalculatePrice()
	return uc.techCardRepo.Update(ctx, techCard)
}

// DeleteTechCard удаляет тех-карту (soft delete)
func (uc *MenuUseCase) DeleteTechCard(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error {
	if _, err := uc.techCardRepo.GetByID(ctx, id, &establishmentID); err != nil {
		return err
	}
	return uc.techCardRepo.Delete(ctx, id)
}

// GetTechCards возвращает список тех-карт с фильтрацией
func (uc *MenuUseCase) GetTechCards(ctx context.Context, filter *repositories.TechCardFilter) ([]*models.TechCard, error) {
	return uc.techCardRepo.List(ctx, filter)
}

// GetTechCardByID возвращает тех-карту по ID
func (uc *MenuUseCase) GetTechCardByID(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.TechCard, error) {
	return uc.techCardRepo.GetByID(ctx, id, &establishmentID)
}

// CreateIngredient создает ингредиент и автоматически создает остатки на складе
func (uc *MenuUseCase) CreateIngredient(ctx context.Context, ingredient *models.Ingredient, warehouseID uuid.UUID, quantity float64, pricePerUnit float64, supplierID uuid.UUID, establishmentID uuid.UUID) error {
	ingredient.EstablishmentID = establishmentID
	if !ingredient.ValidateUnit() {
		return errors.New("invalid unit, must be one of: шт, л, кг")
	}

	if err := uc.ingredientRepo.Create(ctx, ingredient); err != nil {
		return err
	}

	// Если указаны количество и склад, создаем остатки с ценой
	if quantity > 0 && warehouseID != uuid.Nil {
		stock := &models.Stock{
			WarehouseID:  warehouseID,
			IngredientID: &ingredient.ID,
			Quantity:     quantity,
			Unit:         ingredient.Unit,
			PricePerUnit: pricePerUnit, // Сохраняем цену за единицу
		}

		if err := uc.warehouseRepo.CreateStock(ctx, stock); err != nil {
			return err
		}

		// Если указан поставщик, создаем автоматическую поставку
		if supplierID != uuid.Nil {
			supply := &models.Supply{
				WarehouseID:     warehouseID,
				SupplierID:      supplierID,
				DeliveryDateTime: time.Now(),
				Status:          "completed",
				Items: []models.SupplyItem{
					{
						ID:            uuid.New(),
						IngredientID:  &ingredient.ID,
						Quantity:      quantity,
						Unit:          ingredient.Unit,
						PricePerUnit:  pricePerUnit,
						TotalAmount:   quantity * pricePerUnit,
					},
				},
			}
			if err := uc.warehouseRepo.CreateSupply(ctx, supply); err != nil {
				// Не прерываем операцию, если поставка не создалась
				// Логируем ошибку, но ингредиент уже создан
				// Можно добавить логирование здесь
			}
		}
	}

	return nil
}

// UpdateIngredient обновляет ингредиент
func (uc *MenuUseCase) UpdateIngredient(ctx context.Context, ingredient *models.Ingredient) error {
	// Валидация единицы измерения
	if !ingredient.ValidateUnit() {
		return errors.New("invalid unit, must be one of: шт, л, кг")
	}
	return uc.ingredientRepo.Update(ctx, ingredient)
}

// DeleteIngredient удаляет ингредиент (soft delete)
func (uc *MenuUseCase) DeleteIngredient(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error {
	if _, err := uc.ingredientRepo.GetByID(ctx, id, &establishmentID); err != nil {
		return err
	}
	return uc.ingredientRepo.Delete(ctx, id)
}

// GetIngredients возвращает список ингредиентов с фильтрацией
func (uc *MenuUseCase) GetIngredients(ctx context.Context, filter *repositories.IngredientFilter) ([]*models.Ingredient, error) {
	return uc.ingredientRepo.List(ctx, filter)
}

// GetIngredientByID возвращает ингредиент по ID
func (uc *MenuUseCase) GetIngredientByID(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.Ingredient, error) {
	return uc.ingredientRepo.GetByID(ctx, id, &establishmentID)
}

// CalculateTechCardCost рассчитывает себестоимость тех-карты на основе ингредиентов
func (uc *MenuUseCase) CalculateTechCardCost(ctx context.Context, techCard *models.TechCard, warehouseID, establishmentID uuid.UUID) (float64, error) {
	var totalCost float64

	for _, ingredient := range techCard.Ingredients {
		stock, err := uc.warehouseRepo.GetStockByIngredientAndWarehouse(ctx, ingredient.IngredientID, warehouseID)
		if err != nil {
			// Если остаток не найден, пропускаем ингредиент (ошибка не критичная)
			continue
		}
		if stock == nil {
			continue
		}

		// Проверяем существование ингредиента
		_, err = uc.ingredientRepo.GetByID(ctx, ingredient.IngredientID, &establishmentID)
		if err != nil {
			// Если ингредиент не найден, пропускаем его
			continue
		}

		// Конвертируем количество ингредиента в нужную единицу измерения
		ingredientQuantity := ingredient.Quantity
		ingredientUnit := ingredient.Unit
		stockUnit := stock.Unit

		// Если единицы измерения разные, нужно конвертировать
		// Упрощенная конвертация (в реальности нужна более сложная логика)
		if ingredientUnit != stockUnit {
			// Конвертация между кг, л, шт
			// Для упрощения считаем, что конвертация уже выполнена
		}

		// Получаем цену за единицу из остатков (Stock)
		pricePerUnit := stock.PricePerUnit

		// Рассчитываем стоимость с учетом потерь при приготовлении
		// Пока не учитываем потери, но можно добавить позже
		ingredientCost := ingredientQuantity * pricePerUnit
		totalCost += ingredientCost
	}

	return totalCost, nil
}

// ——— Categories (для товаров и тех-карт) ———

func (uc *MenuUseCase) GetCategories(ctx context.Context, filter *repositories.CategoryFilter) ([]*models.Category, error) {
	return uc.categoryRepo.List(ctx, filter)
}

func (uc *MenuUseCase) GetCategoryByID(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.Category, error) {
	return uc.categoryRepo.GetByID(ctx, id, &establishmentID)
}

func (uc *MenuUseCase) CreateCategory(ctx context.Context, category *models.Category, establishmentID uuid.UUID) error {
	category.EstablishmentID = establishmentID
	return uc.categoryRepo.Create(ctx, category)
}

func (uc *MenuUseCase) UpdateCategory(ctx context.Context, category *models.Category, establishmentID uuid.UUID) error {
	if _, err := uc.categoryRepo.GetByID(ctx, category.ID, &establishmentID); err != nil {
		return err
	}
	return uc.categoryRepo.Update(ctx, category)
}

func (uc *MenuUseCase) DeleteCategory(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error {
	if _, err := uc.categoryRepo.GetByID(ctx, id, &establishmentID); err != nil {
		return err
	}
	return uc.categoryRepo.Delete(ctx, id)
}

// ——— IngredientCategories (для ингредиентов) ———

func (uc *MenuUseCase) GetIngredientCategories(ctx context.Context, filter *repositories.IngredientCategoryFilter) ([]*models.IngredientCategory, error) {
	return uc.ingredientCategoryRepo.List(ctx, filter)
}

func (uc *MenuUseCase) GetIngredientCategoryByID(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.IngredientCategory, error) {
	return uc.ingredientCategoryRepo.GetByID(ctx, id, &establishmentID)
}

func (uc *MenuUseCase) CreateIngredientCategory(ctx context.Context, c *models.IngredientCategory, establishmentID uuid.UUID) error {
	c.EstablishmentID = establishmentID
	return uc.ingredientCategoryRepo.Create(ctx, c)
}

func (uc *MenuUseCase) UpdateIngredientCategory(ctx context.Context, c *models.IngredientCategory, establishmentID uuid.UUID) error {
	if _, err := uc.ingredientCategoryRepo.GetByID(ctx, c.ID, &establishmentID); err != nil {
		return err
	}
	return uc.ingredientCategoryRepo.Update(ctx, c)
}

func (uc *MenuUseCase) DeleteIngredientCategory(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error {
	if _, err := uc.ingredientCategoryRepo.GetByID(ctx, id, &establishmentID); err != nil {
		return err
	}
	return uc.ingredientCategoryRepo.Delete(ctx, id)
}

// GetIngredientCategoriesWithStats возвращает список категорий ингредиентов со статистикой
func (uc *MenuUseCase) GetIngredientCategoriesWithStats(ctx context.Context, filter *repositories.IngredientCategoryFilter) ([]*models.IngredientCategoryWithStats, error) {
	return uc.ingredientCategoryRepo.ListWithStats(ctx, filter)
}

// GetIngredientCategoryWithStatsByID возвращает категорию ингредиентов со статистикой по ID
func (uc *MenuUseCase) GetIngredientCategoryWithStatsByID(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.IngredientCategoryWithStats, error) {
	return uc.ingredientCategoryRepo.GetWithStats(ctx, id, &establishmentID)
}

// ——— SemiFinishedProducts (полуфабрикаты) ———

func (uc *MenuUseCase) GetSemiFinishedProducts(ctx context.Context, filter *repositories.SemiFinishedFilter) ([]*models.SemiFinishedProduct, error) {
	return uc.semiFinishedRepo.List(ctx, filter)
}

func (uc *MenuUseCase) GetSemiFinishedByID(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.SemiFinishedProduct, error) {
	return uc.semiFinishedRepo.GetByID(ctx, id, &establishmentID)
}

func (uc *MenuUseCase) CreateSemiFinished(ctx context.Context, semiFinished *models.SemiFinishedProduct, warehouseID, establishmentID uuid.UUID) error {
	semiFinished.EstablishmentID = establishmentID
	if len(semiFinished.Ingredients) > 0 {
		cost, err := uc.CalculateSemiFinishedCost(ctx, semiFinished, warehouseID, establishmentID)
		if err == nil {
			semiFinished.CostPrice = cost
		}
	}
	return uc.semiFinishedRepo.Create(ctx, semiFinished)
}

func (uc *MenuUseCase) UpdateSemiFinished(ctx context.Context, semiFinished *models.SemiFinishedProduct, warehouseID, establishmentID uuid.UUID) error {
	if len(semiFinished.Ingredients) > 0 {
		cost, err := uc.CalculateSemiFinishedCost(ctx, semiFinished, warehouseID, establishmentID)
		if err == nil {
			semiFinished.CostPrice = cost
		}
	}
	return uc.semiFinishedRepo.Update(ctx, semiFinished)
}

func (uc *MenuUseCase) DeleteSemiFinished(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error {
	if _, err := uc.semiFinishedRepo.GetByID(ctx, id, &establishmentID); err != nil {
		return err
	}
	return uc.semiFinishedRepo.Delete(ctx, id)
}

func (uc *MenuUseCase) CalculateSemiFinishedCost(ctx context.Context, semiFinished *models.SemiFinishedProduct, warehouseID, establishmentID uuid.UUID) (float64, error) {
	var totalCost float64

	for _, ingredient := range semiFinished.Ingredients {
		stock, err := uc.warehouseRepo.GetStockByIngredientAndWarehouse(ctx, ingredient.IngredientID, warehouseID)
		if err != nil {
			return 0, err
		}
		if stock == nil {
			continue
		}

		// Проверяем существование ингредиента
		_, err = uc.ingredientRepo.GetByID(ctx, ingredient.IngredientID, &establishmentID)
		if err != nil {
			return 0, err
		}

		// Конвертируем количество ингредиента в нужную единицу измерения
		ingredientQuantity := ingredient.Net
		ingredientUnit := ingredient.Unit

		// Если единицы измерения разные, конвертируем
		pricePerUnit := stock.PricePerUnit

		// Конвертируем в базовые единицы (кг, л, шт) для расчета стоимости
		netForCost := ingredientQuantity
		if ingredientUnit == "г" {
			netForCost = ingredientQuantity / 1000 // конвертируем г в кг
		} else if ingredientUnit == "мл" {
			netForCost = ingredientQuantity / 1000 // конвертируем мл в л
		}

		ingredientCost := netForCost * pricePerUnit
		totalCost += ingredientCost
	}

	return totalCost, nil
}

// GetWarehouses возвращает список складов для заведения
func (uc *MenuUseCase) GetWarehouses(ctx context.Context, establishmentID uuid.UUID) ([]*models.Warehouse, error) {
	return uc.warehouseRepo.ListWarehouses(ctx, establishmentID)
}