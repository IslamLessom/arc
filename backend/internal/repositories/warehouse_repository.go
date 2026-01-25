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

	// Product and TechCard retrievals
	GetProductByID(ctx context.Context, id uuid.UUID) (*models.Product, error)
	GetTechCardByID(ctx context.Context, id uuid.UUID) (*models.TechCard, error)

	// Supply & WriteOff
	CreateSupply(ctx context.Context, supply *models.Supply) error
	DeleteSupply(ctx context.Context, id uuid.UUID) error
	GetSupplyByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Supply, error)
	GetSuppliesByIngredientOrProduct(ctx context.Context, establishmentID uuid.UUID, ingredientID *uuid.UUID, productID *uuid.UUID) ([]*models.Supply, error)
	GetSuppliesByWarehouse(ctx context.Context, establishmentID uuid.UUID, warehouseID *uuid.UUID) ([]*models.Supply, error)
	CreateWriteOff(ctx context.Context, writeOff *models.WriteOff) error
	GetWriteOffsByWarehouse(ctx context.Context, establishmentID uuid.UUID, warehouseID *uuid.UUID) ([]*models.WriteOff, error)
	GetWriteOffByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.WriteOff, error)
}

type warehouseRepository struct {
	db *gorm.DB
}

func NewWarehouseRepository(db *gorm.DB) WarehouseRepository {
	return &warehouseRepository{db: db}
}

func (r *warehouseRepository) GetProductByID(ctx context.Context, id uuid.UUID) (*models.Product, error) {
	var product models.Product
	err := r.db.WithContext(ctx).First(&product, "id = ?", id).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &product, err
}

func (r *warehouseRepository) GetTechCardByID(ctx context.Context, id uuid.UUID) (*models.TechCard, error) {
	var techCard models.TechCard
	err := r.db.WithContext(ctx).First(&techCard, "id = ?", id).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &techCard, err
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
		// Используем INNER JOIN вместо LEFT JOIN для лучшей производительности
		// и фильтруем по establishment_id сразу в JOIN
		Joins("LEFT JOIN ingredients ON stocks.ingredient_id = ingredients.id AND ingredients.establishment_id = ?", establishmentID).
		Joins("LEFT JOIN products ON stocks.product_id = products.id AND products.establishment_id = ?", establishmentID).
		Where("(stocks.ingredient_id IS NOT NULL AND ingredients.id IS NOT NULL) OR (stocks.product_id IS NOT NULL AND products.id IS NOT NULL)")

	if filter != nil {
		if filter.WarehouseID != nil {
			query = query.Where("stocks.warehouse_id = ?", *filter.WarehouseID)
		}
		if filter.Search != nil && *filter.Search != "" {
			search := "%" + strings.ToLower(*filter.Search) + "%"
			// Оптимизация: используем COALESCE для объединения условий поиска
			query = query.Where("COALESCE(LOWER(ingredients.name), LOWER(products.name)) LIKE ?", search)
		}
		if filter.Type != nil {
			switch *filter.Type {
			case "ingredient":
				query = query.Where("stocks.ingredient_id IS NOT NULL AND ingredients.id IS NOT NULL")
			case "product":
				query = query.Where("stocks.product_id IS NOT NULL AND products.id IS NOT NULL")
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
		// Сохраняем Items во временную переменную и очищаем supply.Items
		// чтобы GORM не пытался создать их автоматически
		items := supply.Items
		supply.Items = nil


		// Создаем Supply без Items
		if err := tx.Create(supply).Error; err != nil {
			return err
		}


		// Теперь создаем элементы по одному с явно установленными UUID
		for i := range items {
			items[i].SupplyID = supply.ID
			// UUID уже должен быть сгенерирован в handler, но на всякий случай проверяем
			if items[i].ID == uuid.Nil {
				items[i].ID = uuid.New()
			}
			if err := tx.Create(&items[i]).Error; err != nil {
				return err
			}
		}


		// Восстанавливаем Items для возврата
		supply.Items = items
		return nil
	})
}

func (r *warehouseRepository) DeleteSupply(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Сначала удаляем связанные SupplyItem
		if err := tx.Where("supply_id = ?", id).Delete(&models.SupplyItem{}).Error; err != nil {
			return err
		}
		// Затем удаляем саму Supply
		return tx.Delete(&models.Supply{}, "id = ?", id).Error
	})
}

