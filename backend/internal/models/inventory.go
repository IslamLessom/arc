package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// InventoryType тип инвентаризации
type InventoryType string

const (
	InventoryTypeFull     InventoryType = "full"     // Полная инвентаризация
	InventoryTypePartial InventoryType = "partial"  // Частичная инвентаризация
)

// InventoryStatus статус инвентаризации
type InventoryStatus string

const (
	InventoryStatusDraft     InventoryStatus = "draft"     // Черновик
	InventoryStatusInProgress InventoryStatus = "in_progress" // В процессе
	InventoryStatusCompleted InventoryStatus = "completed" // Завершена
	InventoryStatusCancelled InventoryStatus = "cancelled" // Отменена
)

// Inventory представляет инвентаризацию
type Inventory struct {
	ID               uuid.UUID        `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EstablishmentID  uuid.UUID        `json:"establishment_id" gorm:"type:uuid;not null;index"`
	Establishment    *Establishment   `json:"establishment,omitempty" gorm:"foreignKey:EstablishmentID"`
	WarehouseID      uuid.UUID        `json:"warehouse_id" gorm:"type:uuid;not null;index"`
	Warehouse        *Warehouse       `json:"warehouse,omitempty" gorm:"foreignKey:WarehouseID"`
	Type             InventoryType    `json:"type" gorm:"not null;index"`                              // full, partial
	Status           InventoryStatus  `json:"status" gorm:"not null;index;default:'draft'"`            // draft, in_progress, completed, cancelled
	ScheduledDate    *time.Time       `json:"scheduled_date"`                                          // Запланированная дата проведения (для задним числом)
	ActualDate       *time.Time       `json:"actual_date"`                                             // Фактическая дата проведения
	Comment          string           `json:"comment"`                                                 // Комментарий
	Items            []InventoryItem  `json:"items,omitempty" gorm:"foreignKey:InventoryID;constraint:OnDelete:CASCADE"`
	CreatedBy        *uuid.UUID       `json:"created_by,omitempty" gorm:"type:uuid"`
	CompletedBy      *uuid.UUID       `json:"completed_by,omitempty" gorm:"type:uuid"`
	CreatedAt        time.Time        `json:"created_at" gorm:"index"`
	UpdatedAt        time.Time        `json:"updated_at"`
	DeletedAt        gorm.DeletedAt   `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (i *Inventory) BeforeCreate(tx *gorm.DB) error {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return nil
}

// InventoryItemType тип элемента инвентаризации
type InventoryItemType string

const (
	InventoryItemTypeIngredient    InventoryItemType = "ingredient"    // Ингредиент
	InventoryItemTypeProduct       InventoryItemType = "product"       // Товар (блюдо)
	InventoryItemTypeTechCard      InventoryItemType = "tech_card"     // Технологическая карта
	InventoryItemTypeSemiFinished  InventoryItemType = "semi_finished" // Полуфабрикат
)

// InventoryItem представляет позицию инвентаризации
type InventoryItem struct {
	ID               uuid.UUID          `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	InventoryID      uuid.UUID          `json:"inventory_id" gorm:"type:uuid;not null;index"`
	Inventory        *Inventory         `json:"inventory,omitempty" gorm:"foreignKey:InventoryID"`
	Type             InventoryItemType  `json:"type" gorm:"not null;index"`                            // ingredient, product, tech_card, semi_finished
	IngredientID     *uuid.UUID         `json:"ingredient_id,omitempty" gorm:"type:uuid;index"`
	Ingredient       *Ingredient        `json:"ingredient,omitempty" gorm:"foreignKey:IngredientID"`
	ProductID        *uuid.UUID         `json:"product_id,omitempty" gorm:"type:uuid;index"`
	Product          *Product           `json:"product,omitempty" gorm:"foreignKey:ProductID"`
	TechCardID       *uuid.UUID         `json:"tech_card_id,omitempty" gorm:"type:uuid;index"`
	TechCard         *TechCard          `json:"tech_card,omitempty" gorm:"foreignKey:TechCardID"`
	SemiFinishedID   *uuid.UUID         `json:"semi_finished_id,omitempty" gorm:"type:uuid;index"`
	SemiFinished     *Product           `json:"semi_finished,omitempty" gorm:"foreignKey:SemiFinishedID"`
	ExpectedQuantity float64            `json:"expected_quantity" gorm:"not null"` // Ожидаемое количество (по системе)
	ActualQuantity   float64            `json:"actual_quantity"`                   // Фактическое количество (после подсчета)
	Unit             string             `json:"unit" gorm:"not null"`              // Единица измерения
	PricePerUnit     float64            `json:"price_per_unit" gorm:"default:0"`   // Цена за единицу (себестоимость)
	Difference       float64            `json:"difference" gorm:"default:0"`       // Разница (actual - expected)
	DifferenceValue  float64            `json:"difference_value" gorm:"default:0"` // Стоимость разницы
	Comment          string             `json:"comment"`                           // Комментарий
	CreatedAt        time.Time          `json:"created_at"`
	UpdatedAt        time.Time          `json:"updated_at"`
}

// BeforeCreate hook для автоматической генерации UUID
func (ii *InventoryItem) BeforeCreate(tx *gorm.DB) error {
	if ii.ID == uuid.Nil {
		ii.ID = uuid.New()
	}
	return nil
}
