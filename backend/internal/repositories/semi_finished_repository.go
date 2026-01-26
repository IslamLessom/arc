package repositories

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type SemiFinishedFilter struct {
	EstablishmentID *uuid.UUID
	CategoryID     *uuid.UUID
	WorkshopID     *uuid.UUID
	Search         *string
	Active         *bool
}

type SemiFinishedRepository interface {
	GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.SemiFinishedProduct, error)
	List(ctx context.Context, filter *SemiFinishedFilter) ([]*models.SemiFinishedProduct, error)
	Create(ctx context.Context, semiFinished *models.SemiFinishedProduct) error
	Update(ctx context.Context, semiFinished *models.SemiFinishedProduct) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type semiFinishedRepository struct {
	db *gorm.DB
}

func NewSemiFinishedRepository(db *gorm.DB) SemiFinishedRepository {
	return &semiFinishedRepository{db: db}
}

func (r *semiFinishedRepository) GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.SemiFinishedProduct, error) {
	var semiFinished models.SemiFinishedProduct
	q := r.db.WithContext(ctx).
		Preload("Ingredients.Ingredient").
		Preload("Category").
		Preload("Workshop")
	if establishmentID != nil {
		q = q.Where("establishment_id = ?", *establishmentID)
	}
	err := q.First(&semiFinished, "id = ?", id).Error
	return &semiFinished, err
}

func (r *semiFinishedRepository) List(ctx context.Context, filter *SemiFinishedFilter) ([]*models.SemiFinishedProduct, error) {
	var semiFinishedProducts []*models.SemiFinishedProduct
	query := r.db.WithContext(ctx).
		Preload("Ingredients.Ingredient").
		Preload("Category").
		Preload("Workshop")

	if filter != nil {
		if filter.EstablishmentID != nil {
			query = query.Where("establishment_id = ?", *filter.EstablishmentID)
		}
		if filter.CategoryID != nil {
			query = query.Where("category_id = ?", *filter.CategoryID)
		}
		if filter.WorkshopID != nil {
			query = query.Where("workshop_id = ?", *filter.WorkshopID)
		}
		if filter.Search != nil && *filter.Search != "" {
			search := "%" + strings.ToLower(*filter.Search) + "%"
			query = query.Where("LOWER(name) LIKE ?", search)
		}
		if filter.Active != nil {
			query = query.Where("active = ?", *filter.Active)
		}
	}

	err := query.Find(&semiFinishedProducts).Error
	return semiFinishedProducts, err
}

func (r *semiFinishedRepository) Create(ctx context.Context, semiFinished *models.SemiFinishedProduct) error {
	return r.db.WithContext(ctx).Create(semiFinished).Error
}

func (r *semiFinishedRepository) Update(ctx context.Context, semiFinished *models.SemiFinishedProduct) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Обновляем основную информацию о полуфабрикате
		if err := tx.Model(semiFinished).Updates(map[string]interface{}{
			"name":            semiFinished.Name,
			"category_id":     semiFinished.CategoryID,
			"workshop_id":     semiFinished.WorkshopID,
			"description":      semiFinished.Description,
			"cooking_process": semiFinished.CookingProcess,
			"cover_image":     semiFinished.CoverImage,
			"unit":            semiFinished.Unit,
			"quantity":        semiFinished.Quantity,
			"cost_price":      semiFinished.CostPrice,
			"active":          semiFinished.Active,
		}).Error; err != nil {
			return err
		}

		// Удаляем старые ингредиенты
		if err := tx.Where("semi_finished_id = ?", semiFinished.ID).Delete(&models.SemiFinishedIngredient{}).Error; err != nil {
			return err
		}

		// Добавляем новые ингредиенты
		if len(semiFinished.Ingredients) > 0 {
			for i := range semiFinished.Ingredients {
				semiFinished.Ingredients[i].SemiFinishedID = semiFinished.ID
			}
			if err := tx.Create(&semiFinished.Ingredients).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *semiFinishedRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.SemiFinishedProduct{}, "id = ?", id).Error
}
