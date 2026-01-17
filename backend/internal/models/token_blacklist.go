package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// TokenBlacklist представляет черный список токенов (для logout)
type TokenBlacklist struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	TokenHash string         `json:"-" gorm:"uniqueIndex;not null"` // Хеш токена для хранения
	UserID    uuid.UUID      `json:"user_id" gorm:"type:uuid;not null"`
	ExpiresAt time.Time      `json:"expires_at" gorm:"not null"` // Когда токен истечет естественным образом
	CreatedAt time.Time      `json:"created_at"`
}

// BeforeCreate hook для автоматической генерации UUID
func (tb *TokenBlacklist) BeforeCreate(tx *gorm.DB) error {
	if tb.ID == uuid.Nil {
		tb.ID = uuid.New()
	}
	return nil
}
