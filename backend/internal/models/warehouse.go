package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Warehouse представляет склад
type Warehouse struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EstablishmentID uuid.UUID      `json:"establishment_id" gorm:"type:uuid;not null;index"`
	Establishment   *Establishment `json:"establishment,omitempty" gorm:"foreignKey:EstablishmentID"`
	Name            string         `json:"name" gorm:"not null"`
	Address   string         `json:"address"`
	Active    bool           `json:"active" gorm:"default:true"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (w *Warehouse) BeforeCreate(tx *gorm.DB) error {
	if w.ID == uuid.Nil {
		w.ID = uuid.New()
	}
	return nil
}

// Stock представляет остатки на складе
type Stock struct {
	ID          uuid.UUID    `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	WarehouseID uuid.UUID    `json:"warehouse_id" gorm:"type:uuid;not null"`
	Warehouse   *Warehouse   `json:"warehouse,omitempty" gorm:"foreignKey:WarehouseID"`
	IngredientID *uuid.UUID  `json:"ingredient_id,omitempty" gorm:"type:uuid"`
	Ingredient   *Ingredient `json:"ingredient,omitempty" gorm:"foreignKey:IngredientID"`
	ProductID    *uuid.UUID  `json:"product_id,omitempty" gorm:"type:uuid"`
	Product      *Product    `json:"product,omitempty" gorm:"foreignKey:ProductID"`
	Quantity     float64     `json:"quantity" gorm:"not null"`
	Unit         string      `json:"unit" gorm:"not null"`
	PricePerUnit float64     `json:"price_per_unit" gorm:"default:0"` // Цена за единицу измерения (себестоимость)
	Limit        float64     `json:"limit" gorm:"default:0"`           // Лимит остатка (минимальный остаток)
	UpdatedAt    time.Time   `json:"updated_at"`
}

// BeforeCreate hook для автоматической генерации UUID
func (s *Stock) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

// Supply представляет поставку
type Supply struct {
	ID              uuid.UUID    `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	WarehouseID     uuid.UUID    `json:"warehouse_id" gorm:"type:uuid;not null"`
	Warehouse       *Warehouse   `json:"warehouse,omitempty" gorm:"foreignKey:WarehouseID"`
	SupplierID      uuid.UUID    `json:"supplier_id" gorm:"type:uuid;not null"`
	Supplier        *Supplier    `json:"supplier,omitempty" gorm:"foreignKey:SupplierID"`
	DeliveryDateTime time.Time   `json:"delivery_date_time" gorm:"not null"` // Дата и время поставки
	Status          string       `json:"status" gorm:"not null"`              // pending, completed, cancelled
	Comment         string       `json:"comment"`                             // Комментарий
	Items           []SupplyItem  `json:"items,omitempty" gorm:"foreignKey:SupplyID"`
	CreatedAt       time.Time    `json:"created_at"`
	UpdatedAt       time.Time    `json:"updated_at"`
}

// BeforeCreate hook для автоматической генерации UUID
func (s *Supply) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

// SupplyItem представляет позицию поставки
type SupplyItem struct {
	ID          uuid.UUID   `json:"id" gorm:"type:uuid;primaryKey"` // UUID генерируется в коде, не используем default
	SupplyID    uuid.UUID   `json:"supply_id" gorm:"type:uuid;not null"`
	IngredientID *uuid.UUID `json:"ingredient_id,omitempty" gorm:"type:uuid"`
	Ingredient   *Ingredient `json:"ingredient,omitempty" gorm:"foreignKey:IngredientID"`
	ProductID    *uuid.UUID `json:"product_id,omitempty" gorm:"type:uuid"`
	Product      *Product   `json:"product,omitempty" gorm:"foreignKey:ProductID"`
	Quantity     float64   `json:"quantity" gorm:"not null"`
	Unit         string    `json:"unit" gorm:"not null"`
	PricePerUnit float64   `json:"price_per_unit" gorm:"default:0"` // Цена за единицу измерения
	TotalAmount  float64   `json:"total_amount" gorm:"default:0"`   // Общая сумма (цена за единицу * количество)
	CreatedAt    time.Time `json:"created_at"`
}

// BeforeCreate hook для автоматической генерации UUID
func (si *SupplyItem) BeforeCreate(tx *gorm.DB) error {
	if si.ID == uuid.Nil {
		si.ID = uuid.New()
	}
	return nil
}

// WriteOff представляет списание товаров
type WriteOff struct {
	ID               uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	WarehouseID      uuid.UUID      `json:"warehouse_id" gorm:"type:uuid;not null"`
	Warehouse        *Warehouse     `json:"warehouse,omitempty" gorm:"foreignKey:WarehouseID"`
	WriteOffDateTime time.Time      `json:"write_off_date_time" gorm:"not null"` // Дата и время списания
	Reason           string         `json:"reason"`                               // Причина списания
	Comment          string         `json:"comment"`                              // Комментарий
	Items            []WriteOffItem `json:"items,omitempty" gorm:"foreignKey:WriteOffID"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (wo *WriteOff) BeforeCreate(tx *gorm.DB) error {
	if wo.ID == uuid.Nil {
		wo.ID = uuid.New()
	}
	return nil
}

// WriteOffItem представляет позицию списания
type WriteOffItem struct {
	ID           uuid.UUID   `json:"id" gorm:"type:uuid;primaryKey"` // UUID генерируется в коде, не используем default
	WriteOffID   uuid.UUID   `json:"write_off_id" gorm:"type:uuid;not null"`
	IngredientID *uuid.UUID  `json:"ingredient_id,omitempty" gorm:"type:uuid"`
	Ingredient   *Ingredient `json:"ingredient,omitempty" gorm:"foreignKey:IngredientID"`
	ProductID    *uuid.UUID  `json:"product_id,omitempty" gorm:"type:uuid"`
	Product      *Product    `json:"product,omitempty" gorm:"foreignKey:ProductID"`
	Quantity     float64     `json:"quantity" gorm:"not null"`
	Unit         string      `json:"unit" gorm:"not null"`
	Details      string      `json:"details"` // Детали списания
	CreatedAt    time.Time   `json:"created_at"`
}

// BeforeCreate hook для автоматической генерации UUID
func (woi *WriteOffItem) BeforeCreate(tx *gorm.DB) error {
	if woi.ID == uuid.Nil {
		woi.ID = uuid.New()
	}
	return nil
}

// Supplier представляет поставщика
type Supplier struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EstablishmentID uuid.UUID      `json:"establishment_id" gorm:"type:uuid;not null;index"`
	Establishment   *Establishment `json:"establishment,omitempty" gorm:"foreignKey:EstablishmentID"`
	Name            string         `json:"name" gorm:"not null"`
	TaxpayerNumber  string         `json:"taxpayer_number"` // Номер налогоплательщика
	Phone           string         `json:"phone"`
	Address         string         `json:"address"`         // Адрес
	Comment         string         `json:"comment"`         // Комментарий
	Contact         string         `json:"contact"`
	Email           string         `json:"email"`
	Active          bool           `json:"active" gorm:"default:true"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (s *Supplier) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}