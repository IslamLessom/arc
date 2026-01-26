package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SemiFinishedProduct представляет полуфабрикат (промежуточный продукт)
type SemiFinishedProduct struct {
	ID              uuid.UUID                `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EstablishmentID uuid.UUID                `json:"establishment_id" gorm:"type:uuid;not null;index"`
	Establishment   *Establishment           `json:"establishment,omitempty" gorm:"foreignKey:EstablishmentID"`
	CategoryID      *uuid.UUID               `json:"category_id,omitempty" gorm:"type:uuid;index"`
	Category        *Category                `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	WorkshopID      *uuid.UUID               `json:"workshop_id,omitempty" gorm:"type:uuid;index"`
	Workshop        *Workshop                `json:"workshop,omitempty" gorm:"foreignKey:WorkshopID"`
	Name            string                   `json:"name" gorm:"not null"`
	Description     string                   `json:"description"`
	CookingProcess  string                   `json:"cooking_process"`

	// Изображение
	CoverImage      string                   `json:"cover_image"`

	// Единицы измерения для выхода
	Unit            string                   `json:"unit" gorm:"not null"` // kg, gram, liter, ml, piece
	Quantity        float64                  `json:"quantity" gorm:"default:0"` // Выход продукта

	// Себестоимость
	CostPrice       float64                  `json:"cost_price" gorm:"default:0"`

	Active          bool                     `json:"active" gorm:"default:true;index"`
	Ingredients     []SemiFinishedIngredient `json:"ingredients,omitempty" gorm:"foreignKey:SemiFinishedID"`
	CreatedAt       time.Time                `json:"created_at" gorm:"index"`
	UpdatedAt       time.Time                `json:"updated_at"`
	DeletedAt       gorm.DeletedAt           `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (sfp *SemiFinishedProduct) BeforeCreate(tx *gorm.DB) error {
	if sfp.ID == uuid.Nil {
		sfp.ID = uuid.New()
	}
	return nil
}

// SemiFinishedIngredient представляет связь полуфабриката с ингредиентами
type SemiFinishedIngredient struct {
	ID                uuid.UUID    `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	SemiFinishedID    uuid.UUID    `json:"semi_finished_id" gorm:"type:uuid;not null"`
	SemiFinished      *SemiFinishedProduct `json:"semi_finished,omitempty" gorm:"foreignKey:SemiFinishedID"`
	IngredientID      uuid.UUID    `json:"ingredient_id" gorm:"type:uuid;not null"`
	Ingredient        *Ingredient  `json:"ingredient,omitempty" gorm:"foreignKey:IngredientID"`
	PreparationMethod *string     `json:"preparation_method"` // cleaning, boiling, frying, stewing, baking
	Gross             float64      `json:"gross" gorm:"not null"` // Брутто
	Net               float64      `json:"net" gorm:"not null"` // Нетто
	Unit              string       `json:"unit" gorm:"not null"` // г, мл, шт
	CreatedAt         time.Time    `json:"created_at"`
	UpdatedAt         time.Time    `json:"updated_at"`
}

// BeforeCreate hook для автоматической генерации UUID
func (sfi *SemiFinishedIngredient) BeforeCreate(tx *gorm.DB) error {
	if sfi.ID == uuid.Nil {
		sfi.ID = uuid.New()
	}
	return nil
}
