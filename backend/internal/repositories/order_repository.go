package repositories

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type OrderRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*models.Order, error)
	List(ctx context.Context) ([]*models.Order, error)
	Create(ctx context.Context, order *models.Order) error
	Update(ctx context.Context, order *models.Order) error
}

type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) OrderRepository {
	return &orderRepository{db: db}
}

func (r *orderRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Order, error) {
	var order models.Order
	err := r.db.WithContext(ctx).Preload("Items.Product").Preload("Items.TechCard").First(&order, "id = ?", id).Error
	return &order, err
}

func (r *orderRepository) List(ctx context.Context) ([]*models.Order, error) {
	var orders []*models.Order
	err := r.db.WithContext(ctx).Preload("Items.Product").Preload("Items.TechCard").Find(&orders).Error
	return orders, err
}

func (r *orderRepository) Create(ctx context.Context, order *models.Order) error {
	return r.db.WithContext(ctx).Create(order).Error
}

func (r *orderRepository) Update(ctx context.Context, order *models.Order) error {
	return r.db.WithContext(ctx).Save(order).Error
}