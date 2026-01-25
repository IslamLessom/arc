package repositories

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type TableRepository interface {
	GetByID(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.Table, error)
	ListByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Table, error)
	Create(ctx context.Context, table *models.Table) error
	CreateBatch(ctx context.Context, tables []*models.Table) error
	Update(ctx context.Context, table *models.Table, establishmentID uuid.UUID) error
	Delete(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error
}

type tableRepository struct {
	db *gorm.DB
}

func NewTableRepository(db *gorm.DB) TableRepository {
	return &tableRepository{db: db}
}

func (r *tableRepository) CreateBatch(ctx context.Context, tables []*models.Table) error {
	return r.db.WithContext(ctx).Create(&tables).Error
}

func (r *tableRepository) GetByID(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.Table, error) {
	var table models.Table
	err := r.db.WithContext(ctx).Where("establishment_id = ?", establishmentID).First(&table, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTableNotFound
		}
		return nil, err
	}
	return &table, nil
}

func (r *tableRepository) ListByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Table, error) {
	var tables []*models.Table
	err := r.db.WithContext(ctx).Where("establishment_id = ?", establishmentID).Find(&tables).Error
	return tables, err
}

func (r *tableRepository) Create(ctx context.Context, table *models.Table) error {
	return r.db.WithContext(ctx).Create(table).Error
}

func (r *tableRepository) Update(ctx context.Context, table *models.Table, establishmentID uuid.UUID) error {
	return r.db.WithContext(ctx).Where("establishment_id = ?", establishmentID).Save(table).Error
}

func (r *tableRepository) Delete(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error {
	return r.db.WithContext(ctx).Where("establishment_id = ?", establishmentID).Delete(&models.Table{}, "id = ?", id).Error
}