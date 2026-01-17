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
	CategoryID      uuid.UUID           `json:"category_id" gorm:"type:uuid;not null"`
	Category    *IngredientCategory `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	Name        string         `json:"name" gorm:"not null"`
	Unit        string         `json:"unit" gorm:"not null"` // единица измерения: шт, л, кг
	Barcode     string         `json:"barcode"` // Штрихкод
	
	// Проценты потерь при разных способах приготовления
	LossCleaning   float64     `json:"loss_cleaning" gorm:"default:0"`   // % потерь при очистке
	LossBoiling    float64     `json:"loss_boiling" gorm:"default:0"`     // % потерь при варке
	LossFrying     float64     `json:"loss_frying" gorm:"default:0"`      // % потерь при жарке
	LossStewing    float64     `json:"loss_stewing" gorm:"default:0"`     // % потерь при тушении
	LossBaking     float64     `json:"loss_baking" gorm:"default:0"`      // % потерь при запекании
	
	Active      bool           `json:"active" gorm:"default:true"`
	CreatedAt   time.Time      `json:"created_at"`
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