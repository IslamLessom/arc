package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Client представляет клиента
type Client struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name            string         `json:"name"`
	Email           *string        `json:"email,omitempty"`
	Phone           *string        `json:"phone,omitempty"`
	Birthday        *time.Time     `json:"birthday,omitempty"`
	LoyaltyPoints   int            `json:"loyalty_points" gorm:"default:0"`
	TotalOrders     int            `json:"total_orders" gorm:"default:0"`
	TotalSpent      float64        `json:"total_spent" gorm:"default:0"`
	LoyaltyProgramID *uuid.UUID    `json:"loyalty_program_id,omitempty" gorm:"type:uuid"`
	LoyaltyProgram   *LoyaltyProgram `json:"loyalty_program,omitempty" gorm:"foreignKey:LoyaltyProgramID"`
	GroupID         *uuid.UUID     `json:"group_id,omitempty" gorm:"type:uuid"`
	Group           *ClientGroup   `json:"group,omitempty" gorm:"foreignKey:GroupID"`
	EstablishmentID  uuid.UUID      `json:"-" gorm:"type:uuid;not null"`
	Establishment   *Establishment `json:"-" gorm:"foreignKey:EstablishmentID"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (c *Client) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

// ClientGroup представляет группу клиентов
type ClientGroup struct {
	ID                uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name              string         `json:"name" gorm:"not null"`
	Description        *string        `json:"description,omitempty"`
	DiscountPercentage float64        `json:"discount_percentage" gorm:"default:0"`
	MinOrders         *int           `json:"min_orders,omitempty"`
	MinSpent          *float64        `json:"min_spent,omitempty"`
	CustomersCount    int            `json:"customers_count" gorm:"default:0"`
	EstablishmentID    uuid.UUID      `json:"-" gorm:"type:uuid;not null"`
	Establishment     *Establishment `json:"-" gorm:"foreignKey:EstablishmentID"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (cg *ClientGroup) BeforeCreate(tx *gorm.DB) error {
	if cg.ID == uuid.Nil {
		cg.ID = uuid.New()
	}
	return nil
}

// LoyaltyProgram представляет программу лояльности
type LoyaltyProgram struct {
	ID                uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name              string         `json:"name" gorm:"not null"`
	Description        *string        `json:"description,omitempty"`
	Type              string         `json:"type" gorm:"not null"` // points, cashback, tier
	PointsPerCurrency  *int           `json:"points_per_currency,omitempty"`
	CashbackPercentage *float64       `json:"cashback_percentage,omitempty"`
	MaxCashbackAmount *float64       `json:"max_cashback_amount,omitempty"`
	PointMultiplier   float64        `json:"point_multiplier" gorm:"default:1"`
	Active            bool           `json:"active" gorm:"default:true"`
	MembersCount      int            `json:"members_count" gorm:"default:0"`
	EstablishmentID   uuid.UUID      `json:"-" gorm:"type:uuid;not null"`
	Establishment    *Establishment `json:"-" gorm:"foreignKey:EstablishmentID"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (lp *LoyaltyProgram) BeforeCreate(tx *gorm.DB) error {
	if lp.ID == uuid.Nil {
		lp.ID = uuid.New()
	}
	return nil
}

// Promotion представляет акцию
type Promotion struct {
	ID                 uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name               string         `json:"name" gorm:"not null"`
	Description         *string        `json:"description,omitempty"`
	Type               string         `json:"type" gorm:"not null"` // discount, buy_x_get_y, bundle, happy_hour
	DiscountPercentage  *float64       `json:"discount_percentage,omitempty"`
	BuyQuantity        *int           `json:"buy_quantity,omitempty"`
	GetQuantity        *int           `json:"get_quantity,omitempty"`
	StartDate          time.Time      `json:"start_date"`
	EndDate            time.Time      `json:"end_date"`
	Active             bool           `json:"active" gorm:"default:true"`
	UsageCount         int            `json:"usage_count" gorm:"default:0"`
	EstablishmentID    uuid.UUID      `json:"-" gorm:"type:uuid;not null"`
	Establishment     *Establishment `json:"-" gorm:"foreignKey:EstablishmentID"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (p *Promotion) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

// Exclusion представляет исключение из акций/скидок
type Exclusion struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name            string         `json:"name" gorm:"not null"`
	Description      *string        `json:"description,omitempty"`
	Type            string         `json:"type" gorm:"not null"` // product, category, customer, customer_group
	EntityID        *uuid.UUID      `json:"entity_id,omitempty" gorm:"type:uuid"`
	EntityName      *string        `json:"entity_name,omitempty"`
	Active          bool           `json:"active" gorm:"default:true"`
	EstablishmentID uuid.UUID      `json:"-" gorm:"type:uuid;not null"`
	Establishment   *Establishment `json:"-" gorm:"foreignKey:EstablishmentID"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (e *Exclusion) BeforeCreate(tx *gorm.DB) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}
	return nil
}
