package main

import (
	"log"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/pkg/database"
	"gorm.io/gorm"
)

func main() {
	// Инициализация БД (нужно будет настроить конфиг)
	db, err := database.NewPostgres(/* config */)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Создаем вопросы опросника
	questions := []models.OnboardingQuestion{
		// Шаг 1: Основная информация
		{
			Step:        1,
			Order:       1,
			Key:         "establishment_name",
			Type:        "text",
			Label:       "Название заведения",
			Placeholder: "Например: Кафе Москва",
			Required:    true,
		},
		{
			Step:        1,
			Order:       2,
			Key:         "address",
			Type:        "text",
			Label:       "Адрес заведения",
			Placeholder: "Например: ул. Тверская, д. 1",
			Required:    true,
		},
		{
			Step:        1,
			Order:       3,
			Key:         "phone",
			Type:        "phone",
			Label:       "Телефон",
			Placeholder: "+7 999 123-45-67",
			Required:    true,
		},
		{
			Step:        1,
			Order:       4,
			Key:         "email",
			Type:        "email",
			Label:       "Email заведения",
			Placeholder: "info@example.com",
			Required:    false,
		},

		// Шаг 2: Тип заведения
		{
			Step:     2,
			Order:    1,
			Key:      "type",
			Type:     "select",
			Label:    "Какой тип заведения?",
			Required: true,
			Options: []models.QuestionOption{
				{Value: "restaurant", Label: "Ресторан", Order: 1},
				{Value: "cafe", Label: "Кафе", Order: 2},
				{Value: "fast_food", Label: "Фаст-фуд", Order: 3},
				{Value: "bar", Label: "Бар", Order: 4},
				{Value: "pizzeria", Label: "Пиццерия", Order: 5},
				{Value: "bakery", Label: "Пекарня", Order: 6},
				{Value: "coffee_shop", Label: "Кофейня", Order: 7},
				{Value: "takeaway", Label: "На вынос", Order: 8},
				{Value: "delivery", Label: "Доставка", Order: 9},
				{Value: "other", Label: "Другое", Order: 10},
			},
		},

		// Шаг 3: Формат обслуживания
		{
			Step:        3,
			Order:       1,
			Key:         "has_seating_places",
			Type:        "boolean",
			Label:       "Есть ли сидячие места?",
			Required:    true,
			DefaultValue: "false",
		},
		{
			Step:        3,
			Order:       2,
			Key:         "table_count",
			Type:        "number",
			Label:       "Количество столов",
			Placeholder: "10",
			Required:    false,
			Condition:   "has_seating_places=true",
		},
		{
			Step:        3,
			Order:       3,
			Key:         "has_takeaway",
			Type:        "boolean",
			Label:       "Принимаете ли заказы на вынос?",
			Required:    true,
			DefaultValue: "true",
		},
		{
			Step:        3,
			Order:       4,
			Key:         "has_delivery",
			Type:        "boolean",
			Label:       "Есть ли доставка?",
			Required:    true,
			DefaultValue: "false",
		},
		{
			Step:        3,
			Order:       5,
			Key:         "has_reservations",
			Type:        "boolean",
			Label:       "Принимаете ли бронирования столов?",
			Required:    false,
			DefaultValue: "false",
			Condition:   "has_seating_places=true",
		},
	}

	// Сохраняем вопросы в БД
	for i := range questions {
		if err := db.Create(&questions[i]).Error; err != nil {
			log.Printf("Failed to create question %s: %v", questions[i].Key, err)
		} else {
			log.Printf("Created question: %s", questions[i].Key)
		}
	}

	log.Println("Onboarding questions seeded successfully")
}
