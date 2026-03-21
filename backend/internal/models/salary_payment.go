package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SalaryPayment представляет запись о выплате зарплаты сотруднику
type SalaryPayment struct {
	ID               uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EstablishmentID  uuid.UUID      `json:"establishment_id" gorm:"type:uuid;not null;index"`
	Establishment    *Establishment `json:"establishment,omitempty" gorm:"foreignKey:EstablishmentID"`
	UserID           uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;index"`
	User             *User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	PeriodStart      time.Time      `json:"period_start" gorm:"not null;index"`
	PeriodEnd        time.Time      `json:"period_end" gorm:"not null;index"`
	TotalSalary      float64        `json:"total_salary" gorm:"not null"`                // Общая начисленная зарплата
	AdvancesDeducted float64        `json:"advances_deducted" gorm:"not null;default:0"` // Удержанные авансы
	AmountPaid       float64        `json:"amount_paid" gorm:"not null"`                 // Фактически выплачено
	AccountID        uuid.UUID      `json:"account_id" gorm:"type:uuid;not null"`
	Account          *Account       `json:"account,omitempty" gorm:"foreignKey:AccountID"`
	TransactionID    *uuid.UUID     `json:"transaction_id,omitempty" gorm:"type:uuid"` // Ссылка на транзакцию
	Transaction      *Transaction   `json:"transaction,omitempty" gorm:"foreignKey:TransactionID"`
	PaymentDate      time.Time      `json:"payment_date" gorm:"not null;index"`
	PaidBy           *uuid.UUID     `json:"paid_by,omitempty" gorm:"type:uuid"` // Кто выплатил
	PaidByUser       *User          `json:"paid_by_user,omitempty" gorm:"foreignKey:PaidBy"`
	Notes            *string        `json:"notes,omitempty"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (sp *SalaryPayment) BeforeCreate(tx *gorm.DB) error {
	if sp.ID == uuid.Nil {
		sp.ID = uuid.New()
	}
	return nil
}
