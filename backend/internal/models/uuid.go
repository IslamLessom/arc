package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// BaseModel базовая модель с UUID ID
type BaseModel struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	CreatedAt int64          `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt int64          `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID перед созданием
func (base *BaseModel) BeforeCreate(tx *gorm.DB) error {
	if base.ID == uuid.Nil {
		base.ID = uuid.New()
	}
	return nil
}