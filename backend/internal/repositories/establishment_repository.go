package repositories

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type EstablishmentRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*models.Establishment, error)
	List(ctx context.Context) ([]*models.Establishment, error)
	Create(ctx context.Context, establishment *models.Establishment) error
	Update(ctx context.Context, establishment *models.Establishment) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type establishmentRepository struct {
	db *gorm.DB
}

func NewEstablishmentRepository(db *gorm.DB) EstablishmentRepository {
	return &establishmentRepository{db: db}
}

func (r *establishmentRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Establishment, error) {
	var establishment models.Establishment
	err := r.db.WithContext(ctx).Preload("Tables").First(&establishment, "id = ?", id).Error
	return &establishment, err
}

func (r *establishmentRepository) List(ctx context.Context) ([]*models.Establishment, error) {
	var establishments []*models.Establishment
	err := r.db.WithContext(ctx).Find(&establishments).Error
	return establishments, err
}

func (r *establishmentRepository) Create(ctx context.Context, establishment *models.Establishment) error {
	return r.db.WithContext(ctx).Create(establishment).Error
}

func (r *establishmentRepository) Update(ctx context.Context, establishment *models.Establishment) error {
	return r.db.WithContext(ctx).Save(establishment).Error
}

func (r *establishmentRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Establishment{}, "id = ?", id).Error
}