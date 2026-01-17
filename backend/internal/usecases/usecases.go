package usecases

import (
	"github.com/yourusername/arc/backend/internal/config"
	"github.com/yourusername/arc/backend/internal/repositories"
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
}

// NewUseCases создает все use cases
func NewUseCases(repos *repositories.Repositories, cfg *config.Config) *UseCases {
	return &UseCases{
		Auth:         NewAuthUseCase(repos.User, repos.Role, repos.Subscription, repos.Token, cfg),
		Establishment: NewEstablishmentUseCase(repos.Establishment, repos.Table),
		Menu:         NewMenuUseCase(repos.Product, repos.TechCard, repos.Ingredient, repos.Category, repos.IngredientCategory, repos.Warehouse),
		Warehouse:    NewWarehouseUseCase(repos.Warehouse, repos.Supplier),
		Finance:      NewFinanceUseCase(repos.Transaction, repos.Shift),
		Statistics:   NewStatisticsUseCase(repos.Order),
		Order:        NewOrderUseCase(repos.Order, repos.Warehouse),
		Onboarding:   NewOnboardingUseCase(repos.Onboarding, repos.Establishment, repos.Table, repos.User),
	}
}