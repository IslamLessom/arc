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
	ListWithStats(ctx context.Context, filter *IngredientCategoryFilter) ([]*models.IngredientCategoryWithStats, error)
	GetWithStats(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.IngredientCategoryWithStats, error)
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

// ListWithStats возвращает список категорий со статистикой ингредиентов и остатков
func (r *ingredientCategoryRepository) ListWithStats(ctx context.Context, filter *IngredientCategoryFilter) ([]*models.IngredientCategoryWithStats, error) {
	var categories []*models.IngredientCategory
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

	if err := query.Find(&categories).Error; err != nil {
		return nil, err
	}

	result := make([]*models.IngredientCategoryWithStats, len(categories))
	for i, cat := range categories {
		stats, err := r.getCategoryStats(ctx, cat.ID)
		if err != nil {
			return nil, err
		}
		result[i] = &models.IngredientCategoryWithStats{
			ID:              cat.ID,
			EstablishmentID: cat.EstablishmentID,
			Name:            cat.Name,
			CreatedAt:       cat.CreatedAt,
			UpdatedAt:       cat.UpdatedAt,
			IngredientsCount: stats.IngredientsCount,
			TotalStock:       stats.TotalStock,
		}
	}

	return result, nil
}

// GetWithStats возвращает категорию со статистикой по ID
func (r *ingredientCategoryRepository) GetWithStats(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.IngredientCategoryWithStats, error) {
	var cat models.IngredientCategory
	q := r.db.WithContext(ctx)
	if establishmentID != nil {
		q = q.Where("establishment_id = ?", *establishmentID)
	}

	if err := q.First(&cat, "id = ?", id).Error; err != nil {
		return nil, err
	}

	stats, err := r.getCategoryStats(ctx, cat.ID)
	if err != nil {
		return nil, err
	}

	return &models.IngredientCategoryWithStats{
		ID:              cat.ID,
		EstablishmentID: cat.EstablishmentID,
		Name:            cat.Name,
		CreatedAt:       cat.CreatedAt,
		UpdatedAt:       cat.UpdatedAt,
		IngredientsCount: stats.IngredientsCount,
		TotalStock:       stats.TotalStock,
	}, nil
}

// categoryStats хранит статистику по категории
type categoryStats struct {
	IngredientsCount int
	TotalStock       []models.WarehouseStockInfo
}

// getCategoryStats получает статистику для категории ингредиентов
func (r *ingredientCategoryRepository) getCategoryStats(ctx context.Context, categoryID uuid.UUID) (*categoryStats, error) {
	// Подсчитываем количество ингредиентов в категории
	var count int64
	if err := r.db.WithContext(ctx).Model(&models.Ingredient{}).Where("category_id = ?", categoryID).Count(&count).Error; err != nil {
		return nil, err
	}

	// Получаем информацию об остатках на складах, группируя по складам
	type stockResult struct {
		WarehouseID   uuid.UUID
		WarehouseName string
		TotalQuantity float64
		Unit          string
	}

	var stockResults []stockResult
	err := r.db.WithContext(ctx).Table("stocks").
		Select("stocks.warehouse_id, warehouses.name as warehouse_name, SUM(stocks.quantity) as total_quantity, stocks.unit").
		Joins("LEFT JOIN warehouses ON stocks.warehouse_id = warehouses.id").
		Joins("LEFT JOIN ingredients ON stocks.ingredient_id = ingredients.id").
		Where("ingredients.category_id = ?", categoryID).
		Group("stocks.warehouse_id, warehouses.name, stocks.unit").
		Scan(&stockResults).Error

	if err != nil {
		return nil, err
	}

	// Конвертируем результат в WarehouseStockInfo
	stockInfo := make([]models.WarehouseStockInfo, len(stockResults))
	for i, sr := range stockResults {
		stockInfo[i] = models.WarehouseStockInfo{
			WarehouseID:   sr.WarehouseID,
			WarehouseName: sr.WarehouseName,
			TotalQuantity: sr.TotalQuantity,
			Unit:          sr.Unit,
		}
	}

	return &categoryStats{
		IngredientsCount: int(count),
		TotalStock:       stockInfo,
	}, nil
}
