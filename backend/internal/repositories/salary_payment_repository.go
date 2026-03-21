package repositories

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

var ErrSalaryPaymentNotFound = errors.New("salary payment not found")
var ErrSalaryAlreadyPaid = errors.New("salary already paid for this period")

type SalaryPaymentRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*models.SalaryPayment, error)
	Create(ctx context.Context, payment *models.SalaryPayment) error
	Update(ctx context.Context, payment *models.SalaryPayment) error
	Delete(ctx context.Context, id uuid.UUID) error
	ListByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.SalaryPayment, error)
	ListByUserID(ctx context.Context, userID uuid.UUID) ([]*models.SalaryPayment, error)
	GetByUserAndPeriod(ctx context.Context, userID uuid.UUID, periodStart, periodEnd time.Time) (*models.SalaryPayment, error)
	CheckIfPaid(ctx context.Context, userID uuid.UUID, periodStart, periodEnd time.Time) (bool, error)
}

type salaryPaymentRepository struct {
	db *gorm.DB
}

func NewSalaryPaymentRepository(db *gorm.DB) SalaryPaymentRepository {
	return &salaryPaymentRepository{db: db}
}

func (r *salaryPaymentRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.SalaryPayment, error) {
	var payment models.SalaryPayment
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Establishment").
		Preload("Account").
		Preload("Transaction").
		Preload("PaidByUser").
		First(&payment, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrSalaryPaymentNotFound
		}
		return nil, err
	}
	return &payment, nil
}

func (r *salaryPaymentRepository) Create(ctx context.Context, payment *models.SalaryPayment) error {
	return r.db.WithContext(ctx).Create(payment).Error
}

func (r *salaryPaymentRepository) Update(ctx context.Context, payment *models.SalaryPayment) error {
	return r.db.WithContext(ctx).Save(payment).Error
}

func (r *salaryPaymentRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.SalaryPayment{}, "id = ?", id).Error
}

func (r *salaryPaymentRepository) ListByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.SalaryPayment, error) {
	var payments []*models.SalaryPayment
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Account").
		Preload("PaidByUser").
		Where("establishment_id = ?", establishmentID).
		Order("payment_date DESC").
		Find(&payments).Error
	return payments, err
}

func (r *salaryPaymentRepository) ListByUserID(ctx context.Context, userID uuid.UUID) ([]*models.SalaryPayment, error) {
	var payments []*models.SalaryPayment
	err := r.db.WithContext(ctx).
		Preload("Account").
		Preload("Transaction").
		Preload("PaidByUser").
		Where("user_id = ?", userID).
		Order("payment_date DESC").
		Find(&payments).Error
	return payments, err
}

func (r *salaryPaymentRepository) GetByUserAndPeriod(ctx context.Context, userID uuid.UUID, periodStart, periodEnd time.Time) (*models.SalaryPayment, error) {
	var payment models.SalaryPayment
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Account").
		Preload("Transaction").
		Preload("PaidByUser").
		Where("user_id = ? AND period_start = ? AND period_end = ?", userID, periodStart, periodEnd).
		First(&payment).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // Не найдено - это нормально
		}
		return nil, err
	}
	return &payment, nil
}

func (r *salaryPaymentRepository) CheckIfPaid(ctx context.Context, userID uuid.UUID, periodStart, periodEnd time.Time) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.SalaryPayment{}).
		Where("user_id = ? AND period_start = ? AND period_end = ?", userID, periodStart, periodEnd).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