func (r *warehouseRepository) GetSupplyByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Supply, error) {
	var supply models.Supply
	query := r.db.WithContext(ctx).
		Preload("Warehouse").
		Preload("Supplier").
		Preload("Items.Ingredient").
		Preload("Items.Product").
		Joins("JOIN warehouses ON supplies.warehouse_id = warehouses.id").
		Where("supplies.id = ?", id)

	if establishmentID != nil {
		query = query.Where("warehouses.establishment_id = ?", *establishmentID)
	}

	err := query.First(&supply).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &supply, err
}

func (r *warehouseRepository) GetSuppliesByIngredientOrProduct(ctx context.Context, establishmentID uuid.UUID, ingredientID *uuid.UUID, productID *uuid.UUID) ([]*models.Supply, error) {
	// Оптимизированный запрос с JOIN вместо вложенных подзапросов
	var supplies []*models.Supply
	query := r.db.WithContext(ctx).
		Model(&models.Supply{}).
		Preload("Warehouse").
		Preload("Supplier").
		Preload("Items.Ingredient").
		Preload("Items.Product").
		Joins("JOIN warehouses ON supplies.warehouse_id = warehouses.id").
		Joins("JOIN supply_items ON supplies.id = supply_items.supply_id").
		Where("warehouses.establishment_id = ?", establishmentID)

	if ingredientID != nil {
		query = query.Where("supply_items.ingredient_id = ?", *ingredientID)
	}
	if productID != nil {
		query = query.Where("supply_items.product_id = ?", *productID)
	}

	err := query.
		Group("supplies.id").
		Order("supplies.delivery_date_time DESC").
		Find(&supplies).Error

	return supplies, err
}

func (r *warehouseRepository) GetSuppliesByWarehouse(ctx context.Context, establishmentID uuid.UUID, warehouseID *uuid.UUID) ([]*models.Supply, error) {
	query := r.db.WithContext(ctx).
		Model(&models.Supply{}).
		Preload("Warehouse").
		Preload("Supplier").
		Preload("Items.Ingredient").
		Preload("Items.Product").
		Joins("JOIN warehouses ON supplies.warehouse_id = warehouses.id").
		Where("warehouses.establishment_id = ?", establishmentID)
	
	if warehouseID != nil {
		query = query.Where("supplies.warehouse_id = ?", *warehouseID)
	}
	
	var supplies []*models.Supply
	err := query.Order("supplies.delivery_date_time DESC").Find(&supplies).Error
	return supplies, err
}

func (r *warehouseRepository) CreateWriteOff(ctx context.Context, writeOff *models.WriteOff) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Сохраняем Items во временную переменную и очищаем writeOff.Items
		// чтобы GORM не пытался создать их автоматически
		items := writeOff.Items
		writeOff.Items = nil
		
		// Создаем WriteOff без Items
		if err := tx.Create(writeOff).Error; err != nil {
			return err
		}
		
		// Теперь создаем элементы по одному с явно установленными UUID
		for i := range items {
			items[i].WriteOffID = writeOff.ID
			// UUID уже должен быть сгенерирован в handler, но на всякий случай проверяем
			if items[i].ID == uuid.Nil {
				items[i].ID = uuid.New()
			}
			if err := tx.Create(&items[i]).Error; err != nil {
				return err
			}
		}
		
		// Восстанавливаем Items для возврата
		writeOff.Items = items
		return nil
	})
}

func (r *warehouseRepository) GetWriteOffsByWarehouse(ctx context.Context, establishmentID uuid.UUID, warehouseID *uuid.UUID) ([]*models.WriteOff, error) {
	query := r.db.WithContext(ctx).
		Model(&models.WriteOff{}).
		Preload("Warehouse").
		Preload("Items.Ingredient").
		Preload("Items.Product").
		Joins("JOIN warehouses ON write_offs.warehouse_id = warehouses.id").
		Where("warehouses.establishment_id = ?", establishmentID)
	
	if warehouseID != nil {
		query = query.Where("write_offs.warehouse_id = ?", *warehouseID)
	}
	
	var writeOffs []*models.WriteOff
	err := query.Order("write_offs.write_off_date_time DESC").Find(&writeOffs).Error
	return writeOffs, err
}

func (r *warehouseRepository) GetWriteOffByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.WriteOff, error) {
	var writeOff models.WriteOff
	query := r.db.WithContext(ctx).
		Preload("Warehouse").
		Preload("Items.Ingredient").
		Preload("Items.Product").
		Joins("JOIN warehouses ON write_offs.warehouse_id = warehouses.id").
		Where("write_offs.id = ?", id)
	
	if establishmentID != nil {
		query = query.Where("warehouses.establishment_id = ?", *establishmentID)
	}
	
	err := query.First(&writeOff, "write_offs.id = ?", id).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &writeOff, err
}