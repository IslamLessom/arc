package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// OnboardingQuestion представляет вопрос опросника
type OnboardingQuestion struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Step        int            `json:"step" gorm:"not null"` // Номер шага (1, 2, 3, ...)
	Order       int            `json:"order" gorm:"not null"` // Порядок вопроса в шаге
	Key         string         `json:"key" gorm:"uniqueIndex;not null"` // Ключ для маппинга ответа (например: "establishment_name", "has_seating_places")
	Type        string         `json:"type" gorm:"not null"` // Тип вопроса: text, email, phone, number, boolean, select
	Label       string         `json:"label" gorm:"not null"` // Текст вопроса
	Placeholder string         `json:"placeholder,omitempty"` // Подсказка для поля ввода
	Required    bool           `json:"required" gorm:"default:false"` // Обязательный ли вопрос
	DefaultValue string         `json:"default_value,omitempty"` // Значение по умолчанию
	Options     []QuestionOption `json:"options,omitempty" gorm:"foreignKey:QuestionID"` // Варианты ответов (для select)
	Condition   string         `json:"condition,omitempty"` // Условие показа вопроса (например: "has_seating_places=true")
	Validation  string         `json:"validation,omitempty"` // Правила валидации (JSON)
	Active      bool           `json:"active" gorm:"default:true"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (oq *OnboardingQuestion) BeforeCreate(tx *gorm.DB) error {
	if oq.ID == uuid.Nil {
		oq.ID = uuid.New()
	}
	return nil
}

// QuestionOption представляет вариант ответа для вопроса типа select
type QuestionOption struct {
	ID         uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	QuestionID uuid.UUID `json:"question_id" gorm:"type:uuid;not null"`
	Question   *OnboardingQuestion `json:"question,omitempty" gorm:"foreignKey:QuestionID"`
	Value      string    `json:"value" gorm:"not null"` // Значение для сохранения
	Label      string    `json:"label" gorm:"not null"` // Текст для отображения
	Order      int       `json:"order" gorm:"not null"` // Порядок в списке
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// BeforeCreate hook для автоматической генерации UUID
func (qo *QuestionOption) BeforeCreate(tx *gorm.DB) error {
	if qo.ID == uuid.Nil {
		qo.ID = uuid.New()
	}
	return nil
}

// OnboardingResponse представляет ответы пользователя на опросник
type OnboardingResponse struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID    uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;uniqueIndex"`
	User      *User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Answers   []OnboardingAnswer `json:"answers,omitempty" gorm:"foreignKey:ResponseID"`
	Completed bool           `json:"completed" gorm:"default:false"` // Завершен ли опросник
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate hook для автоматической генерации UUID
func (or *OnboardingResponse) BeforeCreate(tx *gorm.DB) error {
	if or.ID == uuid.Nil {
		or.ID = uuid.New()
	}
	return nil
}

// OnboardingAnswer представляет ответ на конкретный вопрос
type OnboardingAnswer struct {
	ID         uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	ResponseID uuid.UUID `json:"response_id" gorm:"type:uuid;not null"`
	Response   *OnboardingResponse `json:"response,omitempty" gorm:"foreignKey:ResponseID"`
	QuestionKey string    `json:"question_key" gorm:"not null"` // Ключ вопроса
	Value      string    `json:"value" gorm:"not null"` // Значение ответа (JSON строка для сложных типов)
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// BeforeCreate hook для автоматической генерации UUID
func (oa *OnboardingAnswer) BeforeCreate(tx *gorm.DB) error {
	if oa.ID == uuid.Nil {
		oa.ID = uuid.New()
	}
	return nil
}
