package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Product представляет товар из меню
type Product struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EstablishmentID uuid.UUID      `json:"establishment_id" gorm:"type:uuid;not null;index"`
	Establishment   *Establishment `json:"establishment,omitempty" gorm:"foreignKey:EstablishmentID"`
	CategoryID      uuid.UUID      `json:"category_id" gorm:"type:uuid;not null;index"`
	Category    *Category      `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	WorkshopID  *uuid.UUID     `json:"workshop_id,omitempty" gorm:"type:uuid;index"`      // Цех приготовления (может быть null)
	Workshop    *Workshop      `json:"workshop,omitempty" gorm:"foreignKey:WorkshopID"`
	Name        string         `json:"name" gorm:"not null"`
	Description string         `json:"description"`
	
	// Изображение
	CoverImage  string         `json:"cover_image"`                                 // URL к обложке товара
	
	// Опции товара
	IsWeighted         bool   `json:"is_weighted" gorm:"default:false"`             // Весовой товар
	ExcludeFromDiscounts bool `json:"exclude_from_discounts" gorm:"default:false"` // Не участвует в скидках
	HasModifications    bool   `json:"has_modifications" gorm:"default:false"`      // С модификациями (несколько видов товара)
	
	// Штрихкод
	Barcode     string         `json:"barcode"`                                      // Штрихкод товара
	
	// Ценообразование
	CostPrice   float64        `json:"cost_price" gorm:"default:0"`                  // Себестоимость без НДС
	Markup      float64        `json:"markup" gorm:"default:0"`                      // Наценка (%)
	Price       float64        `json:"price" gorm:"not null"`                        // Итоговая цена (себестоимость + наценка)
	
	Active      bool           `json:"active" gorm:"default:true;index"`
	CreatedAt   time.Time      `json:"created_at" gorm:"index"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID и округления значений
func (p *Product) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	// Округляем значения до 2 знаков после запятой
	p.CostPrice = RoundTo2(p.CostPrice)
	p.Markup = RoundTo2(p.Markup)
	p.Price = RoundTo2(p.Price)
	return nil
}

// BeforeUpdate hook для округления значений перед обновлением
func (p *Product) BeforeUpdate(tx *gorm.DB) error {
	// Округляем значения до 2 знаков после запятой
	p.CostPrice = RoundTo2(p.CostPrice)
	p.Markup = RoundTo2(p.Markup)
	p.Price = RoundTo2(p.Price)
	return nil
}

// CalculatePrice вычисляет цену на основе себестоимости и наценки
func (p *Product) CalculatePrice() {
	if p.Markup > 0 {
		p.Price = RoundTo2(p.CostPrice * (1 + p.Markup/100))
	} else {
		// Если наценка не задана, цена = себестоимость (или может быть задана вручную)
		if p.Price == 0 {
			p.Price = RoundTo2(p.CostPrice)
		}
	}
}