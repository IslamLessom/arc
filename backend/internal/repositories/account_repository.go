package repositories

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type AccountFilter struct {
	EstablishmentID *uuid.UUID
	TypeID          *uuid.UUID
	Active          *bool
	Search          *string
}

type AccountRepository interface {
	Create(ctx context.Context, account *models.Account) error
	GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Account, error)
	List(ctx context.Context, filter *AccountFilter) ([]*models.Account, error)
	Update(ctx context.Context, account *models.Account) error
	Delete(ctx context.Context, id uuid.UUID) error
	UpdateBalance(ctx context.Context, id uuid.UUID, balance float64) error
}

type accountRepository struct {
	db *gorm.DB
}

func NewAccountRepository(db *gorm.DB) AccountRepository {
	return &accountRepository{db: db}
}

func (r *accountRepository) Create(ctx context.Context, account *models.Account) error {
	return r.db.WithContext(ctx).Create(account).Error
}

func (r *accountRepository) GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Account, error) {
	var account models.Account
	query := r.db.WithContext(ctx).Preload("Type").Preload("Establishment")
	
	if establishmentID != nil {
		query = query.Where("establishment_id = ?", *establishmentID)
	}
	
	err := query.First(&account, "id = ?", id).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &account, err
}

func (r *accountRepository) List(ctx context.Context, filter *AccountFilter) ([]*models.Account, error) {
	var accounts []*models.Account
	query := r.db.WithContext(ctx).Preload("Type").Preload("Establishment")
	
	if filter != nil {
		if filter.EstablishmentID != nil {
			query = query.Where("establishment_id = ?", *filter.EstablishmentID)
		}
		if filter.TypeID != nil {
			query = query.Where("type_id = ?", *filter.TypeID)
		}
		if filter.Active != nil {
			query = query.Where("active = ?", *filter.Active)
		}
		if filter.Search != nil && *filter.Search != "" {
			search := "%" + strings.ToLower(*filter.Search) + "%"
			query = query.Where("LOWER(name) LIKE ?", search)
		}
	}
	
	err := query.Order("created_at DESC").Find(&accounts).Error
	return accounts, err
}

func (r *accountRepository) Update(ctx context.Context, account *models.Account) error {
	return r.db.WithContext(ctx).Save(account).Error
}

func (r *accountRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Account{}, "id = ?", id).Error
}

func (r *accountRepository) UpdateBalance(ctx context.Context, id uuid.UUID, balance float64) error {
	return r.db.WithContext(ctx).
		Model(&models.Account{}).
		Where("id = ?", id).
		Update("balance", balance).Error
}

// AccountTypeRepository для работы с типами счетов
type AccountTypeRepository interface {
	GetAll(ctx context.Context) ([]*models.AccountType, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.AccountType, error)
	GetByName(ctx context.Context, name string) (*models.AccountType, error)
	Create(ctx context.Context, accountType *models.AccountType) error
}

type accountTypeRepository struct {
	db *gorm.DB
}

func NewAccountTypeRepository(db *gorm.DB) AccountTypeRepository {
	return &accountTypeRepository{db: db}
}

func (r *accountTypeRepository) GetAll(ctx context.Context) ([]*models.AccountType, error) {
	var types []*models.AccountType
	err := r.db.WithContext(ctx).Find(&types).Error
	return types, err
}

func (r *accountTypeRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.AccountType, error) {
	var accountType models.AccountType
	err := r.db.WithContext(ctx).First(&accountType, "id = ?", id).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &accountType, err
}

func (r *accountTypeRepository) GetByName(ctx context.Context, name string) (*models.AccountType, error) {
	var accountType models.AccountType
	err := r.db.WithContext(ctx).Where("name = ?", name).First(&accountType).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &accountType, err
}

func (r *accountTypeRepository) Create(ctx context.Context, accountType *models.AccountType) error {
	return r.db.WithContext(ctx).Create(accountType).Error
}
