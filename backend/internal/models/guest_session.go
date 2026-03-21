package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// GuestSession представляет гостевую сессию для заказа через QR-меню.
// Гость может быть анонимным (с никнеймом/эмодзи) или зарегистрированным (телефон + пароль).
type GuestSession struct {
	ID              uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EstablishmentID uuid.UUID  `json:"establishment_id" gorm:"type:uuid;not null;index"`
	TableID         *uuid.UUID `json:"table_id,omitempty" gorm:"type:uuid;index"`
	Table           *Table     `json:"table,omitempty" gorm:"foreignKey:TableID"`
	GuestName       string     `json:"guest_name" gorm:"not null"`
	Phone           *string    `json:"phone,omitempty" gorm:"index"`
	PasswordHash    string     `json:"-" gorm:"column:password_hash"`
	IsAnonymous     bool       `json:"is_anonymous" gorm:"not null;default:true"`
	// Token — уникальный UUID, используется как session token
	Token     uuid.UUID      `json:"token" gorm:"type:uuid;uniqueIndex;not null;default:gen_random_uuid()"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

func (g *GuestSession) BeforeCreate(tx *gorm.DB) error {
	if g.ID == uuid.Nil {
		g.ID = uuid.New()
	}
	if g.Token == uuid.Nil {
		g.Token = uuid.New()
	}
	return nil
}
