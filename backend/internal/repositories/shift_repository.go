package repositories

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type ShiftRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*models.Shift, error)
	List(ctx context.Context) ([]*models.Shift, error)
}

type shiftRepository struct {
	db *gorm.DB
}

func NewShiftRepository(db *gorm.DB) ShiftRepository {
	return &shiftRepository{db: db}
}

func (r *shiftRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Shift, error) {
	var shift models.Shift
	err := r.db.WithContext(ctx).First(&shift, "id = ?", id).Error
	return &shift, err
}

func (r *shiftRepository) List(ctx context.Context) ([]*models.Shift, error) {
	var shifts []*models.Shift
	err := r.db.WithContext(ctx).Find(&shifts).Error
	return shifts, err
}