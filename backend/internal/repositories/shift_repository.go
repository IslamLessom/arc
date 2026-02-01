package repositories

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type ShiftFilter struct {
	EstablishmentID *uuid.UUID
	StartDate       *time.Time
	EndDate         *time.Time
}

type ShiftRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*models.Shift, error)
	GetActiveShiftByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) (*models.Shift, error)
	ListByFilter(ctx context.Context, filter *ShiftFilter) ([]*models.Shift, error)
	Create(ctx context.Context, shift *models.Shift) error
	Update(ctx context.Context, shift *models.Shift) error
}

type shiftRepository struct {
	db *gorm.DB
}

func NewShiftRepository(db *gorm.DB) ShiftRepository {
	return &shiftRepository{db: db}
}

func (r *shiftRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Shift, error) {
	var shift models.Shift
	err := r.db.WithContext(ctx).
		Preload("Sessions").
		First(&shift, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrShiftNotFound
		}
		return nil, err
	}
	return &shift, nil
}

func (r *shiftRepository) Create(ctx context.Context, shift *models.Shift) error {
	return r.db.WithContext(ctx).Create(shift).Error
}

func (r *shiftRepository) Update(ctx context.Context, shift *models.Shift) error {
	return r.db.WithContext(ctx).Save(shift).Error
}

// GetActiveShiftByEstablishmentID находит активную смену заведения (end_time IS NULL)
func (r *shiftRepository) GetActiveShiftByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) (*models.Shift, error) {
	var shift models.Shift
	err := r.db.WithContext(ctx).
		Preload("Sessions").
		Where("establishment_id = ? AND end_time IS NULL", establishmentID).
		First(&shift).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrShiftNotFound
		}
		return nil, err
	}
	return &shift, nil
}

func (r *shiftRepository) ListByFilter(ctx context.Context, filter *ShiftFilter) ([]*models.Shift, error) {
	var shifts []*models.Shift
	query := r.db.WithContext(ctx).Preload("Sessions")

	if filter != nil {
		if filter.EstablishmentID != nil {
			query = query.Where("establishment_id = ?", *filter.EstablishmentID)
		}
		if filter.StartDate != nil {
			query = query.Where("start_time >= ?", *filter.StartDate)
		}
		if filter.EndDate != nil {
			query = query.Where("end_time <= ? OR end_time IS NULL", *filter.EndDate)
		}
	}

	err := query.Order("start_time DESC").Find(&shifts).Error
	return shifts, err
}