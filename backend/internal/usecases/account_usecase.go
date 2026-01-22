package usecases

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

type AccountUseCase struct {
	repo         repositories.AccountRepository
	accountTypeRepo repositories.AccountTypeRepository
}

func NewAccountUseCase(
	repo repositories.AccountRepository,
	accountTypeRepo repositories.AccountTypeRepository,
) *AccountUseCase {
	return &AccountUseCase{
		repo:           repo,
		accountTypeRepo: accountTypeRepo,
	}
}

// ListAccounts возвращает список счетов заведения
func (uc *AccountUseCase) ListAccounts(ctx context.Context, establishmentID uuid.UUID, filter *repositories.AccountFilter) ([]*models.Account, error) {
	if filter == nil {
		filter = &repositories.AccountFilter{}
	}
	filter.EstablishmentID = &establishmentID
	return uc.repo.List(ctx, filter)
}

// GetAccount возвращает счет по ID
func (uc *AccountUseCase) GetAccount(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.Account, error) {
	return uc.repo.GetByID(ctx, id, &establishmentID)
}

// CreateAccount создает новый счет
func (uc *AccountUseCase) CreateAccount(ctx context.Context, account *models.Account, establishmentID uuid.UUID) error {
	// Проверяем, что тип счета существует
	if _, err := uc.accountTypeRepo.GetByID(ctx, account.TypeID); err != nil {
		return errors.New("account type not found")
	}
	
	account.EstablishmentID = establishmentID
	account.CurrentBalance = account.InitialBalance
	
	return uc.repo.Create(ctx, account)
}

// UpdateAccount обновляет счет
func (uc *AccountUseCase) UpdateAccount(ctx context.Context, account *models.Account, establishmentID uuid.UUID) error {
	existing, err := uc.repo.GetByID(ctx, account.ID, &establishmentID)
	if err != nil || existing == nil {
		return errors.New("account not found or access denied")
	}
	
	// Не позволяем изменять текущий баланс напрямую (он обновляется через транзакции)
	account.CurrentBalance = existing.CurrentBalance
	
	return uc.repo.Update(ctx, account)
}

// DeleteAccount удаляет счет
func (uc *AccountUseCase) DeleteAccount(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error {
	if _, err := uc.repo.GetByID(ctx, id, &establishmentID); err != nil {
		return errors.New("account not found or access denied")
	}
	return uc.repo.Delete(ctx, id)
}

// UpdateAccountBalance обновляет баланс счета (используется при создании/удалении транзакций)
func (uc *AccountUseCase) UpdateAccountBalance(ctx context.Context, accountID uuid.UUID, amount float64, transactionType string) error {
	account, err := uc.repo.GetByID(ctx, accountID, nil)
	if err != nil || account == nil {
		return errors.New("account not found")
	}
	
	account.UpdateBalance(amount, transactionType)
	return uc.repo.UpdateBalance(ctx, accountID, account.CurrentBalance)
}

// GetAccountTypes возвращает все типы счетов
func (uc *AccountUseCase) GetAccountTypes(ctx context.Context) ([]*models.AccountType, error) {
	return uc.accountTypeRepo.GetAll(ctx)
}

// CreateDefaultAccounts создает 3 счета по умолчанию для заведения
func (uc *AccountUseCase) CreateDefaultAccounts(ctx context.Context, establishmentID uuid.UUID) error {
	// Получаем типы счетов
	types, err := uc.accountTypeRepo.GetAll(ctx)
	if err != nil {
		return err
	}
	
	// Создаем маппинг типов по имени
	typeMap := make(map[string]*models.AccountType)
	for _, t := range types {
		typeMap[t.Name] = t
	}
	
	// Определяем какие типы нужны для дефолтных счетов
	defaultAccounts := []struct {
		name           string
		typeName       string
		initialBalance float64
	}{
		{"Денежный ящик", "наличные", 0},
		{"Расчетный счет", "безналичный счет", 0},
		{"Сейф", "наличные", 0},
	}
	
	for _, acc := range defaultAccounts {
		accountType, ok := typeMap[acc.typeName]
		if !ok {
			continue // Пропускаем если тип не найден
		}
		
		account := &models.Account{
			EstablishmentID: establishmentID,
			Name:           acc.name,
			Currency:       "RUB",
			TypeID:         accountType.ID,
			InitialBalance: acc.initialBalance,
			CurrentBalance: acc.initialBalance,
			Active:         true,
		}
		
		if err := uc.repo.Create(ctx, account); err != nil {
			return err
		}
	}
	
	return nil
}
