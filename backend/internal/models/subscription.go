package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SubscriptionPlan представляет тарифный план подписки
type SubscriptionPlan struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"uniqueIndex;not null"` // "Free Trial", "Basic", "Pro", "Business"
	Duration    int            `json:"duration" gorm:"not null"` // Длительность в днях
	Price       float64        `json:"price" gorm:"default:0"` // Цена (0 для бесплатного)
	Features    string         `json:"features"` // JSON строка со списком функций
	Active      bool           `json:"active" gorm:"default:true"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt  `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (sp *SubscriptionPlan) BeforeCreate(tx *gorm.DB) error {
	if sp.ID == uuid.Nil {
		sp.ID = uuid.New()
	}
	return nil
}

// Subscription представляет подписку пользователя
type Subscription struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID      uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;uniqueIndex"`
	User        *User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	PlanID      uuid.UUID      `json:"plan_id" gorm:"type:uuid;not null"`
	Plan        *SubscriptionPlan `json:"plan,omitempty" gorm:"foreignKey:PlanID"`
	StartDate   time.Time      `json:"start_date" gorm:"not null"`
	EndDate     time.Time      `json:"end_date" gorm:"not null"`
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	AutoRenew   bool           `json:"auto_renew" gorm:"default:false"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (s *Subscription) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

// IsExpired проверяет, истекла ли подписка
func (s *Subscription) IsExpired() bool {
	return time.Now().After(s.EndDate)
}

// IsValid проверяет, активна ли подписка
func (s *Subscription) IsValid() bool {
	return s.IsActive && !s.IsExpired()
}
