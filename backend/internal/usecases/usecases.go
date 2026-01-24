package usecases

import (
	"fmt"

	"github.com/yourusername/arc/backend/internal/config"
	"github.com/yourusername/arc/backend/internal/repositories"
	"github.com/yourusername/arc/backend/pkg/storage"
)

// UseCases содержит все use cases приложения
type UseCases struct {
	Auth         *AuthUseCase
	Establishment *EstablishmentUseCase
	Menu         *MenuUseCase
	Warehouse    *WarehouseUseCase
	Finance      *FinanceUseCase
	Statistics   *StatisticsUseCase
	Order        *OrderUseCase
	Shift        *ShiftUseCase
	Onboarding   *OnboardingUseCase
	Account      *AccountUseCase
	Table        *TableUseCase
	User         *UserUseCase
	Role         *RoleUseCase // Добавлен новый UseCase для управления ролями
	Storage      *storage.MinIOClient
}

// NewUseCases создает все use cases
func NewUseCases(repos *repositories.Repositories, cfg *config.Config) (*UseCases, error) {
	// Инициализируем MinIO storage
	storageClient, err := storage.NewMinIO(cfg.Storage)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize storage: %w", err)
	}

	accountUseCase := NewAccountUseCase(repos.Account, repos.AccountType)
	userUseCase := NewUserUseCase(repos.User, repos.Role)
	roleUseCase := NewRoleUseCase(repos.Role)
	shiftUseCase := NewShiftUseCase(repos.Shift, repos.User, repos.Transaction) // Инициализация ShiftUseCase
	
	return &UseCases{
		Auth:         NewAuthUseCase(repos.User, repos.Role, repos.Subscription, repos.Token, repos.Establishment, shiftUseCase, cfg),
		Establishment: NewEstablishmentUseCase(repos.Establishment, repos.Table),
		Menu:         NewMenuUseCase(repos.Product, repos.TechCard, repos.Ingredient, repos.Category, repos.IngredientCategory, repos.Warehouse),
		Warehouse:    NewWarehouseUseCase(repos.Warehouse, repos.Supplier),
		Finance:      NewFinanceUseCase(repos.Transaction, repos.Account, repos.Shift, repos.Order),
		Statistics:   NewStatisticsUseCase(repos.Order),
		Order:        NewOrderUseCase(repos.Order, repos.Warehouse, repos.Transaction, accountUseCase),
		Shift:        NewShiftUseCase(repos.Shift, repos.User, repos.Transaction),
		Onboarding:   NewOnboardingUseCase(repos.Onboarding, repos.Establishment, repos.Table, repos.User, accountUseCase),
		Account:      accountUseCase,
		Table:        NewTableUseCase(repos.Table),
		User:         userUseCase,
		Role:         roleUseCase, // Присвоение нового RoleUseCase
		Storage:      storageClient,
	}, nil
}