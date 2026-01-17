package repositories

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type IngredientCategoryFilter struct {
	EstablishmentID *uuid.UUID
	Search          *string
}

type IngredientCategoryRepository interface {
	GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.IngredientCategory, error)
	List(ctx context.Context, filter *IngredientCategoryFilter) ([]*models.IngredientCategory, error)
	Create(ctx context.Context, c *models.IngredientCategory) error
	Update(ctx context.Context, c *models.IngredientCategory) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type ingredientCategoryRepository struct {
	db *gorm.DB
}

func NewIngredientCategoryRepository(db *gorm.DB) IngredientCategoryRepository {
	return &ingredientCategoryRepository{db: db}
}

func (r *ingredientCategoryRepository) GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.IngredientCategory, error) {
	var c models.IngredientCategory
	q := r.db.WithContext(ctx)
	if establishmentID != nil {
		q = q.Where("establishment_id = ?", *establishmentID)
	}
	err := q.First(&c, "id = ?", id).Error
	return &c, err
}

func (r *ingredientCategoryRepository) List(ctx context.Context, filter *IngredientCategoryFilter) ([]*models.IngredientCategory, error) {
	var list []*models.IngredientCategory
	query := r.db.WithContext(ctx)

	if filter != nil {
		if filter.EstablishmentID != nil {
			query = query.Where("establishment_id = ?", *filter.EstablishmentID)
		}
		if filter.Search != nil && *filter.Search != "" {
			search := "%" + strings.ToLower(*filter.Search) + "%"
			query = query.Where("LOWER(name) LIKE ?", search)
		}
	}

	err := query.Find(&list).Error
	return list, err
}

func (r *ingredientCategoryRepository) Create(ctx context.Context, c *models.IngredientCategory) error {
	return r.db.WithContext(ctx).Create(c).Error
}

func (r *ingredientCategoryRepository) Update(ctx context.Context, c *models.IngredientCategory) error {
	return r.db.WithContext(ctx).Save(c).Error
}

func (r *ingredientCategoryRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.IngredientCategory{}, "id = ?", id).Error
}
