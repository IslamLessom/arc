package repositories

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type SubscriptionRepository interface {
	GetPlanByName(ctx context.Context, name string) (*models.SubscriptionPlan, error)
	GetPlanByID(ctx context.Context, id uuid.UUID) (*models.SubscriptionPlan, error)
	GetSubscriptionByUserID(ctx context.Context, userID uuid.UUID) (*models.Subscription, error)
	CreateSubscription(ctx context.Context, subscription *models.Subscription) error
	UpdateSubscription(ctx context.Context, subscription *models.Subscription) error

	// Методы для супер-админа
	ListAllSubscriptions(ctx context.Context, limit, offset int) ([]*models.Subscription, int64, error)
	ListAllPlans(ctx context.Context) ([]*models.SubscriptionPlan, error)
	CreatePlan(ctx context.Context, plan *models.SubscriptionPlan) error
	UpdatePlan(ctx context.Context, plan *models.SubscriptionPlan) error
	DeletePlan(ctx context.Context, id uuid.UUID) error
	GetSubscriptionByID(ctx context.Context, id uuid.UUID) (*models.Subscription, error)
}

type subscriptionRepository struct {
	db *gorm.DB
}

func NewSubscriptionRepository(db *gorm.DB) SubscriptionRepository {
	return &subscriptionRepository{db: db}
}

func (r *subscriptionRepository) GetPlanByName(ctx context.Context, name string) (*models.SubscriptionPlan, error) {
	var plan models.SubscriptionPlan
	err := r.db.WithContext(ctx).Where("name = ? AND active = ?", name, true).First(&plan).Error
	return &plan, err
}

func (r *subscriptionRepository) GetPlanByID(ctx context.Context, id uuid.UUID) (*models.SubscriptionPlan, error) {
	var plan models.SubscriptionPlan
	err := r.db.WithContext(ctx).First(&plan, "id = ?", id).Error
	return &plan, err
}

func (r *subscriptionRepository) GetSubscriptionByUserID(ctx context.Context, userID uuid.UUID) (*models.Subscription, error) {
	var subscription models.Subscription
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Preload("Plan").
		First(&subscription).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &subscription, err
}

func (r *subscriptionRepository) CreateSubscription(ctx context.Context, subscription *models.Subscription) error {
	return r.db.WithContext(ctx).Create(subscription).Error
}

func (r *subscriptionRepository) UpdateSubscription(ctx context.Context, subscription *models.Subscription) error {
	return r.db.WithContext(ctx).Save(subscription).Error
}

// ListAllSubscriptions возвращает список всех подписок с пагинацией
func (r *subscriptionRepository) ListAllSubscriptions(ctx context.Context, limit, offset int) ([]*models.Subscription, int64, error) {
	var subscriptions []*models.Subscription
	var total int64

	// Подсчет общего количества
	if err := r.db.WithContext(ctx).Model(&models.Subscription{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Получение подписок с пагинацией и загрузкой связанных данных
	err := r.db.WithContext(ctx).
		Preload("Plan").
		Preload("User").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&subscriptions).Error

	return subscriptions, total, err
}

// ListAllPlans возвращает список всех тарифных планов
func (r *subscriptionRepository) ListAllPlans(ctx context.Context) ([]*models.SubscriptionPlan, error) {
	var plans []*models.SubscriptionPlan
	err := r.db.WithContext(ctx).
		Order("price ASC").
		Find(&plans).Error
	return plans, err
}

// CreatePlan создает новый тарифный план
func (r *subscriptionRepository) CreatePlan(ctx context.Context, plan *models.SubscriptionPlan) error {
	return r.db.WithContext(ctx).Create(plan).Error
}

// UpdatePlan обновляет тарифный план
func (r *subscriptionRepository) UpdatePlan(ctx context.Context, plan *models.SubscriptionPlan) error {
	return r.db.WithContext(ctx).Save(plan).Error
}

// DeletePlan удаляет тарифный план (soft delete)
func (r *subscriptionRepository) DeletePlan(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.SubscriptionPlan{}, "id = ?", id).Error
}

// GetSubscriptionByID возвращает подписку по ID
func (r *subscriptionRepository) GetSubscriptionByID(ctx context.Context, id uuid.UUID) (*models.Subscription, error) {
	var subscription models.Subscription
	err := r.db.WithContext(ctx).
		Preload("Plan").
		Preload("User").
		First(&subscription, "id = ?", id).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &subscription, err
}
