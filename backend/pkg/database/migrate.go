package database

import (
	"fmt"

	"go.uber.org/zap"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

// migrateAccountBalances мигрирует данные из initial_balance и current_balance в balance
// и удаляет старые колонки
func migrateAccountBalances(db *gorm.DB, logger *zap.Logger) error {
	// Проверяем, существует ли колонка balance (значит миграция уже была)
	if db.Migrator().HasColumn(&models.Account{}, "balance") {
		return nil
	}

	if logger != nil {
		logger.Info("Migrating Account: merging initial_balance and current_balance into balance...")
	}

	// Шаг 1: добавляем новую колонку balance
	if err := db.Migrator().AddColumn(&models.Account{}, "balance"); err != nil {
		return fmt.Errorf("failed to add balance column: %w", err)
	}

	// Шаг 2: копируем данные из current_balance в balance
	if err := db.Exec("UPDATE accounts SET balance = current_balance WHERE balance = 0").Error; err != nil {
		return fmt.Errorf("failed to copy current_balance to balance: %w", err)
	}

	// Шаг 3: удаляем старые колонки
	if err := db.Migrator().DropColumn(&models.Account{}, "initial_balance"); err != nil {
		return fmt.Errorf("failed to drop initial_balance column: %w", err)
	}
	if err := db.Migrator().DropColumn(&models.Account{}, "current_balance"); err != nil {
		return fmt.Errorf("failed to drop current_balance column: %w", err)
	}

	if logger != nil {
		logger.Info("✅ Account balances migration completed successfully")
	}

	return nil
}

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
	if err := migrateDB.AutoMigrate(&models.Room{}); err != nil {
		return fmt.Errorf("failed to migrate Room: %w", err)
	}

	// Remove establishment_id from tables if it still exists (was replaced by room_id)
	if migrateDB.Migrator().HasColumn(&models.Table{}, "establishment_id") {
		if logger != nil {
			logger.Info("Migrating Table: removing establishment_id column...")
		}
		if err := migrateDB.Migrator().DropColumn(&models.Table{}, "establishment_id"); err != nil {
			return fmt.Errorf("failed to drop establishment_id column from tables: %w", err)
		}
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
	// Миграция Account: объединение initial_balance и current_balance в balance
	if err := migrateAccountBalances(migrateDB, logger); err != nil {
		return fmt.Errorf("failed to migrate account balances: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.Transaction{}); err != nil {
		return fmt.Errorf("failed to migrate Transaction: %w", err)
	}

	// 5. Модели для смен
	if err := migrateDB.AutoMigrate(&models.Shift{}); err != nil {
		return fmt.Errorf("failed to migrate Shift: %w", err)
	}
	if err := migrateDB.AutoMigrate(&models.ShiftSession{}); err != nil {
		return fmt.Errorf("failed to migrate ShiftSession: %w", err)
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
