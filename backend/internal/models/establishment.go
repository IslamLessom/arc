package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Establishment представляет заведение
type Establishment struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	OwnerID         uuid.UUID      `json:"owner_id" gorm:"type:uuid;not null"`
	Owner           *User          `json:"owner,omitempty" gorm:"foreignKey:OwnerID"`
	Name            string         `json:"name" gorm:"not null"`
	Address         string         `json:"address"`
	Phone           string         `json:"phone"`
	Email           string         `json:"email"`
	
	// Настройки заведения (из опросника при регистрации)
	HasSeatingPlaces bool          `json:"has_seating_places" gorm:"default:false"` // Есть ли сидячие места
	TableCount       *int          `json:"table_count,omitempty"`                     // Количество столов (если есть)
	Type            string         `json:"type"`                                      // Тип заведения: restaurant, cafe, fast_food, bar, etc.
	HasDelivery      bool          `json:"has_delivery" gorm:"default:false"`         // Есть ли доставка
	HasTakeaway      bool          `json:"has_takeaway" gorm:"default:false"`         // Есть ли на вынос
	HasReservations  bool          `json:"has_reservations" gorm:"default:false"`     // Принимаются ли бронирования
	
	// Связи
	Tables          []Table        `json:"tables,omitempty" gorm:"foreignKey:EstablishmentID"`
	
	Active          bool           `json:"active" gorm:"default:true"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (e *Establishment) BeforeCreate(tx *gorm.DB) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}
	return nil
}

// Table представляет стол в заведении (если есть сидячие места)
type Table struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EstablishmentID uuid.UUID      `json:"establishment_id" gorm:"type:uuid;not null;uniqueIndex:idx_table_number_establishment"`
	Establishment   *Establishment `json:"establishment,omitempty" gorm:"foreignKey:EstablishmentID"`
	Number          int            `json:"number" gorm:"not null;uniqueIndex:idx_table_number_establishment"` // Номер стола (уникален в рамках заведения)
	Name            string         `json:"name"`                                                                 // Название стола (опционально)
	Capacity        int            `json:"capacity" gorm:"default:4"`                                           // Вместимость (количество мест)
	
	// Координаты для визуального расположения на схеме зала (в пикселях или процентах)
	PositionX       float64        `json:"position_x" gorm:"default:0"`                                         // X координата на схеме
	PositionY       float64        `json:"position_y" gorm:"default:0"`                                         // Y координата на схеме
	Rotation        float64        `json:"rotation" gorm:"default:0"`                                           // Поворот стола в градусах (0-360)
	
	Status          string         `json:"status" gorm:"default:available"`                                     // available, occupied, reserved
	Active          bool           `json:"active" gorm:"default:true"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (t *Table) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}