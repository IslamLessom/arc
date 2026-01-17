package repositories

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type TransactionRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*models.Transaction, error)
	List(ctx context.Context) ([]*models.Transaction, error)
}

type transactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) TransactionRepository {
	return &transactionRepository{db: db}
}

func (r *transactionRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Transaction, error) {
	var transaction models.Transaction
	err := r.db.WithContext(ctx).First(&transaction, "id = ?", id).Error
	return &transaction, err
}

func (r *transactionRepository) List(ctx context.Context) ([]*models.Transaction, error) {
	var transactions []*models.Transaction
	err := r.db.WithContext(ctx).Find(&transactions).Error
	return transactions, err
}