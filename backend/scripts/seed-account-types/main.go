package main

import (
	"log"
	"os"

	"github.com/yourusername/arc/backend/internal/config"
	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/pkg/database"
	"gorm.io/gorm"
)

func main() {
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

	// Миграция
	migrateDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to get DB instance:", err)
	}
	defer migrateDB.Close()

	if err := db.AutoMigrate(&models.AccountType{}); err != nil {
		log.Fatalf("Failed to migrate AccountType: %v", err)
	}

	// Создаем типы счетов
	accountTypes := []models.AccountType{
		{
			Name:        "безналичный счет",
			DisplayName: "Безналичный счет",
		},
		{
			Name:        "банковские карточки",
			DisplayName: "Банковские карточки",
		},
		{
			Name:        "наличные",
			DisplayName: "Наличные",
		},
	}

	for _, at := range accountTypes {
		var existing models.AccountType
		result := db.Where("name = ?", at.Name).First(&existing)

		if result.Error == gorm.ErrRecordNotFound {
			// Тип не существует, создаем
			if err := db.Create(&at).Error; err != nil {
				log.Printf("Failed to create account type %s: %v", at.Name, err)
			} else {
				log.Printf("Created account type: %s", at.Name)
			}
		} else if result.Error != nil {
			log.Printf("Error checking account type %s: %v", at.Name, result.Error)
		} else {
			log.Printf("Account type %s already exists, skipping", at.Name)
		}
	}

	log.Println("Account types seeding completed")
	os.Exit(0)
}
