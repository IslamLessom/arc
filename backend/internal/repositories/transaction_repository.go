package repositories

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type TransactionFilter struct {
	EstablishmentID *uuid.UUID
	AccountID       *uuid.UUID
	Type            *string // income, expense, transfer
	Category        *string
	StartDate       *time.Time
	EndDate         *time.Time
	Search          *string // Поиск по описанию
	ShiftID         *uuid.UUID
}

type TransactionRepository interface {
	Create(ctx context.Context, transaction *models.Transaction) error
	GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Transaction, error)
	List(ctx context.Context, filter *TransactionFilter) ([]*models.Transaction, error)
	Update(ctx context.Context, transaction *models.Transaction) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type transactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) TransactionRepository {
	return &transactionRepository{db: db}
}

func (r *transactionRepository) Create(ctx context.Context, transaction *models.Transaction) error {
	// Используем транзакцию для атомарного обновления
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Создаем транзакцию
		if err := tx.Create(transaction).Error; err != nil {
			return err
		}

		// Обновляем баланс счета
		var account models.Account
		if err := tx.First(&account, "id = ?", transaction.AccountID).Error; err != nil {
			return err
		}

		// В зависимости от типа транзакции изменяем баланс
		switch transaction.Type {
		case "income":
			account.Balance += transaction.Amount
		case "expense":
			account.Balance -= transaction.Amount
		case "transfer":
			// Для transfer логика более сложная - может быть как доход так и расход
			// Пока оставляем как есть
		}

		// Сохраняем обновленный баланс
		return tx.Save(&account).Error
	})
}

func (r *transactionRepository) GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Transaction, error) {
	var transaction models.Transaction
	query := r.db.WithContext(ctx).
		Preload("Account").
		Preload("Account.Type").
		Preload("Establishment")
	
	if establishmentID != nil {
		query = query.Where("establishment_id = ?", *establishmentID)
	}
	
	err := query.First(&transaction, "id = ?", id).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &transaction, err
}

func (r *transactionRepository) List(ctx context.Context, filter *TransactionFilter) ([]*models.Transaction, error) {
	var transactions []*models.Transaction
	query := r.db.WithContext(ctx).
		Preload("Account").
		Preload("Account.Type").
		Preload("Establishment").
		Preload("Order").
		Preload("Shift")
	
	if filter != nil {
		if filter.EstablishmentID != nil {
			query = query.Where("establishment_id = ?", *filter.EstablishmentID)
		}
		if filter.AccountID != nil {
			query = query.Where("account_id = ?", *filter.AccountID)
		}
		if filter.Type != nil && *filter.Type != "" {
			query = query.Where("type = ?", *filter.Type)
		}
		if filter.Category != nil && *filter.Category != "" {
			query = query.Where("category = ?", *filter.Category)
		}
		if filter.StartDate != nil {
			query = query.Where("transaction_date >= ?", *filter.StartDate)
		}
		if filter.EndDate != nil {
			query = query.Where("transaction_date <= ?", *filter.EndDate)
		}
		if filter.ShiftID != nil {
			query = query.Where("shift_id = ?", *filter.ShiftID)
		}
		if filter.Search != nil && *filter.Search != "" {
			search := "%" + strings.ToLower(*filter.Search) + "%"
			query = query.Where("LOWER(description) LIKE ? OR LOWER(category) LIKE ?", search, search)
		}
	}
	
	err := query.Order("transaction_date DESC, created_at DESC").Find(&transactions).Error
	return transactions, err
}

func (r *transactionRepository) Update(ctx context.Context, transaction *models.Transaction) error {
	return r.db.WithContext(ctx).Save(transaction).Error
}

func (r *transactionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Transaction{}, "id = ?", id).Error
}