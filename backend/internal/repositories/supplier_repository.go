package repositories

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type SupplierFilter struct {
	EstablishmentID *uuid.UUID
	Search          *string
	Active          *bool
}

type SupplierRepository interface {
	GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Supplier, error)
	List(ctx context.Context, filter *SupplierFilter) ([]*models.Supplier, error)
	Create(ctx context.Context, s *models.Supplier) error
	Update(ctx context.Context, s *models.Supplier) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type supplierRepository struct {
	db *gorm.DB
}

func NewSupplierRepository(db *gorm.DB) SupplierRepository {
	return &supplierRepository{db: db}
}

func (r *supplierRepository) GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Supplier, error) {
	var s models.Supplier
	q := r.db.WithContext(ctx)
	if establishmentID != nil {
		q = q.Where("establishment_id = ?", *establishmentID)
	}
	err := q.First(&s, "id = ?", id).Error
	return &s, err
}

func (r *supplierRepository) List(ctx context.Context, filter *SupplierFilter) ([]*models.Supplier, error) {
	var list []*models.Supplier
	query := r.db.WithContext(ctx)
	if filter != nil {
		if filter.EstablishmentID != nil {
			query = query.Where("establishment_id = ?", *filter.EstablishmentID)
		}
		if filter.Search != nil && *filter.Search != "" {
			search := "%" + strings.ToLower(*filter.Search) + "%"
			query = query.Where("LOWER(name) LIKE ? OR LOWER(contact) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(email) LIKE ?", search, search, search, search)
		}
		if filter.Active != nil {
			query = query.Where("active = ?", *filter.Active)
		}
	}
	err := query.Find(&list).Error
	return list, err
}

func (r *supplierRepository) Create(ctx context.Context, s *models.Supplier) error {
	return r.db.WithContext(ctx).Create(s).Error
}

func (r *supplierRepository) Update(ctx context.Context, s *models.Supplier) error {
	return r.db.WithContext(ctx).Save(s).Error
}

func (r *supplierRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Supplier{}, "id = ?", id).Error
}
