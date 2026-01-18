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
	Onboarding   *OnboardingUseCase
	Storage      *storage.MinIOClient
}

// NewUseCases создает все use cases
func NewUseCases(repos *repositories.Repositories, cfg *config.Config) (*UseCases, error) {
	// Инициализируем MinIO storage
	storageClient, err := storage.NewMinIO(cfg.Storage)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize storage: %w", err)
	}

	return &UseCases{
		Auth:         NewAuthUseCase(repos.User, repos.Role, repos.Subscription, repos.Token, cfg),
		Establishment: NewEstablishmentUseCase(repos.Establishment, repos.Table),
		Menu:         NewMenuUseCase(repos.Product, repos.TechCard, repos.Ingredient, repos.Category, repos.IngredientCategory, repos.Warehouse),
		Warehouse:    NewWarehouseUseCase(repos.Warehouse, repos.Supplier),
		Finance:      NewFinanceUseCase(repos.Transaction, repos.Shift),
		Statistics:   NewStatisticsUseCase(repos.Order),
		Order:        NewOrderUseCase(repos.Order, repos.Warehouse),
		Onboarding:   NewOnboardingUseCase(repos.Onboarding, repos.Establishment, repos.Table, repos.User),
		Storage:      storageClient,
	}, nil
}