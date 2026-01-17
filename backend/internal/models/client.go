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
	Email           string         `json:"email"`
	Phone           string         `json:"phone"`
	LoyaltyPoints   int            `json:"loyalty_points" gorm:"default:0"`
	LoyaltyProgramID *uuid.UUID    `json:"loyalty_program_id,omitempty" gorm:"type:uuid"`
	LoyaltyProgram   *LoyaltyProgram `json:"loyalty_program,omitempty" gorm:"foreignKey:LoyaltyProgramID"`
	GroupID         *uuid.UUID     `json:"group_id,omitempty" gorm:"type:uuid"`
	Group           *ClientGroup   `json:"group,omitempty" gorm:"foreignKey:GroupID"`
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
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name      string         `json:"name" gorm:"uniqueIndex;not null"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
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
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"uniqueIndex;not null"`
	Description string         `json:"description"`
	Active      bool           `json:"active" gorm:"default:true"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
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
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"not null"`
	Description string         `json:"description"`
	Type        string         `json:"type"` // discount, gift, etc.
	Value       float64        `json:"value"`
	StartDate   time.Time      `json:"start_date"`
	EndDate     time.Time      `json:"end_date"`
	Active      bool           `json:"active" gorm:"default:true"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}