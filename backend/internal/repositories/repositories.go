package repositories

import (
	"gorm.io/gorm"
)

// Repositories содержит все репозитории приложения
type Repositories struct {
	User         UserRepository
	Role         RoleRepository
	Establishment EstablishmentRepository
	Room         RoomRepository
	Table        TableRepository
	Product            ProductRepository
	TechCard           TechCardRepository
	SemiFinished       SemiFinishedRepository
	Ingredient         IngredientRepository
	Category           CategoryRepository
	IngredientCategory IngredientCategoryRepository
	Warehouse          WarehouseRepository
	Workshop           WorkshopRepository
	Supplier           SupplierRepository
	Order        OrderRepository
	Transaction  TransactionRepository
	Shift        ShiftRepository
	ShiftSession ShiftSessionRepository
	Onboarding   OnboardingRepository
	Subscription SubscriptionRepository
	Token        TokenRepository
	Account      AccountRepository
	AccountType  AccountTypeRepository
	Inventory    InventoryRepository
	// Marketing repositories
	Client             ClientRepository
	ClientGroup         ClientGroupRepository
	LoyaltyProgram      LoyaltyProgramRepository
	Promotion           PromotionRepository
	Exclusion           ExclusionRepository
}

// NewRepositories создает все репозитории
func NewRepositories(db *gorm.DB) *Repositories {
	return &Repositories{
		User:         NewUserRepository(db),
		Role:         NewRoleRepository(db),
		Establishment: NewEstablishmentRepository(db),
		Room:         NewRoomRepository(db),
		Table:        NewTableRepository(db),
		Product:            NewProductRepository(db),
		TechCard:           NewTechCardRepository(db),
		SemiFinished:       NewSemiFinishedRepository(db),
		Ingredient:         NewIngredientRepository(db),
		Category:           NewCategoryRepository(db),
		IngredientCategory: NewIngredientCategoryRepository(db),
		Warehouse:          NewWarehouseRepository(db),
		Workshop:           NewWorkshopRepository(db),
		Supplier:           NewSupplierRepository(db),
		Order:        NewOrderRepository(db),
		Transaction:  NewTransactionRepository(db),
		Shift:        NewShiftRepository(db),
		ShiftSession: NewShiftSessionRepository(db),
		Onboarding:   NewOnboardingRepository(db),
		Subscription: NewSubscriptionRepository(db),
		Token:        NewTokenRepository(db),
		Account:      NewAccountRepository(db),
		AccountType:  NewAccountTypeRepository(db),
		Inventory:    NewInventoryRepository(db),
		Client:             NewClientRepository(db),
		ClientGroup:         NewClientGroupRepository(db),
		LoyaltyProgram:      NewLoyaltyProgramRepository(db),
		Promotion:           NewPromotionRepository(db),
		Exclusion:           NewExclusionRepository(db),
	}
}

// BoolPtr возвращает указатель на булево значение
func BoolPtr(b bool) *bool {
	return &b
}
