package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// BeforeCreateUUID - универсальный hook для автоматической генерации UUID
func BeforeCreateUUID(tx *gorm.DB, id *uuid.UUID) error {
	if *id == uuid.Nil {
		*id = uuid.New()
	}
	return nil
}

// ParseUUID парсит UUID из строки
func ParseUUID(s string) (uuid.UUID, error) {
	return uuid.Parse(s)
}

// MustParseUUID парсит UUID из строки, паникует при ошибке (использовать только в тестах)
func MustParseUUID(s string) uuid.UUID {
	return uuid.MustParse(s)
}