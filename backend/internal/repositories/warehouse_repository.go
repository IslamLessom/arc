package repositories

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type StockFilter struct {
	EstablishmentID *uuid.UUID
	WarehouseID     *uuid.UUID
	Search          *string // Поиск по названию ингредиента/товара
	Type            *string // "ingredient" или "product"
	CategoryID      *uuid.UUID // Фильтр по категории (для ингредиентов или товаров)
}

type WarehouseRepository interface {
	// Warehouse CRUD
	CreateWarehouse(ctx context.Context, w *models.Warehouse) error
	ListWarehouses(ctx context.Context, establishmentID uuid.UUID) ([]*models.Warehouse, error)
	GetWarehouseByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Warehouse, error)
	UpdateWarehouse(ctx context.Context, w *models.Warehouse) error
	DeleteWarehouse(ctx context.Context, id uuid.UUID) error
	// Stock
	GetStock(ctx context.Context) ([]*models.Stock, error)
	GetStockByWarehouseID(ctx context.Context, warehouseID uuid.UUID) ([]*models.Stock, error)
	GetStockForEstablishment(ctx context.Context, establishmentID uuid.UUID, filter *StockFilter) ([]*models.Stock, error)
	GetStockByIngredientID(ctx context.Context, ingredientID uuid.UUID) ([]*models.Stock, error)
	GetStockByIngredientAndWarehouse(ctx context.Context, ingredientID, warehouseID uuid.UUID) (*models.Stock, error)
	GetStockByProductAndWarehouse(ctx context.Context, productID, warehouseID uuid.UUID) (*models.Stock, error)
	GetStockByID(ctx context.Context, id uuid.UUID) (*models.Stock, error)
	CreateStock(ctx context.Context, stock *models.Stock) error
	UpdateStock(ctx context.Context, stock *models.Stock) error
	UpdateStockLimit(ctx context.Context, id uuid.UUID, limit float64) error
	// Supply & WriteOff
	CreateSupply(ctx context.Context, supply *models.Supply) error
	GetSuppliesByIngredientOrProduct(ctx context.Context, establishmentID uuid.UUID, ingredientID *uuid.UUID, productID *uuid.UUID) ([]*models.Supply, error)
	CreateWriteOff(ctx context.Context, writeOff *models.WriteOff) error
}

type warehouseRepository struct {
	db *gorm.DB
}

func NewWarehouseRepository(db *gorm.DB) WarehouseRepository {
	return &warehouseRepository{db: db}
}

func (r *warehouseRepository) CreateWarehouse(ctx context.Context, w *models.Warehouse) error {
	return r.db.WithContext(ctx).Create(w).Error
}

func (r *warehouseRepository) ListWarehouses(ctx context.Context, establishmentID uuid.UUID) ([]*models.Warehouse, error) {
	var list []*models.Warehouse
	err := r.db.WithContext(ctx).Where("establishment_id = ?", establishmentID).Find(&list).Error
	return list, err
}

func (r *warehouseRepository) GetWarehouseByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Warehouse, error) {
	var w models.Warehouse
	q := r.db.WithContext(ctx)
	if establishmentID != nil {
		q = q.Where("establishment_id = ?", *establishmentID)
	}
	err := q.First(&w, "id = ?", id).Error
	return &w, err
}

func (r *warehouseRepository) UpdateWarehouse(ctx context.Context, w *models.Warehouse) error {
	return r.db.WithContext(ctx).Save(w).Error
}

func (r *warehouseRepository) DeleteWarehouse(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Warehouse{}, "id = ?", id).Error
}

func (r *warehouseRepository) GetStock(ctx context.Context) ([]*models.Stock, error) {
	var stock []*models.Stock
	err := r.db.WithContext(ctx).Preload("Ingredient").Preload("Product").Preload("Warehouse").Find(&stock).Error
	return stock, err
}

func (r *warehouseRepository) GetStockByWarehouseID(ctx context.Context, warehouseID uuid.UUID) ([]*models.Stock, error) {
	var stock []*models.Stock
	err := r.db.WithContext(ctx).
		Where("warehouse_id = ?", warehouseID).
		Preload("Ingredient").Preload("Product").Preload("Warehouse").
		Find(&stock).Error
	return stock, err
}

func (r *warehouseRepository) GetStockForEstablishment(ctx context.Context, establishmentID uuid.UUID, filter *StockFilter) ([]*models.Stock, error) {
	var stock []*models.Stock
	query := r.db.WithContext(ctx).
		Preload("Ingredient.Category").
		Preload("Product.Category").
		Preload("Warehouse").
		Joins("LEFT JOIN ingredients ON stocks.ingredient_id = ingredients.id").
		Joins("LEFT JOIN products ON stocks.product_id = products.id").
		Where("(ingredients.establishment_id = ? OR products.establishment_id = ?)", establishmentID, establishmentID)

	if filter != nil {
		if filter.WarehouseID != nil {
			query = query.Where("stocks.warehouse_id = ?", *filter.WarehouseID)
		}
		if filter.Search != nil && *filter.Search != "" {
			search := "%" + strings.ToLower(*filter.Search) + "%"
			query = query.Where("LOWER(ingredients.name) LIKE ? OR LOWER(products.name) LIKE ?", search, search)
		}
		if filter.Type != nil {
			switch *filter.Type {
			case "ingredient":
				query = query.Where("stocks.ingredient_id IS NOT NULL")
			case "product":
				query = query.Where("stocks.product_id IS NOT NULL")
			}
		}
		if filter.CategoryID != nil {
			query = query.Where("(ingredients.category_id = ? OR products.category_id = ?)", *filter.CategoryID, *filter.CategoryID)
		}
	}

	err := query.Find(&stock).Error
	return stock, err
}

