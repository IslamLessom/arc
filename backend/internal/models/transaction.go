package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Transaction представляет транзакцию
type Transaction struct {
	ID            uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	ShiftID       uuid.UUID      `json:"shift_id" gorm:"type:uuid;not null;index"`
	Shift         *Shift         `json:"shift,omitempty" gorm:"foreignKey:ShiftID"`
	OrderID       *uuid.UUID     `json:"order_id,omitempty" gorm:"type:uuid;index"`
	Order         *Order         `json:"order,omitempty" gorm:"foreignKey:OrderID"`
	Type          string         `json:"type" gorm:"not null;index"` // income, expense, transfer
	Category      string         `json:"category" gorm:"index"`
	Amount        float64        `json:"amount" gorm:"not null"`
	Description   string         `json:"description"`
	CreatedAt     time.Time      `json:"created_at" gorm:"index"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (t *Transaction) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}