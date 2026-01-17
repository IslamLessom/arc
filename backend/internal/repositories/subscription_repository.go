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
