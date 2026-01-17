package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// TechCard представляет тех-карту (рецепт)
type TechCard struct {
	ID              uuid.UUID          `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EstablishmentID uuid.UUID          `json:"establishment_id" gorm:"type:uuid;not null;index"`
	Establishment   *Establishment     `json:"establishment,omitempty" gorm:"foreignKey:EstablishmentID"`
	CategoryID      uuid.UUID          `json:"category_id" gorm:"type:uuid;not null"`
	Category      *Category          `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	WorkshopID    *uuid.UUID         `json:"workshop_id,omitempty" gorm:"type:uuid"` // Цех приготовления (может быть null)
	Workshop      *Workshop          `json:"workshop,omitempty" gorm:"foreignKey:WorkshopID"`
	Name          string             `json:"name" gorm:"not null"`
	Description   string             `json:"description"`
	
	// Изображение
	CoverImage    string             `json:"cover_image"` // URL к обложке тех-карты
	
	// Опции тех-карты
	IsWeighted         bool   `json:"is_weighted" gorm:"default:false"`             // Весовая тех-карта
	ExcludeFromDiscounts bool `json:"exclude_from_discounts" gorm:"default:false"` // Не участвует в скидках
	
	// Ценообразование
	CostPrice   float64        `json:"cost_price" gorm:"default:0"`                  // Себестоимость без НДС
	Markup      float64        `json:"markup" gorm:"default:0"`                      // Наценка (%)
	Price       float64        `json:"price" gorm:"not null"`                        // Итоговая цена (себестоимость + наценка)
	
	Active        bool               `json:"active" gorm:"default:true"`
	Ingredients   []TechCardIngredient `json:"ingredients,omitempty" gorm:"foreignKey:TechCardID"`
	ModifierSets  []ModifierSet      `json:"modifier_sets,omitempty" gorm:"foreignKey:TechCardID"`
	CreatedAt     time.Time          `json:"created_at"`
	UpdatedAt     time.Time          `json:"updated_at"`
	DeletedAt     gorm.DeletedAt     `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (tc *TechCard) BeforeCreate(tx *gorm.DB) error {
	if tc.ID == uuid.Nil {
		tc.ID = uuid.New()
	}
	return nil
}

// TechCardIngredient представляет связь тех-карты с ингредиентами
type TechCardIngredient struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	TechCardID   uuid.UUID `json:"tech_card_id" gorm:"type:uuid;not null"`
	IngredientID uuid.UUID `json:"ingredient_id" gorm:"type:uuid;not null"`
	Ingredient   *Ingredient `json:"ingredient,omitempty" gorm:"foreignKey:IngredientID"`
	Quantity     float64   `json:"quantity" gorm:"not null"`
	Unit         string    `json:"unit" gorm:"not null"` // кг, л, шт и т.д.
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// BeforeCreate hook для автоматической генерации UUID
func (tci *TechCardIngredient) BeforeCreate(tx *gorm.DB) error {
	if tci.ID == uuid.Nil {
		tci.ID = uuid.New()
	}
	return nil
}

// CalculatePrice вычисляет цену на основе себестоимости и наценки
func (tc *TechCard) CalculatePrice() {
	if tc.Markup > 0 {
		tc.Price = tc.CostPrice * (1 + tc.Markup/100)
	} else {
		// Если наценка не задана, цена = себестоимость (или может быть задана вручную)
		if tc.Price == 0 {
			tc.Price = tc.CostPrice
		}
	}
}

// ModifierSet представляет набор модификаторов для тех-карты
// Например: размер пиццы (S, M, L) или дополнительные ингредиенты
type ModifierSet struct {
	ID              uuid.UUID         `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	TechCardID      uuid.UUID         `json:"tech_card_id" gorm:"type:uuid;not null"`
	TechCard        *TechCard         `json:"tech_card,omitempty" gorm:"foreignKey:TechCardID"`
	Name            string            `json:"name" gorm:"not null"` // Название набора (например, "Размер пиццы")
	SelectionType   string            `json:"selection_type" gorm:"not null"` // "single" или "multiple"
	MinSelection    int               `json:"min_selection" gorm:"default:0"` // Минимальное количество выбора (для multiple)
	MaxSelection    int               `json:"max_selection" gorm:"default:0"` // Максимальное количество выбора (для multiple, 0 = без ограничений)
	Options         []ModifierOption  `json:"options,omitempty" gorm:"foreignKey:ModifierSetID"`
	CreatedAt       time.Time         `json:"created_at"`
	UpdatedAt       time.Time         `json:"updated_at"`
	DeletedAt       gorm.DeletedAt    `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (ms *ModifierSet) BeforeCreate(tx *gorm.DB) error {
	if ms.ID == uuid.Nil {
		ms.ID = uuid.New()
	}
	return nil
}

// ModifierOption представляет опцию в наборе модификаторов
// Например: "S", "M", "L" для размера или "Дополнительный сироп" для добавок
type ModifierOption struct {
	ID            uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	ModifierSetID uuid.UUID     `json:"modifier_set_id" gorm:"type:uuid;not null"`
	ModifierSet   *ModifierSet   `json:"modifier_set,omitempty" gorm:"foreignKey:ModifierSetID"`
	Name          string         `json:"name" gorm:"not null"` // Название опции (например, "S", "M", "L", "Дополнительный сироп")
	Price         float64        `json:"price" gorm:"default:0"` // Дополнительная цена за эту опцию
	Active        bool           `json:"active" gorm:"default:true"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (mo *ModifierOption) BeforeCreate(tx *gorm.DB) error {
	if mo.ID == uuid.Nil {
		mo.ID = uuid.New()
	}
	return nil
}