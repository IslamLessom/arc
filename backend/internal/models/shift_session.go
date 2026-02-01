package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ShiftSession представляет сессию работы сотрудника на смене
// Несколько сотрудников могут работать в рамках одной смены
type ShiftSession struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	ShiftID         uuid.UUID      `json:"shift_id" gorm:"type:uuid;not null;index"`
	Shift           *Shift         `json:"shift,omitempty" gorm:"foreignKey:ShiftID"`
	UserID          uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;index"`
	User            *User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	StartTime       time.Time      `json:"start_time" gorm:"not null"`
	EndTime         *time.Time     `json:"end_time,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (s *ShiftSession) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

// IsActive проверяет, активна ли сессия (EndTime не установлено)
func (s *ShiftSession) IsActive() bool {
	return s.EndTime == nil
}

// Duration возвращает длительность сессии
func (s *ShiftSession) Duration() time.Duration {
	if s.EndTime == nil {
		return time.Since(s.StartTime)
	}
	return s.EndTime.Sub(s.StartTime)
}
