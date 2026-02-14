package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Shift представляет смену в заведении
// Одна смена может иметь несколько сессий сотрудников
type Shift struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID          uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;index"`
	User            *User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	EstablishmentID uuid.UUID      `json:"establishment_id" gorm:"type:uuid;not null;index"`
	Establishment   *Establishment `json:"establishment,omitempty" gorm:"foreignKey:EstablishmentID"`
	StartTime       time.Time      `json:"start_time" gorm:"not null"`
	EndTime         *time.Time     `json:"end_time,omitempty"`
	InitialCash     float64        `json:"initial_cash" gorm:"not null"`
	FinalCash       *float64       `json:"final_cash,omitempty"`
	LeaveCash       *float64       `json:"leave_cash,omitempty"` // Сумма, оставленная в кассе для следующей смены
	CashAmount      float64        `json:"cash_amount" gorm:"default:0"` // Сумма наличных оплат за смену
	CardAmount      float64        `json:"card_amount" gorm:"default:0"` // Сумма оплат картой за смену
	Shortage        *float64       `json:"shortage,omitempty"`          // Недостача при закрытии смены
	Comment         *string        `json:"comment,omitempty"`
	Sessions        []ShiftSession `json:"sessions,omitempty" gorm:"foreignKey:ShiftID"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (s *Shift) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
