package repositories

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type TechCardFilter struct {
	EstablishmentID *uuid.UUID
	CategoryID     *uuid.UUID
	WorkshopID     *uuid.UUID
	Search         *string
	Active         *bool
}

type TechCardRepository interface {
	GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.TechCard, error)
	List(ctx context.Context, filter *TechCardFilter) ([]*models.TechCard, error)
	Create(ctx context.Context, techCard *models.TechCard) error
	Update(ctx context.Context, techCard *models.TechCard) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type techCardRepository struct {
	db *gorm.DB
}

func NewTechCardRepository(db *gorm.DB) TechCardRepository {
	return &techCardRepository{db: db}
}

func (r *techCardRepository) GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.TechCard, error) {
	var techCard models.TechCard
	q := r.db.WithContext(ctx).
		Preload("Ingredients.Ingredient").
		Preload("ModifierSets.Options").
		Preload("Category").
		Preload("Workshop")
	if establishmentID != nil {
		q = q.Where("establishment_id = ?", *establishmentID)
	}
	err := q.First(&techCard, "id = ?", id).Error
	return &techCard, err
}

func (r *techCardRepository) List(ctx context.Context, filter *TechCardFilter) ([]*models.TechCard, error) {
	var techCards []*models.TechCard
	query := r.db.WithContext(ctx).
		Preload("Ingredients.Ingredient").
		Preload("ModifierSets.Options").
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

	err := query.Find(&techCards).Error
	return techCards, err
}

func (r *techCardRepository) Create(ctx context.Context, techCard *models.TechCard) error {
	return r.db.WithContext(ctx).Create(techCard).Error
}

func (r *techCardRepository) Update(ctx context.Context, techCard *models.TechCard) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Обновляем основную информацию о тех-карте
		if err := tx.Model(techCard).Updates(map[string]interface{}{
			"name":                   techCard.Name,
			"category_id":            techCard.CategoryID,
			"workshop_id":            techCard.WorkshopID,
			"description":          techCard.Description,
			"cover_image":          techCard.CoverImage,
			"is_weighted":          techCard.IsWeighted,
			"exclude_from_discounts": techCard.ExcludeFromDiscounts,
			"cost_price":           techCard.CostPrice,
			"markup":               techCard.Markup,
			"price":                techCard.Price,
			"active":               techCard.Active,
		}).Error; err != nil {
			return err
		}

		// Удаляем старые ингредиенты
		if err := tx.Where("tech_card_id = ?", techCard.ID).Delete(&models.TechCardIngredient{}).Error; err != nil {
			return err
		}

		// Добавляем новые ингредиенты
		if len(techCard.Ingredients) > 0 {
			for i := range techCard.Ingredients {
				techCard.Ingredients[i].TechCardID = techCard.ID
			}
			if err := tx.Create(&techCard.Ingredients).Error; err != nil {
				return err
			}
		}

		// Удаляем старые наборы модификаторов и их опции
		var oldModifierSets []models.ModifierSet
		if err := tx.Where("tech_card_id = ?", techCard.ID).Find(&oldModifierSets).Error; err != nil {
			return err
		}
		for _, modSet := range oldModifierSets {
			if err := tx.Where("modifier_set_id = ?", modSet.ID).Delete(&models.ModifierOption{}).Error; err != nil {
				return err
			}
		}
		if err := tx.Where("tech_card_id = ?", techCard.ID).Delete(&models.ModifierSet{}).Error; err != nil {
			return err
		}

		// Добавляем новые наборы модификаторов
		if len(techCard.ModifierSets) > 0 {
			for i := range techCard.ModifierSets {
				techCard.ModifierSets[i].TechCardID = techCard.ID
				// Сохраняем опции отдельно, чтобы установить правильный ModifierSetID
				options := techCard.ModifierSets[i].Options
				techCard.ModifierSets[i].Options = nil
				
				// Создаем набор модификаторов
				if err := tx.Create(&techCard.ModifierSets[i]).Error; err != nil {
					return err
				}
				
				// Теперь создаем опции с правильным ModifierSetID
				if len(options) > 0 {
					for j := range options {
						options[j].ModifierSetID = techCard.ModifierSets[i].ID
					}
					if err := tx.Create(&options).Error; err != nil {
						return err
					}
				}
			}
		}

		return nil
	})
}

func (r *techCardRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.TechCard{}, "id = ?", id).Error
}