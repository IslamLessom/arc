package main

import (
	"log"

	"github.com/yourusername/arc/backend/internal/config"
	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/pkg/database"
)

func main() {
	// Загружаем конфигурацию
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	log.Printf("Connecting to database: %s@%s:%d/%s", 
		cfg.Database.User, cfg.Database.Host, cfg.Database.Port, cfg.Database.Name)

	// Инициализация БД (logger = nil для скриптов)
	db, err := database.NewPostgres(cfg.Database, nil)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to get underlying sql.DB:", err)
	}
	defer sqlDB.Close()

	log.Println("✅ Successfully connected to database")

	// Автоматически создаем таблицы, если их нет
	if err := database.RunMigrations(db, nil); err != nil {
		log.Fatalf("Failed to run database migrations: %v", err)
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

		// Шаг 3: Опыт использования
		{
			Step:        3,
			Order:       1,
			Key:         "used_arc_before",
			Type:        "boolean",
			Label:       "Использовали ли вы раньше систему ARC или подобные системы управления рестораном?",
			Required:    true,
			DefaultValue: "false",
		},

		// Шаг 4: Формат обслуживания
		{
			Step:        4,
			Order:       1,
			Key:         "has_seating_places",
			Type:        "boolean",
			Label:       "Есть ли сидячие места?",
			Required:    true,
			DefaultValue: "false",
		},
		{
			Step:        4,
			Order:       2,
			Key:         "table_count",
			Type:        "number",
			Label:       "Количество столов",
			Placeholder: "10",
			Required:    false,
			Condition:   "has_seating_places=true",
		},
		{
			Step:        4,
			Order:       3,
			Key:         "has_takeaway",
			Type:        "boolean",
			Label:       "Принимаете ли заказы на вынос?",
			Required:    true,
			DefaultValue: "true",
		},
		{
			Step:        4,
			Order:       4,
			Key:         "has_delivery",
			Type:        "boolean",
			Label:       "Есть ли доставка?",
			Required:    true,
			DefaultValue: "false",
		},
		{
			Step:        4,
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
	log.Println("Creating onboarding questions...")
	for i := range questions {
		// Проверяем, существует ли вопрос
		var existingQuestion models.OnboardingQuestion
		result := db.Where("key = ?", questions[i].Key).First(&existingQuestion)
		if result.Error == nil {
			log.Printf("Question '%s' already exists, skipping", questions[i].Key)
			continue
		}

		if err := db.Create(&questions[i]).Error; err != nil {
			log.Printf("Failed to create question %s: %v", questions[i].Key, err)
		} else {
			log.Printf("Created question: %s (Step %d, Order %d)", questions[i].Key, questions[i].Step, questions[i].Order)
		}
	}

	log.Println("\n✅ Onboarding questions seeded successfully!")

	// Проверяем, что вопросы действительно созданы
	log.Println("\nVerifying created questions...")
	var questionCount int64
	db.Model(&models.OnboardingQuestion{}).Count(&questionCount)
	log.Printf("Total onboarding questions in database: %d", questionCount)

	if questionCount == 0 {
		log.Println("⚠️  WARNING: No questions found in database after seeding!")
	} else {
		log.Println("✅ Questions verified successfully")
	}
}
