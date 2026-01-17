package repositories

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type CategoryFilter struct {
	EstablishmentID *uuid.UUID
	Type            *string // product, tech_card, semi_finished
	Search          *string
}

type CategoryRepository interface {
	GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Category, error)
	List(ctx context.Context, filter *CategoryFilter) ([]*models.Category, error)
	Create(ctx context.Context, category *models.Category) error
	Update(ctx context.Context, category *models.Category) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type categoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) CategoryRepository {
	return &categoryRepository{db: db}
}

func (r *categoryRepository) GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Category, error) {
	var c models.Category
	q := r.db.WithContext(ctx)
	if establishmentID != nil {
		q = q.Where("establishment_id = ?", *establishmentID)
	}
	err := q.First(&c, "id = ?", id).Error
	return &c, err
}

func (r *categoryRepository) List(ctx context.Context, filter *CategoryFilter) ([]*models.Category, error) {
	var list []*models.Category
	query := r.db.WithContext(ctx)

	if filter != nil {
		if filter.EstablishmentID != nil {
			query = query.Where("establishment_id = ?", *filter.EstablishmentID)
		}
		if filter.Type != nil && *filter.Type != "" {
			query = query.Where("type = ?", *filter.Type)
		}
		if filter.Search != nil && *filter.Search != "" {
			search := "%" + strings.ToLower(*filter.Search) + "%"
			query = query.Where("LOWER(name) LIKE ?", search)
		}
	}

	err := query.Find(&list).Error
	return list, err
}

func (r *categoryRepository) Create(ctx context.Context, category *models.Category) error {
	return r.db.WithContext(ctx).Create(category).Error
}

func (r *categoryRepository) Update(ctx context.Context, category *models.Category) error {
	return r.db.WithContext(ctx).Save(category).Error
}

func (r *categoryRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Category{}, "id = ?", id).Error
}
