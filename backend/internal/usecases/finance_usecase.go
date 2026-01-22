package usecases

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

type FinanceUseCase struct {
	transactionRepo repositories.TransactionRepository
	accountRepo     repositories.AccountRepository
	shiftRepo       repositories.ShiftRepository
}

func NewFinanceUseCase(
	transactionRepo repositories.TransactionRepository,
	accountRepo repositories.AccountRepository,
	shiftRepo repositories.ShiftRepository,
) *FinanceUseCase {
	return &FinanceUseCase{
		transactionRepo: transactionRepo,
		accountRepo:     accountRepo,
		shiftRepo:       shiftRepo,
	}
}

// ——— Transactions ———

// CreateTransaction создает транзакцию и обновляет баланс счета
func (uc *FinanceUseCase) CreateTransaction(ctx context.Context, transaction *models.Transaction, establishmentID uuid.UUID) error {
	// Проверяем, что счет принадлежит заведению
	account, err := uc.accountRepo.GetByID(ctx, transaction.AccountID, &establishmentID)
	if err != nil || account == nil {
		return errors.New("account not found or access denied")
	}
	
	transaction.EstablishmentID = establishmentID
	
	// Если дата транзакции не указана, используем текущую
	if transaction.TransactionDate.IsZero() {
		transaction.TransactionDate = time.Now()
	}
	
	// Создаем транзакцию
	if err := uc.transactionRepo.Create(ctx, transaction); err != nil {
		return err
	}
	
	// Обновляем баланс счета в зависимости от типа транзакции
	if transaction.Type == "income" {
		// Доход - добавляем деньги
		account.CurrentBalance += transaction.Amount
	} else if transaction.Type == "expense" {
		// Расход - отнимаем деньги
		if account.CurrentBalance < transaction.Amount {
			return errors.New("insufficient balance")
		}
		account.CurrentBalance -= transaction.Amount
	}
	// Для transfer логика будет сложнее (перевод между счетами) - TODO
	
	if err := uc.accountRepo.UpdateBalance(ctx, transaction.AccountID, account.CurrentBalance); err != nil {
		return err
	}
	
	return nil
}

// GetTransaction возвращает транзакцию по ID
func (uc *FinanceUseCase) GetTransaction(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.Transaction, error) {
	return uc.transactionRepo.GetByID(ctx, id, &establishmentID)
}

// ListTransactions возвращает список транзакций с фильтрацией
func (uc *FinanceUseCase) ListTransactions(ctx context.Context, establishmentID uuid.UUID, filter *repositories.TransactionFilter) ([]*models.Transaction, error) {
	if filter == nil {
		filter = &repositories.TransactionFilter{}
	}
	filter.EstablishmentID = &establishmentID
	return uc.transactionRepo.List(ctx, filter)
}

// UpdateTransaction обновляет транзакцию и пересчитывает баланс
func (uc *FinanceUseCase) UpdateTransaction(ctx context.Context, transaction *models.Transaction, establishmentID uuid.UUID) error {
	// Получаем существующую транзакцию
	existing, err := uc.transactionRepo.GetByID(ctx, transaction.ID, &establishmentID)
	if err != nil || existing == nil {
		return errors.New("transaction not found or access denied")
	}
	
	// Проверяем, что новый счет принадлежит заведению (если изменился)
	if transaction.AccountID != existing.AccountID {
		account, err := uc.accountRepo.GetByID(ctx, transaction.AccountID, &establishmentID)
		if err != nil || account == nil {
			return errors.New("account not found or access denied")
		}
	}
	
	// Откатываем изменения от старой транзакции
	oldAccount, _ := uc.accountRepo.GetByID(ctx, existing.AccountID, nil)
	if oldAccount != nil {
		if existing.Type == "income" {
			oldAccount.CurrentBalance -= existing.Amount
		} else if existing.Type == "expense" {
			oldAccount.CurrentBalance += existing.Amount
		}
		uc.accountRepo.UpdateBalance(ctx, existing.AccountID, oldAccount.CurrentBalance)
	}
	
	// Применяем изменения новой транзакции
	newAccount, _ := uc.accountRepo.GetByID(ctx, transaction.AccountID, nil)
	if newAccount != nil {
		if transaction.Type == "income" {
			newAccount.CurrentBalance += transaction.Amount
		} else if transaction.Type == "expense" {
			newAccount.CurrentBalance -= transaction.Amount
		}
		uc.accountRepo.UpdateBalance(ctx, transaction.AccountID, newAccount.CurrentBalance)
	}
	
	// Обновляем транзакцию
	return uc.transactionRepo.Update(ctx, transaction)
}

// DeleteTransaction удаляет транзакцию и откатывает изменения баланса
func (uc *FinanceUseCase) DeleteTransaction(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error {
	transaction, err := uc.transactionRepo.GetByID(ctx, id, &establishmentID)
	if err != nil || transaction == nil {
		return errors.New("transaction not found or access denied")
	}
	
	// Откатываем изменения баланса
	account, err := uc.accountRepo.GetByID(ctx, transaction.AccountID, nil)
	if err == nil && account != nil {
		if transaction.Type == "income" {
			account.CurrentBalance -= transaction.Amount
		} else if transaction.Type == "expense" {
			account.CurrentBalance += transaction.Amount
		}
		uc.accountRepo.UpdateBalance(ctx, transaction.AccountID, account.CurrentBalance)
	}
	
	// Удаляем транзакцию
	return uc.transactionRepo.Delete(ctx, id)
}