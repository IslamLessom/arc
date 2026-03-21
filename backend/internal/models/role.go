package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Role представляет роль пользователя
type Role struct {
	ID           uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name         string         `json:"name" gorm:"uniqueIndex;not null"`
	Description  string         `json:"description"`
	Permissions  string         `json:"permissions"` // JSON массив разрешений
	IsSuperAdmin bool           `json:"is_super_admin" gorm:"default:false;index"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (r *Role) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}
