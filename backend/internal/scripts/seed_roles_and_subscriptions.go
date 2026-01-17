package main

import (
	"log"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/pkg/database"
	"gorm.io/gorm"
)

func main() {
	// Инициализация БД (нужно будет настроить конфиг)
	// db, err := database.NewPostgres(/* config */)
	// if err != nil {
	// 	log.Fatal("Failed to connect to database:", err)
	// }

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

	// TODO: Раскомментировать когда будет настроена БД
	// for i := range roles {
	// 	if err := db.Create(&roles[i]).Error; err != nil {
	// 		log.Printf("Failed to create role %s: %v", roles[i].Name, err)
	// 	} else {
	// 		log.Printf("Created role: %s", roles[i].Name)
	// 	}
	// }

	// for i := range plans {
	// 	if err := db.Create(&plans[i]).Error; err != nil {
	// 		log.Printf("Failed to create plan %s: %v", plans[i].Name, err)
	// 	} else {
	// 		log.Printf("Created subscription plan: %s", plans[i].Name)
	// 	}
	// }

	log.Println("Seed data structure ready. Uncomment DB code when database is configured.")
}
