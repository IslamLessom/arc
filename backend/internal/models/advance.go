package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Advance представляет авансовый платёж сотруднику
type Advance struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID          uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;index"`
	User            *User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	EstablishmentID uuid.UUID      `json:"establishment_id" gorm:"type:uuid;not null;index"`
	Establishment   *Establishment `json:"establishment,omitempty" gorm:"foreignKey:EstablishmentID"`
	Amount          float64        `json:"amount" gorm:"not null"`           // Размер аванса
	GivenDate       time.Time      `json:"given_date" gorm:"not null;index"` // Дата выдачи аванса
	Description     *string        `json:"description,omitempty"`            // Описание аванса (опционально)
	// Status может быть: "pending", "applied" (зачтён при расчёте зарплаты)
	Status string `json:"status" gorm:"not null;default:'pending';index"` // pending, applied
	// Если аванс применён, здесь хранится ID периода зарплаты
	AppliedToSalaryPeriodStart *time.Time     `json:"applied_to_salary_period_start,omitempty" gorm:"index"`
	AppliedToSalaryPeriodEnd   *time.Time     `json:"applied_to_salary_period_end,omitempty" gorm:"index"`
	CreatedAt                  time.Time      `json:"created_at"`
	UpdatedAt                  time.Time      `json:"updated_at"`
	DeletedAt                  gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (a *Advance) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}
