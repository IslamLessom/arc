package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Order представляет заказ
type Order struct {
	ID            uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EstablishmentID uuid.UUID    `json:"establishment_id" gorm:"type:uuid;not null;index"`
	Establishment   *Establishment `json:"establishment,omitempty" gorm:"foreignKey:EstablishmentID"`
	TableID         *uuid.UUID     `json:"table_id,omitempty" gorm:"type:uuid;index"`
	Table           *Table         `json:"table,omitempty" gorm:"foreignKey:TableID"`
	Status        string         `json:"status" gorm:"not null;index"` // draft, confirmed, preparing, ready, paid, cancelled
	PaymentStatus string         `json:"payment_status" gorm:"default:'pending'"` // pending, partial, paid, cancelled
	CashAmount    float64        `json:"cash_amount" gorm:"default:0"`
	CardAmount    float64        `json:"card_amount" gorm:"default:0"`
	ChangeAmount  float64        `json:"change_amount" gorm:"default:0"`
	ReasonForNoPayment *string   `json:"reason_for_no_payment,omitempty"` // Причина закрытия без оплаты
	TotalAmount   float64        `json:"total_amount"`
	Items         []OrderItem    `json:"items,omitempty" gorm:"foreignKey:OrderID"`
	CreatedAt     time.Time      `json:"created_at" gorm:"index"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (o *Order) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return nil
}

// OrderItem представляет позицию заказа
type OrderItem struct {
	ID          uuid.UUID   `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	OrderID     uuid.UUID   `json:"order_id" gorm:"type:uuid;not null;index"`
	ProductID   *uuid.UUID  `json:"product_id,omitempty" gorm:"type:uuid;index"`
	Product     *Product    `json:"product,omitempty" gorm:"foreignKey:ProductID"`
	TechCardID  *uuid.UUID  `json:"tech_card_id,omitempty" gorm:"type:uuid;index"`
	TechCard    *TechCard   `json:"tech_card,omitempty" gorm:"foreignKey:TechCardID"`
	Quantity    int        `json:"quantity" gorm:"not null"`
	GuestNumber *int       `json:"guest_number,omitempty"` // Номер гостя в рамках заказа
	Price       float64    `json:"price" gorm:"not null"`
	TotalPrice  float64    `json:"total_price" gorm:"not null"`
	CreatedAt   time.Time  `json:"created_at"`
}

// BeforeCreate hook для автоматической генерации UUID
func (oi *OrderItem) BeforeCreate(tx *gorm.DB) error {
	if oi.ID == uuid.Nil {
		oi.ID = uuid.New()
	}
	return nil
}