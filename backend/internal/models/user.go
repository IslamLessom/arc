package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User представляет пользователя системы
type User struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Email     string         `json:"email" gorm:"uniqueIndex;not null"`
	Password  string         `json:"-" gorm:"not null"`
	Name      string         `json:"name"`
	RoleID    uuid.UUID      `json:"role_id" gorm:"type:uuid;not null"`
	Role      *Role          `json:"role,omitempty" gorm:"foreignKey:RoleID"`
	
	// Связь с заведением (один пользователь = одно заведение)
	EstablishmentID *uuid.UUID  `json:"establishment_id,omitempty" gorm:"type:uuid"`
	Establishment   *Establishment `json:"establishment,omitempty" gorm:"foreignKey:EstablishmentID"`
	
	// Состояние onboarding
	OnboardingCompleted bool `json:"onboarding_completed" gorm:"default:false"`
	
	// Подписка
	SubscriptionID *uuid.UUID `json:"subscription_id,omitempty" gorm:"type:uuid"`
	Subscription   *Subscription `json:"subscription,omitempty" gorm:"foreignKey:SubscriptionID"`
	
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}