package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Transaction представляет транзакцию (доход или расход денег заведения)
type Transaction struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EstablishmentID uuid.UUID      `json:"establishment_id" gorm:"type:uuid;not null;index"`
	Establishment   *Establishment `json:"establishment,omitempty" gorm:"foreignKey:EstablishmentID"`
	AccountID       uuid.UUID      `json:"account_id" gorm:"type:uuid;not null;index"` // Счет транзакции
	Account         *Account       `json:"account,omitempty" gorm:"foreignKey:AccountID"`
	ShiftID         *uuid.UUID     `json:"shift_id,omitempty" gorm:"type:uuid;index"` // Опционально: связанная смена
	Shift           *Shift        `json:"shift,omitempty" gorm:"foreignKey:ShiftID"`
	OrderID         *uuid.UUID     `json:"order_id,omitempty" gorm:"type:uuid;index"` // Опционально: связанный заказ
	Order           *Order         `json:"order,omitempty" gorm:"foreignKey:OrderID"`
	Type            string         `json:"type" gorm:"not null;index"`                  // income, expense, transfer
	Category        string         `json:"category" gorm:"index"`                      // Категория транзакции
	Amount          float64        `json:"amount" gorm:"not null"`                     // Сумма транзакции
	Description     string         `json:"description"`                                // Описание/комментарий
	TransactionDate time.Time      `json:"transaction_date" gorm:"not null;index"`     // Дата транзакции (может отличаться от created_at)
	CreatedAt       time.Time      `json:"created_at" gorm:"index"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (t *Transaction) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}