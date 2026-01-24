package repositories

import (
	"gorm.io/gorm"
)

// Repositories содержит все репозитории приложения
type Repositories struct {
	User         UserRepository
	Role         RoleRepository
	Establishment EstablishmentRepository
	Table        TableRepository
	Product            ProductRepository
	TechCard           TechCardRepository
	Ingredient         IngredientRepository
	Category           CategoryRepository
	IngredientCategory IngredientCategoryRepository
	Warehouse          WarehouseRepository
	Supplier           SupplierRepository
	Order        OrderRepository
	Transaction  TransactionRepository
	Shift        ShiftRepository
	Onboarding   OnboardingRepository
	Subscription SubscriptionRepository
	Token        TokenRepository
	Account     AccountRepository
	AccountType AccountTypeRepository
}

// NewRepositories создает все репозитории
func NewRepositories(db *gorm.DB) *Repositories {
	return &Repositories{
		User:         NewUserRepository(db),
		Role:         NewRoleRepository(db),
		Establishment: NewEstablishmentRepository(db),
		Table:        NewTableRepository(db),
		Product:            NewProductRepository(db),
		TechCard:           NewTechCardRepository(db),
		Ingredient:         NewIngredientRepository(db),
		Category:           NewCategoryRepository(db),
		IngredientCategory: NewIngredientCategoryRepository(db),
		Warehouse:          NewWarehouseRepository(db),
		Supplier:           NewSupplierRepository(db),
		Order:        NewOrderRepository(db),
		Transaction:  NewTransactionRepository(db),
		Shift:        NewShiftRepository(db),
		Onboarding:   NewOnboardingRepository(db),
		Subscription: NewSubscriptionRepository(db),
		Token:        NewTokenRepository(db),
		Account:      NewAccountRepository(db),
		AccountType:  NewAccountTypeRepository(db),
	}
}

// BoolPtr возвращает указатель на булево значение
func BoolPtr(b bool) *bool {
	return &b
}
