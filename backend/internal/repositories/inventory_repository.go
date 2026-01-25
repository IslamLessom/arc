package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

// InventoryFilter фильтр для списка инвентаризаций
type InventoryFilter struct {
	EstablishmentID *uuid.UUID
	WarehouseID     *uuid.UUID
	Type            *models.InventoryType
	Status          *models.InventoryStatus
}

// InventoryRepository интерфейс репозитория инвентаризаций
type InventoryRepository interface {
	// Inventory CRUD
	Create(ctx context.Context, inventory *models.Inventory) error
	GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Inventory, error)
	List(ctx context.Context, filter *InventoryFilter) ([]*models.Inventory, error)
	Update(ctx context.Context, inventory *models.Inventory) error
	Delete(ctx context.Context, id uuid.UUID) error
	UpdateStatus(ctx context.Context, id uuid.UUID, status models.InventoryStatus) error

	// Inventory Items
	CreateItem(ctx context.Context, item *models.InventoryItem) error
	UpdateItem(ctx context.Context, item *models.InventoryItem) error
	DeleteItem(ctx context.Context, id uuid.UUID) error
	GetItemsByInventoryID(ctx context.Context, inventoryID uuid.UUID) ([]*models.InventoryItem, error)

	// Stock snapshot - получение остатков на определенную дату
	GetStockSnapshot(ctx context.Context, warehouseID uuid.UUID, date *time.Time) ([]*models.Stock, error)
}

type inventoryRepository struct {
	db *gorm.DB
}

func NewInventoryRepository(db *gorm.DB) InventoryRepository {
	return &inventoryRepository{db: db}
}

func (r *inventoryRepository) Create(ctx context.Context, inventory *models.Inventory) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		items := inventory.Items
		inventory.Items = nil

		if err := tx.Create(inventory).Error; err != nil {
			return err
		}

		for i := range items {
			items[i].InventoryID = inventory.ID
			if items[i].ID == uuid.Nil {
				items[i].ID = uuid.New()
			}
			if err := tx.Create(&items[i]).Error; err != nil {
				return err
			}
		}

		inventory.Items = items
		return nil
	})
}

func (r *inventoryRepository) GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Inventory, error) {
	var inventory models.Inventory
	query := r.db.WithContext(ctx).
		Preload("Warehouse").
		Preload("Items.Ingredient").
		Preload("Items.Product").
		Preload("Items.TechCard").
		Preload("Items.SemiFinished")

	if establishmentID != nil {
		query = query.Where("establishment_id = ?", *establishmentID)
	}

	err := query.First(&inventory, "id = ?", id).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &inventory, err
}

func (r *inventoryRepository) List(ctx context.Context, filter *InventoryFilter) ([]*models.Inventory, error) {
	var inventories []*models.Inventory
	query := r.db.WithContext(ctx).
		Preload("Warehouse").
		Preload("Items")

	if filter != nil {
		if filter.EstablishmentID != nil {
			query = query.Where("establishment_id = ?", *filter.EstablishmentID)
		}
		if filter.WarehouseID != nil {
			query = query.Where("warehouse_id = ?", *filter.WarehouseID)
		}
		if filter.Type != nil {
			query = query.Where("type = ?", *filter.Type)
		}
		if filter.Status != nil {
			query = query.Where("status = ?", *filter.Status)
		}
	}

	err := query.Order("created_at DESC").Find(&inventories).Error
	return inventories, err
}

func (r *inventoryRepository) Update(ctx context.Context, inventory *models.Inventory) error {
	return r.db.WithContext(ctx).Save(inventory).Error
}

func (r *inventoryRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Inventory{}, "id = ?", id).Error
}

func (r *inventoryRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status models.InventoryStatus) error {
	return r.db.WithContext(ctx).
		Model(&models.Inventory{}).
		Where("id = ?", id).
		Update("status", status).Error
}

func (r *inventoryRepository) CreateItem(ctx context.Context, item *models.InventoryItem) error {
	return r.db.WithContext(ctx).Create(item).Error
}

func (r *inventoryRepository) UpdateItem(ctx context.Context, item *models.InventoryItem) error {
	return r.db.WithContext(ctx).Save(item).Error
}

func (r *inventoryRepository) DeleteItem(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.InventoryItem{}, "id = ?", id).Error
}

func (r *inventoryRepository) GetItemsByInventoryID(ctx context.Context, inventoryID uuid.UUID) ([]*models.InventoryItem, error) {
	var items []*models.InventoryItem
	err := r.db.WithContext(ctx).
		Preload("Ingredient").
		Preload("Product").
		Preload("TechCard").
		Preload("SemiFinished").
		Where("inventory_id = ?", inventoryID).
		Find(&items).Error
	return items, err
}

func (r *inventoryRepository) GetStockSnapshot(ctx context.Context, warehouseID uuid.UUID, date *time.Time) ([]*models.Stock, error) {
	var stock []*models.Stock
	query := r.db.WithContext(ctx).
		Preload("Ingredient").
		Preload("Product").
		Where("warehouse_id = ?", warehouseID)

	if date != nil {
		query = query.Where("updated_at <= ?", date)
	}

	err := query.Find(&stock).Error
	return stock, err
}
