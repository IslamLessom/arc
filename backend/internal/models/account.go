package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AccountType представляет тип счета
type AccountType struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"uniqueIndex;not null"` // "безналичный счет", "банковские карточки", "наличные"
	DisplayName string         `json:"display_name" gorm:"not null"`     // Отображаемое название
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (at *AccountType) BeforeCreate(tx *gorm.DB) error {
	if at.ID == uuid.Nil {
		at.ID = uuid.New()
	}
	return nil
}

// Account представляет счет заведения
type Account struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EstablishmentID uuid.UUID      `json:"establishment_id" gorm:"type:uuid;not null;index"`
	Establishment   *Establishment  `json:"establishment,omitempty" gorm:"foreignKey:EstablishmentID"`
	Name            string         `json:"name" gorm:"not null"`                    // Название счета
	Currency        string         `json:"currency" gorm:"not null;default:RUB"`    // Валюта (RUB, USD, EUR и т.д.)
	TypeID          uuid.UUID      `json:"type_id" gorm:"type:uuid;not null;index"` // Тип счета
	Type            *AccountType   `json:"type,omitempty" gorm:"foreignKey:TypeID"`
	InitialBalance  float64        `json:"initial_balance" gorm:"default:0"`        // Начальный баланс
	CurrentBalance  float64        `json:"current_balance" gorm:"default:0"`        // Текущий баланс (вычисляется)
	Active          bool           `json:"active" gorm:"default:true"`
	CreatedAt       time.Time      `json:"created_at" gorm:"index"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (a *Account) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	// При создании текущий баланс = начальный баланс
	if a.CurrentBalance == 0 {
		a.CurrentBalance = a.InitialBalance
	}
	return nil
}

// UpdateBalance обновляет баланс счета
func (a *Account) UpdateBalance(amount float64, transactionType string) {
	if transactionType == "income" {
		a.CurrentBalance += amount
	} else if transactionType == "expense" {
		a.CurrentBalance -= amount
	}
	// Для transfer логика будет в usecase (перевод между счетами)
}
