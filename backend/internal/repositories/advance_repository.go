package repositories

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type AdvanceRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*models.Advance, error)
	Create(ctx context.Context, advance *models.Advance) error
	Update(ctx context.Context, advance *models.Advance) error
	Delete(ctx context.Context, id uuid.UUID) error
	ListByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Advance, error)
	ListByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Advance, error)
	ListByEstablishmentIDAndStatus(ctx context.Context, establishmentID uuid.UUID, status string) ([]*models.Advance, error)
	ListByUserIDAndDateRange(ctx context.Context, userID uuid.UUID, startDate, endDate time.Time) ([]*models.Advance, error)
	ListByUserIDAndStatus(ctx context.Context, userID uuid.UUID, status string) ([]*models.Advance, error)
	ListPendingByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Advance, error)
}

type advanceRepository struct {
	db *gorm.DB
}

func NewAdvanceRepository(db *gorm.DB) AdvanceRepository {
	return &advanceRepository{db: db}
}

func (r *advanceRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Advance, error) {
	var advance models.Advance
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Establishment").
		First(&advance, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrAdvanceNotFound
		}
		return nil, err
	}
	return &advance, nil
}

func (r *advanceRepository) Create(ctx context.Context, advance *models.Advance) error {
	return r.db.WithContext(ctx).Create(advance).Error
}

func (r *advanceRepository) Update(ctx context.Context, advance *models.Advance) error {
	return r.db.WithContext(ctx).Save(advance).Error
}

func (r *advanceRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Advance{}, "id = ?", id).Error
}

func (r *advanceRepository) ListByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Advance, error) {
	var advances []*models.Advance
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Establishment").
		Where("user_id = ?", userID).
		Order("given_date DESC").
		Find(&advances).Error
	return advances, err
}

func (r *advanceRepository) ListByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Advance, error) {
	var advances []*models.Advance
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Establishment").
		Where("establishment_id = ?", establishmentID).
		Order("given_date DESC").
		Find(&advances).Error
	return advances, err
}

func (r *advanceRepository) ListByEstablishmentIDAndStatus(ctx context.Context, establishmentID uuid.UUID, status string) ([]*models.Advance, error) {
	var advances []*models.Advance
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Establishment").
		Where("establishment_id = ? AND status = ?", establishmentID, status).
		Order("given_date DESC").
		Find(&advances).Error
	return advances, err
}

func (r *advanceRepository) ListByUserIDAndDateRange(ctx context.Context, userID uuid.UUID, startDate, endDate time.Time) ([]*models.Advance, error) {
	var advances []*models.Advance
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Establishment").
		Where("user_id = ? AND given_date >= ? AND given_date <= ?", userID, startDate, endDate).
		Order("given_date DESC").
		Find(&advances).Error
	return advances, err
}

func (r *advanceRepository) ListByUserIDAndStatus(ctx context.Context, userID uuid.UUID, status string) ([]*models.Advance, error) {
	var advances []*models.Advance
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Establishment").
		Where("user_id = ? AND status = ?", userID, status).
		Order("given_date DESC").
		Find(&advances).Error
	return advances, err
}

func (r *advanceRepository) ListPendingByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Advance, error) {
	var advances []*models.Advance
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Establishment").
		Where("establishment_id = ? AND status = ?", establishmentID, "pending").
		Order("given_date DESC").
		Find(&advances).Error
	return advances, err
}
