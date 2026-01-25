package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type OrderRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*models.Order, error)
    List(ctx context.Context, establishmentID uuid.UUID, startDate, endDate time.Time, status string) ([]*models.Order, error)
	ListActiveByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Order, error)
	Create(ctx context.Context, order *models.Order) error
	Update(ctx context.Context, order *models.Order) error
	CreateOrderItem(ctx context.Context, item *models.OrderItem) error
	UpdateOrderItem(ctx context.Context, item *models.OrderItem) error
	ListByShiftIDAndEstablishmentIDAndDateRange(ctx context.Context, shiftID, establishmentID uuid.UUID, startDate, endDate time.Time) ([]*models.Order, error)
}

type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) OrderRepository {
	return &orderRepository{db: db}
}

func (r *orderRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Order, error) {
	var order models.Order
	err := r.db.WithContext(ctx).Preload("Items.Product").Preload("Items.TechCard").Preload("Table").First(&order, "id = ?", id).Error
	return &order, err
}

func (r *orderRepository) List(ctx context.Context, establishmentID uuid.UUID, startDate, endDate time.Time, status string) ([]*models.Order, error) {
	var orders []*models.Order
	query := r.db.WithContext(ctx).Preload("Items.Product").Preload("Items.TechCard").Preload("Table").Where("establishment_id = ?", establishmentID)

	if !startDate.IsZero() {
		query = query.Where("created_at >= ?", startDate)
	}
	if !endDate.IsZero() {
		query = query.Where("created_at <= ?", endDate)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	err := query.Find(&orders).Error
	return orders, err
}

func (r *orderRepository) ListActiveByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Order, error) {
	var orders []*models.Order
	err := r.db.WithContext(ctx).Preload("Items.Product").Preload("Items.TechCard").Preload("Table").Where("establishment_id = ? AND status IN (?, ?, ?)", establishmentID, "draft", "confirmed", "preparing").Find(&orders).Error
	return orders, err
}

func (r *orderRepository) Create(ctx context.Context, order *models.Order) error {
	return r.db.WithContext(ctx).Create(order).Error
}

func (r *orderRepository) Update(ctx context.Context, order *models.Order) error {
	return r.db.WithContext(ctx).Save(order).Error
}

func (r *orderRepository) CreateOrderItem(ctx context.Context, item *models.OrderItem) error {
	return r.db.WithContext(ctx).Create(item).Error
}

func (r *orderRepository) UpdateOrderItem(ctx context.Context, item *models.OrderItem) error {
	return r.db.WithContext(ctx).Save(item).Error
}

func (r *orderRepository) ListByShiftIDAndEstablishmentIDAndDateRange(ctx context.Context, shiftID, establishmentID uuid.UUID, startDate, endDate time.Time) ([]*models.Order, error) {
	var orders []*models.Order
	query := r.db.WithContext(ctx).Preload("Items.Product").Preload("Items.TechCard").Preload("Table").Where("shift_id = ? AND establishment_id = ?", shiftID, establishmentID)

	if !startDate.IsZero() {
		query = query.Where("created_at >= ?", startDate)
	}
	if !endDate.IsZero() {
		query = query.Where("created_at <= ?", endDate)
	}

	err := query.Find(&orders).Error
	return orders, err
}