func (r *warehouseRepository) GetStockByIngredientID(ctx context.Context, ingredientID uuid.UUID) ([]*models.Stock, error) {
	var stock []*models.Stock
	err := r.db.WithContext(ctx).
		Where("ingredient_id = ?", ingredientID).
		Preload("Ingredient").Preload("Warehouse").
		Find(&stock).Error
	return stock, err
}

func (r *warehouseRepository) GetStockByIngredientAndWarehouse(ctx context.Context, ingredientID, warehouseID uuid.UUID) (*models.Stock, error) {
	var stock models.Stock
	err := r.db.WithContext(ctx).
		Where("ingredient_id = ? AND warehouse_id = ?", ingredientID, warehouseID).
		Preload("Ingredient").Preload("Warehouse").
		First(&stock).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &stock, err
}

func (r *warehouseRepository) GetStockByProductAndWarehouse(ctx context.Context, productID, warehouseID uuid.UUID) (*models.Stock, error) {
	var stock models.Stock
	err := r.db.WithContext(ctx).
		Where("product_id = ? AND warehouse_id = ?", productID, warehouseID).
		Preload("Product").Preload("Warehouse").
		First(&stock).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &stock, err
}

func (r *warehouseRepository) CreateStock(ctx context.Context, stock *models.Stock) error {
	return r.db.WithContext(ctx).Create(stock).Error
}

func (r *warehouseRepository) GetStockByID(ctx context.Context, id uuid.UUID) (*models.Stock, error) {
	var stock models.Stock
	err := r.db.WithContext(ctx).
		Preload("Ingredient.Category").
		Preload("Product.Category").
		Preload("Warehouse").
		First(&stock, "id = ?", id).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &stock, err
}

func (r *warehouseRepository) UpdateStock(ctx context.Context, stock *models.Stock) error {
	return r.db.WithContext(ctx).Save(stock).Error
}

func (r *warehouseRepository) UpdateStockLimit(ctx context.Context, id uuid.UUID, limit float64) error {
	return r.db.WithContext(ctx).
		Model(&models.Stock{}).
		Where("id = ?", id).
		Update("limit", limit).Error
}

func (r *warehouseRepository) CreateSupply(ctx context.Context, supply *models.Supply) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(supply).Error; err != nil {
			return err
		}
		for i := range supply.Items {
			supply.Items[i].SupplyID = supply.ID
		}
		if len(supply.Items) > 0 {
			if err := tx.Create(&supply.Items).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *warehouseRepository) GetSuppliesByIngredientOrProduct(ctx context.Context, establishmentID uuid.UUID, ingredientID *uuid.UUID, productID *uuid.UUID) ([]*models.Supply, error) {
	// Сначала находим ID поставок, которые содержат нужный ингредиент или товар
	var supplyIDs []uuid.UUID
	subQuery := r.db.WithContext(ctx).
		Model(&models.SupplyItem{}).
		Select("supply_id").
		Where("supply_id IN (SELECT id FROM supplies WHERE warehouse_id IN (SELECT id FROM warehouses WHERE establishment_id = ?))", establishmentID)

	if ingredientID != nil {
		subQuery = subQuery.Where("ingredient_id = ?", *ingredientID)
	}
	if productID != nil {
		subQuery = subQuery.Where("product_id = ?", *productID)
	}

	if err := subQuery.Distinct().Pluck("supply_id", &supplyIDs).Error; err != nil {
		return nil, err
	}

	if len(supplyIDs) == 0 {
		return []*models.Supply{}, nil
	}

	// Затем загружаем полные данные поставок
	var supplies []*models.Supply
	err := r.db.WithContext(ctx).
		Preload("Warehouse").
		Preload("Supplier").
		Preload("Items.Ingredient").
		Preload("Items.Product").
		Where("id IN ?", supplyIDs).
		Order("delivery_date_time DESC").
		Find(&supplies).Error

	return supplies, err
}

func (r *warehouseRepository) CreateWriteOff(ctx context.Context, writeOff *models.WriteOff) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(writeOff).Error; err != nil {
			return err
		}
		for i := range writeOff.Items {
			writeOff.Items[i].WriteOffID = writeOff.ID
		}
		if len(writeOff.Items) > 0 {
			if err := tx.Create(&writeOff.Items).Error; err != nil {
				return err
			}
		}
		return nil
	})
}