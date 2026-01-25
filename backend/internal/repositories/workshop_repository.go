package repositories

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type WorkshopRepository interface {
	CreateWorkshop(ctx context.Context, w *models.Workshop) error
	ListWorkshops(ctx context.Context, establishmentID uuid.UUID) ([]*models.Workshop, error)
	GetWorkshopByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Workshop, error)
	UpdateWorkshop(ctx context.Context, w *models.Workshop) error
	DeleteWorkshop(ctx context.Context, id uuid.UUID) error
}

type workshopRepository struct {
	db *gorm.DB
}

func NewWorkshopRepository(db *gorm.DB) WorkshopRepository {
	return &workshopRepository{db: db}
}

func (r *workshopRepository) CreateWorkshop(ctx context.Context, w *models.Workshop) error {
	return r.db.WithContext(ctx).Create(w).Error
}

func (r *workshopRepository) ListWorkshops(ctx context.Context, establishmentID uuid.UUID) ([]*models.Workshop, error) {
	var list []*models.Workshop
	err := r.db.WithContext(ctx).Where("establishment_id = ?", establishmentID).Find(&list).Error
	return list, err
}

func (r *workshopRepository) GetWorkshopByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Workshop, error) {
	var w models.Workshop
	q := r.db.WithContext(ctx)
	if establishmentID != nil {
		q = q.Where("establishment_id = ?", *establishmentID)
	}
	err := q.First(&w, "id = ?", id).Error
	return &w, err
}

func (r *workshopRepository) UpdateWorkshop(ctx context.Context, w *models.Workshop) error {
	return r.db.WithContext(ctx).Save(w).Error
}

func (r *workshopRepository) DeleteWorkshop(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Workshop{}, "id = ?", id).Error
}
