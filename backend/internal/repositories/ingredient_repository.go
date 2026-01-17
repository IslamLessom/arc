package repositories

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type IngredientFilter struct {
	EstablishmentID *uuid.UUID
	CategoryID     *uuid.UUID
	Unit           *string
	Search         *string
	Active         *bool
}

type IngredientRepository interface {
	GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Ingredient, error)
	List(ctx context.Context, filter *IngredientFilter) ([]*models.Ingredient, error)
	Create(ctx context.Context, ingredient *models.Ingredient) error
	Update(ctx context.Context, ingredient *models.Ingredient) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type ingredientRepository struct {
	db *gorm.DB
}

func NewIngredientRepository(db *gorm.DB) IngredientRepository {
	return &ingredientRepository{db: db}
}

func (r *ingredientRepository) GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Ingredient, error) {
	var ingredient models.Ingredient
	q := r.db.WithContext(ctx).Preload("Category")
	if establishmentID != nil {
		q = q.Where("establishment_id = ?", *establishmentID)
	}
	err := q.First(&ingredient, "id = ?", id).Error
	return &ingredient, err
}

func (r *ingredientRepository) List(ctx context.Context, filter *IngredientFilter) ([]*models.Ingredient, error) {
	var ingredients []*models.Ingredient
	query := r.db.WithContext(ctx).Preload("Category")

	if filter != nil {
		if filter.EstablishmentID != nil {
			query = query.Where("establishment_id = ?", *filter.EstablishmentID)
		}
		if filter.CategoryID != nil {
			query = query.Where("category_id = ?", *filter.CategoryID)
		}
		if filter.Unit != nil {
			query = query.Where("unit = ?", *filter.Unit)
		}
		if filter.Search != nil && *filter.Search != "" {
			search := "%" + strings.ToLower(*filter.Search) + "%"
			query = query.Where("LOWER(name) LIKE ?", search)
		}
		if filter.Active != nil {
			query = query.Where("active = ?", *filter.Active)
		}
	}

	err := query.Find(&ingredients).Error
	return ingredients, err
}

func (r *ingredientRepository) Create(ctx context.Context, ingredient *models.Ingredient) error {
	return r.db.WithContext(ctx).Create(ingredient).Error
}

func (r *ingredientRepository) Update(ctx context.Context, ingredient *models.Ingredient) error {
	return r.db.WithContext(ctx).Save(ingredient).Error
}

func (r *ingredientRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Ingredient{}, "id = ?", id).Error
}