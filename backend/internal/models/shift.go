package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Shift представляет смену кассира
type Shift struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID          uuid.UUID      `json:"user_id" gorm:"type:uuid;not null"`
	User            *User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	EstablishmentID uuid.UUID      `json:"establishment_id" gorm:"type:uuid;not null"`
	Establishment   *Establishment `json:"establishment,omitempty" gorm:"foreignKey:EstablishmentID"`
	StartTime       time.Time      `json:"start_time" gorm:"not null"`
	EndTime         *time.Time     `json:"end_time,omitempty"`
	InitialCash     float64        `json:"initial_cash" gorm:"not null"`
	FinalCash       *float64       `json:"final_cash,omitempty"`
	Comment         *string        `json:"comment,omitempty"`
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