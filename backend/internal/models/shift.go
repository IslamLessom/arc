package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Shift представляет кассовую смену
type Shift struct {
	ID            uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EstablishmentID uuid.UUID    `json:"establishment_id" gorm:"type:uuid;not null"`
	Establishment   *Establishment `json:"establishment,omitempty" gorm:"foreignKey:EstablishmentID"`
	EmployeeID      uuid.UUID    `json:"employee_id" gorm:"type:uuid;not null"`
	Employee        *User        `json:"employee,omitempty" gorm:"foreignKey:EmployeeID"`
	OpenedAt        time.Time    `json:"opened_at" gorm:"not null"`
	ClosedAt        *time.Time   `json:"closed_at,omitempty"`
	OpeningBalance  float64      `json:"opening_balance"`
	ClosingBalance  *float64     `json:"closing_balance,omitempty"`
	Status          string       `json:"status" gorm:"not null"` // open, closed
	Transactions    []Transaction `json:"transactions,omitempty" gorm:"foreignKey:ShiftID"`
	CreatedAt       time.Time    `json:"created_at"`
	UpdatedAt       time.Time    `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (s *Shift) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}