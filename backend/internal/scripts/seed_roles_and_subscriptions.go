package main

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

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

	// Инициализация БД
	db, err := database.NewPostgres(cfg.Database)
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
	// Важно: создаем новое соединение с отключенными внешними ключами для миграции
	log.Println("Running database migrations (AutoMigrate)...")
	
	// Создаем новое соединение GORM с отключенными внешними ключами
	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Name,
		cfg.Database.SSLMode,
	)
	
	migrateDB, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Fatalf("Failed to create migration connection: %v", err)
	}
	
	// 1. Сначала независимые таблицы
	if err := migrateDB.AutoMigrate(&models.Role{}); err != nil {
		log.Fatalf("Failed to migrate Role: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.SubscriptionPlan{}); err != nil {
		log.Fatalf("Failed to migrate SubscriptionPlan: %v", err)
	}
	
	// 2. Затем таблицы, зависящие от Role
	// User имеет связь с Establishment, но внешние ключи отключены, поэтому это не проблема
	if err := migrateDB.AutoMigrate(&models.User{}); err != nil {
		log.Fatalf("Failed to migrate User: %v", err)
	}
	
	// 3. Затем таблицы, зависящие от User (Establishment и Table)
	// Establishment нужен для создания заведения при onboarding
	if err := migrateDB.AutoMigrate(&models.Establishment{}); err != nil {
		log.Fatalf("Failed to migrate Establishment: %v", err)
	}
	// Table нужен для создания столов при создании заведения
	if err := migrateDB.AutoMigrate(&models.Table{}); err != nil {
		log.Fatalf("Failed to migrate Table: %v", err)
	}
	
	// 4. Затем таблицы, зависящие от User и SubscriptionPlan
	if err := migrateDB.AutoMigrate(&models.Subscription{}); err != nil {
		log.Fatalf("Failed to migrate Subscription: %v", err)
	}
	
	// 5. Таблицы для работы приложения (зависят от Establishment)
	if err := migrateDB.AutoMigrate(&models.TokenBlacklist{}); err != nil {
		log.Fatalf("Failed to migrate TokenBlacklist: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.Category{}); err != nil {
		log.Fatalf("Failed to migrate Category: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.IngredientCategory{}); err != nil {
		log.Fatalf("Failed to migrate IngredientCategory: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.Workshop{}); err != nil {
		log.Fatalf("Failed to migrate Workshop: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.Ingredient{}); err != nil {
		log.Fatalf("Failed to migrate Ingredient: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.Product{}); err != nil {
		log.Fatalf("Failed to migrate Product: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.TechCard{}); err != nil {
		log.Fatalf("Failed to migrate TechCard: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.TechCardIngredient{}); err != nil {
		log.Fatalf("Failed to migrate TechCardIngredient: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.ModifierSet{}); err != nil {
		log.Fatalf("Failed to migrate ModifierSet: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.ModifierOption{}); err != nil {
		log.Fatalf("Failed to migrate ModifierOption: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.Warehouse{}); err != nil {
		log.Fatalf("Failed to migrate Warehouse: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.Stock{}); err != nil {
		log.Fatalf("Failed to migrate Stock: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.Supplier{}); err != nil {
		log.Fatalf("Failed to migrate Supplier: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.Supply{}); err != nil {
		log.Fatalf("Failed to migrate Supply: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.SupplyItem{}); err != nil {
		log.Fatalf("Failed to migrate SupplyItem: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.WriteOff{}); err != nil {
		log.Fatalf("Failed to migrate WriteOff: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.WriteOffItem{}); err != nil {
		log.Fatalf("Failed to migrate WriteOffItem: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.Order{}); err != nil {
		log.Fatalf("Failed to migrate Order: %v", err)
	}
	if err := migrateDB.AutoMigrate(&models.OrderItem{}); err != nil {
		log.Fatalf("Failed to migrate OrderItem: %v", err)
	}
	
	log.Println("✅ Database migrations completed")

	// Создаем роли
	roles := []models.Role{
		{
			Name:        "owner",
			Permissions: `["all"]`, // Владелец имеет все права
		},
		{
			Name:        "manager",
			Permissions: `["menu", "orders", "warehouse", "statistics"]`,
		},
		{
			Name:        "waiter",
			Permissions: `["orders", "tables"]`,
		},
		{
			Name:        "cook",
			Permissions: `["orders", "menu"]`,
		},
	}

	// Создаем тарифные планы
	plans := []models.SubscriptionPlan{
		{
			Name:     "Free Trial",
			Duration: 14, // 14 дней
			Price:    0,  // Бесплатно
			Features: `["basic_menu", "orders", "warehouse", "statistics"]`,
			Active:  true,
		},
		// Можно добавить другие планы позже:
		// {
		// 	Name:     "Basic",
		// 	Duration: 30,
		// 	Price:    5000,
		// 	Features: `["basic_menu", "orders", "warehouse", "statistics", "reports"]`,
		// 	Active:  true,
		// },
		// {
		// 	Name:     "Pro",
		// 	Duration: 30,
		// 	Price:    15000,
		// 	Features: `["all_features", "modifiers", "analytics", "api_access"]`,
		// 	Active:  true,
		// },
	}

	log.Println("Roles to create:", len(roles))
	for _, role := range roles {
		log.Printf("  - %s", role.Name)
	}

	log.Println("Subscription plans to create:", len(plans))
	for _, plan := range plans {
		log.Printf("  - %s (Duration: %d days, Price: %.2f)", plan.Name, plan.Duration, plan.Price)
	}

	// Создаем роли
	log.Println("\nCreating roles...")
	for i := range roles {
		// Проверяем, существует ли роль
		var existingRole models.Role
		result := db.Where("name = ?", roles[i].Name).First(&existingRole)
		if result.Error == nil {
			log.Printf("Role '%s' already exists, skipping", roles[i].Name)
			continue
		}

		if err := db.Create(&roles[i]).Error; err != nil {
			log.Printf("Failed to create role %s: %v", roles[i].Name, err)
		} else {
			log.Printf("Created role: %s", roles[i].Name)
		}
	}

	// Создаем планы подписки
	log.Println("\nCreating subscription plans...")
	for i := range plans {
		// Проверяем, существует ли план
		var existingPlan models.SubscriptionPlan
		result := db.Where("name = ?", plans[i].Name).First(&existingPlan)
		if result.Error == nil {
			log.Printf("Subscription plan '%s' already exists, skipping", plans[i].Name)
			continue
		}

		if err := db.Create(&plans[i]).Error; err != nil {
			log.Printf("Failed to create plan %s: %v", plans[i].Name, err)
		} else {
			log.Printf("Created subscription plan: %s", plans[i].Name)
		}
	}

	log.Println("\n✅ Seed data created successfully!")

	// Проверяем, что данные действительно созданы
	log.Println("\nVerifying created data...")
	var roleCount int64
	db.Model(&models.Role{}).Count(&roleCount)
	log.Printf("Total roles in database: %d", roleCount)

	var planCount int64
	db.Model(&models.SubscriptionPlan{}).Count(&planCount)
	log.Printf("Total subscription plans in database: %d", planCount)

	// Проверяем конкретно роль owner
	var ownerRole models.Role
	if err := db.Where("name = ?", "owner").First(&ownerRole).Error; err != nil {
		log.Printf("⚠️  WARNING: Owner role not found after seeding! Error: %v", err)
	} else {
		log.Printf("✅ Owner role verified: ID=%s", ownerRole.ID)
	}

	// Проверяем план Free Trial
	var freeTrialPlan models.SubscriptionPlan
	if err := db.Where("name = ?", "Free Trial").First(&freeTrialPlan).Error; err != nil {
		log.Printf("⚠️  WARNING: Free Trial plan not found after seeding! Error: %v", err)
	} else {
		log.Printf("✅ Free Trial plan verified: ID=%s", freeTrialPlan.ID)
	}
}
