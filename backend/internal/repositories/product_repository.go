package repositories

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type ProductFilter struct {
	EstablishmentID *uuid.UUID // обязательно для изоляции заведений
	CategoryID     *uuid.UUID
	WorkshopID     *uuid.UUID
	Search         *string
	Active         *bool
}

type ProductRepository interface {
	GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Product, error)
	List(ctx context.Context, filter *ProductFilter) ([]*models.Product, error)
	Create(ctx context.Context, product *models.Product) error
	Update(ctx context.Context, product *models.Product) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Product, error) {
	var product models.Product
	q := r.db.WithContext(ctx).Preload("Warehouse")
	if establishmentID != nil {
		q = q.Where("establishment_id = ?", *establishmentID)
	}
	err := q.First(&product, "id = ?", id).Error
	return &product, err
}

func (r *productRepository) List(ctx context.Context, filter *ProductFilter) ([]*models.Product, error) {
	var products []*models.Product
	query := r.db.WithContext(ctx).Preload("Category").Preload("Workshop")

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

	err := query.Find(&products).Error
	return products, err
}

func (r *productRepository) Create(ctx context.Context, product *models.Product) error {
	return r.db.WithContext(ctx).Create(product).Error
}

func (r *productRepository) Update(ctx context.Context, product *models.Product) error {
	return r.db.WithContext(ctx).Save(product).Error
}

func (r *productRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Product{}, "id = ?", id).Error
}