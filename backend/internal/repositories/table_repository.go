package repositories

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type TableRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*models.Table, error)
	GetByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Table, error)
	GetByNumber(ctx context.Context, establishmentID uuid.UUID, number int) (*models.Table, error)
	Create(ctx context.Context, table *models.Table) error
	CreateBatch(ctx context.Context, tables []*models.Table) error
	Update(ctx context.Context, table *models.Table) error
	UpdatePosition(ctx context.Context, id uuid.UUID, x, y, rotation float64) error
	UpdateStatus(ctx context.Context, id uuid.UUID, status string) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type tableRepository struct {
	db *gorm.DB
}

func NewTableRepository(db *gorm.DB) TableRepository {
	return &tableRepository{db: db}
}

func (r *tableRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Table, error) {
	var table models.Table
	err := r.db.WithContext(ctx).First(&table, "id = ?", id).Error
	return &table, err
}

func (r *tableRepository) GetByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Table, error) {
	var tables []*models.Table
	err := r.db.WithContext(ctx).Where("establishment_id = ?", establishmentID).Find(&tables).Error
	return tables, err
}

func (r *tableRepository) GetByNumber(ctx context.Context, establishmentID uuid.UUID, number int) (*models.Table, error) {
	var table models.Table
	err := r.db.WithContext(ctx).Where("establishment_id = ? AND number = ?", establishmentID, number).First(&table).Error
	return &table, err
}

func (r *tableRepository) Create(ctx context.Context, table *models.Table) error {
	return r.db.WithContext(ctx).Create(table).Error
}

func (r *tableRepository) CreateBatch(ctx context.Context, tables []*models.Table) error {
	if len(tables) == 0 {
		return nil
	}
	return r.db.WithContext(ctx).CreateInBatches(tables, 100).Error
}

func (r *tableRepository) Update(ctx context.Context, table *models.Table) error {
	return r.db.WithContext(ctx).Save(table).Error
}

func (r *tableRepository) UpdatePosition(ctx context.Context, id uuid.UUID, x, y, rotation float64) error {
	return r.db.WithContext(ctx).Model(&models.Table{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"position_x": x,
			"position_y": y,
			"rotation":    rotation,
		}).Error
}

func (r *tableRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	return r.db.WithContext(ctx).Model(&models.Table{}).Where("id = ?", id).Update("status", status).Error
}

func (r *tableRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Table{}, "id = ?", id).Error
}