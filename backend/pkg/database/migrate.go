package database

import (
	"fmt"

	"go.uber.org/zap"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

// RunMigrations выполняет автоматические миграции для всех моделей
func RunMigrations(db *gorm.DB, logger *zap.Logger) error {
	if logger != nil {
		logger.Info("Running database migrations (AutoMigrate)...")
	}

	// Используем базу данных напрямую для миграций
	// GORM автоматически управляет внешними ключами при AutoMigrate
	migrateDB := db

	// 1. Независимые таблицы
	if err := migrateDB.AutoMigrate(&models.Role{}); err != nil {
		return fmt.Errorf("failed to migrate Role: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.SubscriptionPlan{}); err != nil {
		return fmt.Errorf("failed to migrate SubscriptionPlan: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.AccountType{}); err != nil {
		return fmt.Errorf("failed to migrate AccountType: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.ClientGroup{}); err != nil {
		return fmt.Errorf("failed to migrate ClientGroup: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.LoyaltyProgram{}); err != nil {
		return fmt.Errorf("failed to migrate LoyaltyProgram: %w", err)
	}

	// 2. Таблицы, зависящие от Role
	if err := migrateDB.AutoMigrate(&models.User{}); err != nil {
		return fmt.Errorf("failed to migrate User: %w", err)
	}

	// 3. Таблицы, зависящие от User и Establishment
	if err := migrateDB.AutoMigrate(&models.Establishment{}); err != nil {
		return fmt.Errorf("failed to migrate Establishment: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.Table{}); err != nil {
		return fmt.Errorf("failed to migrate Table: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.Subscription{}); err != nil {
		return fmt.Errorf("failed to migrate Subscription: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.TokenBlacklist{}); err != nil {
		return fmt.Errorf("failed to migrate TokenBlacklist: %w", err)
	}

	// 4. Финансовые модели
	if err := migrateDB.AutoMigrate(&models.Account{}); err != nil {
		return fmt.Errorf("failed to migrate Account: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.Transaction{}); err != nil {
		return fmt.Errorf("failed to migrate Transaction: %w", err)
	}

	// 5. Модели для смен
	if err := migrateDB.AutoMigrate(&models.Shift{}); err != nil {
		return fmt.Errorf("failed to migrate Shift: %w", err)
	}

	// 6. Модели для меню и склада
	if err := migrateDB.AutoMigrate(&models.Category{}); err != nil {
		return fmt.Errorf("failed to migrate Category: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.IngredientCategory{}); err != nil {
		return fmt.Errorf("failed to migrate IngredientCategory: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.Workshop{}); err != nil {
		return fmt.Errorf("failed to migrate Workshop: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.Ingredient{}); err != nil {
		return fmt.Errorf("failed to migrate Ingredient: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.Product{}); err != nil {
		return fmt.Errorf("failed to migrate Product: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.SemiFinishedProduct{}); err != nil {
		return fmt.Errorf("failed to migrate SemiFinishedProduct: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.SemiFinishedIngredient{}); err != nil {
		return fmt.Errorf("failed to migrate SemiFinishedIngredient: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.TechCard{}); err != nil {
		return fmt.Errorf("failed to migrate TechCard: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.TechCardIngredient{}); err != nil {
		return fmt.Errorf("failed to migrate TechCardIngredient: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.ModifierSet{}); err != nil {
		return fmt.Errorf("failed to migrate ModifierSet: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.ModifierOption{}); err != nil {
		return fmt.Errorf("failed to migrate ModifierOption: %w", err)
	}

	// 7. Модели для склада
	if err := migrateDB.AutoMigrate(&models.Warehouse{}); err != nil {
		return fmt.Errorf("failed to migrate Warehouse: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.Stock{}); err != nil {
		return fmt.Errorf("failed to migrate Stock: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.Supplier{}); err != nil {
		return fmt.Errorf("failed to migrate Supplier: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.Supply{}); err != nil {
		return fmt.Errorf("failed to migrate Supply: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.SupplyItem{}); err != nil {
		return fmt.Errorf("failed to migrate SupplyItem: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.WriteOff{}); err != nil {
		return fmt.Errorf("failed to migrate WriteOff: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.WriteOffItem{}); err != nil {
		return fmt.Errorf("failed to migrate WriteOffItem: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.Inventory{}); err != nil {
		return fmt.Errorf("failed to migrate Inventory: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.InventoryItem{}); err != nil {
		return fmt.Errorf("failed to migrate InventoryItem: %w", err)
	}

	// 8. Модели для заказов
	if err := migrateDB.AutoMigrate(&models.Order{}); err != nil {
		return fmt.Errorf("failed to migrate Order: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.OrderItem{}); err != nil {
		return fmt.Errorf("failed to migrate OrderItem: %w", err)
	}

	// 9. Модели для клиентов
	if err := migrateDB.AutoMigrate(&models.Client{}); err != nil {
		return fmt.Errorf("failed to migrate Client: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.Promotion{}); err != nil {
		return fmt.Errorf("failed to migrate Promotion: %w", err)
	}

	// 10. Модели для онбординга
	if err := migrateDB.AutoMigrate(&models.OnboardingQuestion{}); err != nil {
		return fmt.Errorf("failed to migrate OnboardingQuestion: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.QuestionOption{}); err != nil {
		return fmt.Errorf("failed to migrate QuestionOption: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.OnboardingResponse{}); err != nil {
		return fmt.Errorf("failed to migrate OnboardingResponse: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.OnboardingAnswer{}); err != nil {
		return fmt.Errorf("failed to migrate OnboardingAnswer: %w", err)
	}

	if logger != nil {
		logger.Info("✅ Database migrations completed successfully")
	}
	return nil
}
