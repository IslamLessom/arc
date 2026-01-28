package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Ingredient представляет ингредиент
type Ingredient struct {
	ID              uuid.UUID           `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EstablishmentID uuid.UUID           `json:"establishment_id" gorm:"type:uuid;not null;index"`
	Establishment   *Establishment       `json:"establishment,omitempty" gorm:"foreignKey:EstablishmentID"`
	CategoryID      uuid.UUID           `json:"category_id" gorm:"type:uuid;not null;index"`
	Category    *IngredientCategory `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	Name        string         `json:"name" gorm:"not null;index"`
	Unit        string         `json:"unit" gorm:"not null"` // единица измерения: шт, л, кг
	Barcode     string         `json:"barcode"` // Штрихкод
	
	// Проценты потерь при разных способах приготовления
	LossCleaning   float64     `json:"loss_cleaning" gorm:"default:0"`   // % потерь при очистке
	LossBoiling    float64     `json:"loss_boiling" gorm:"default:0"`     // % потерь при варке
	LossFrying     float64     `json:"loss_frying" gorm:"default:0"`      // % потерь при жарке
	LossStewing    float64     `json:"loss_stewing" gorm:"default:0"`     // % потерь при тушении
	LossBaking     float64     `json:"loss_baking" gorm:"default:0"`      // % потерь при запекании
	
	Active      bool           `json:"active" gorm:"default:true;index"`
	CreatedAt   time.Time      `json:"created_at" gorm:"index"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

// ValidUnits возвращает список допустимых единиц измерения
func ValidIngredientUnits() []string {
	return []string{"шт", "л", "кг"}
}

// ValidateUnit проверяет, является ли единица измерения допустимой
func (i *Ingredient) ValidateUnit() bool {
	validUnits := ValidIngredientUnits()
	for _, unit := range validUnits {
		if i.Unit == unit {
			return true
		}
	}
	return false
}

// BeforeCreate hook для автоматической генерации UUID
func (i *Ingredient) BeforeCreate(tx *gorm.DB) error {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return nil
}

// IngredientCategory представляет категорию ингредиентов
type IngredientCategory struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EstablishmentID uuid.UUID      `json:"establishment_id" gorm:"type:uuid;not null;index"`
	Establishment   *Establishment `json:"establishment,omitempty" gorm:"foreignKey:EstablishmentID"`
	Name            string         `json:"name" gorm:"not null"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (ic *IngredientCategory) BeforeCreate(tx *gorm.DB) error {
	if ic.ID == uuid.Nil {
		ic.ID = uuid.New()
	}
	return nil
}

// IngredientCategoryWithStats представляет категорию ингредиентов со статистикой
type IngredientCategoryWithStats struct {
	ID              uuid.UUID      `json:"id"`
	EstablishmentID uuid.UUID      `json:"establishment_id"`
	Name            string         `json:"name"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	// Дополнительная статистика
	IngredientsCount int                `json:"ingredients_count"`
	TotalStock       []WarehouseStockInfo `json:"total_stock"`
}

// WarehouseStockInfo представляет информацию об остатках на складе
type WarehouseStockInfo struct {
	WarehouseID uuid.UUID `json:"warehouse_id"`
	WarehouseName string  `json:"warehouse_name"`
	TotalQuantity  float64 `json:"total_quantity"`
	Unit          string  `json:"unit"` // основная единица измерения (может быть несколько)
}