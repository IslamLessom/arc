package usecases

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

type SubscriptionUseCase interface {
	// Методы для пользователей
	GetMySubscription(ctx context.Context, userID uuid.UUID) (*models.Subscription, error)
	CheckSubscriptionStatus(ctx context.Context, userID uuid.UUID) (bool, error)

	// Методы для супер-админа
	ListAllSubscriptions(ctx context.Context, limit, offset int) ([]*models.Subscription, int64, error)
	GetSubscriptionByID(ctx context.Context, id uuid.UUID) (*models.Subscription, error)
	ExtendSubscription(ctx context.Context, subscriptionID uuid.UUID, days int) error
	ChangeSubscriptionPlan(ctx context.Context, subscriptionID uuid.UUID, newPlanID uuid.UUID) error
	DeactivateSubscription(ctx context.Context, subscriptionID uuid.UUID) error
	ActivateSubscription(ctx context.Context, subscriptionID uuid.UUID) error

	// Управление тарифными планами
	ListAllPlans(ctx context.Context) ([]*models.SubscriptionPlan, error)
	GetPlanByID(ctx context.Context, id uuid.UUID) (*models.SubscriptionPlan, error)
	CreatePlan(ctx context.Context, name string, duration int, price float64, features string) (*models.SubscriptionPlan, error)
	UpdatePlan(ctx context.Context, id uuid.UUID, name string, duration int, price float64, features string, active bool) error
	DeletePlan(ctx context.Context, id uuid.UUID) error

	// Автоматическое создание подписки при регистрации
	CreateTrialSubscription(ctx context.Context, userID uuid.UUID) (*models.Subscription, error)
}

type subscriptionUseCase struct {
	subscriptionRepo repositories.SubscriptionRepository
	userRepo         repositories.UserRepository
	logger           *zap.Logger
}

func NewSubscriptionUseCase(
	subscriptionRepo repositories.SubscriptionRepository,
	userRepo repositories.UserRepository,
	logger *zap.Logger,
) SubscriptionUseCase {
	return &subscriptionUseCase{
		subscriptionRepo: subscriptionRepo,
		userRepo:         userRepo,
		logger:           logger,
	}
}

// GetMySubscription возвращает подписку текущего пользователя
func (uc *subscriptionUseCase) GetMySubscription(ctx context.Context, userID uuid.UUID) (*models.Subscription, error) {
	subscription, err := uc.subscriptionRepo.GetSubscriptionByUserID(ctx, userID)
	if err != nil {
		uc.logger.Error("Failed to get subscription", zap.Error(err), zap.String("user_id", userID.String()))
		return nil, err
	}
	return subscription, nil
}

// CheckSubscriptionStatus проверяет, активна ли подписка пользователя
func (uc *subscriptionUseCase) CheckSubscriptionStatus(ctx context.Context, userID uuid.UUID) (bool, error) {
	subscription, err := uc.subscriptionRepo.GetSubscriptionByUserID(ctx, userID)
	if err != nil {
		uc.logger.Error("Failed to check subscription status", zap.Error(err), zap.String("user_id", userID.String()))
		return false, err
	}

	if subscription == nil {
		return false, nil
	}

	return subscription.IsValid(), nil
}

// ListAllSubscriptions возвращает список всех подписок (для супер-админа)
func (uc *subscriptionUseCase) ListAllSubscriptions(ctx context.Context, limit, offset int) ([]*models.Subscription, int64, error) {
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	subscriptions, total, err := uc.subscriptionRepo.ListAllSubscriptions(ctx, limit, offset)
	if err != nil {
		uc.logger.Error("Failed to list subscriptions", zap.Error(err))
		return nil, 0, err
	}

	return subscriptions, total, nil
}

// GetSubscriptionByID возвращает подписку по ID
func (uc *subscriptionUseCase) GetSubscriptionByID(ctx context.Context, id uuid.UUID) (*models.Subscription, error) {
	subscription, err := uc.subscriptionRepo.GetSubscriptionByID(ctx, id)
	if err != nil {
		uc.logger.Error("Failed to get subscription by ID", zap.Error(err), zap.String("subscription_id", id.String()))
		return nil, err
	}
	if subscription == nil {
		return nil, errors.New("subscription not found")
	}
	return subscription, nil
}

// ExtendSubscription продлевает подписку на указанное количество дней
func (uc *subscriptionUseCase) ExtendSubscription(ctx context.Context, subscriptionID uuid.UUID, days int) error {
	if days <= 0 {
		return errors.New("days must be positive")
	}

	subscription, err := uc.subscriptionRepo.GetSubscriptionByID(ctx, subscriptionID)
	if err != nil {
		uc.logger.Error("Failed to get subscription", zap.Error(err), zap.String("subscription_id", subscriptionID.String()))
		return err
	}
	if subscription == nil {
		return errors.New("subscription not found")
	}

	// Продлеваем от текущей даты окончания или от текущего времени, если подписка истекла
	if subscription.EndDate.Before(time.Now()) {
		subscription.EndDate = time.Now().AddDate(0, 0, days)
	} else {
		subscription.EndDate = subscription.EndDate.AddDate(0, 0, days)
	}

	subscription.IsActive = true

	if err := uc.subscriptionRepo.UpdateSubscription(ctx, subscription); err != nil {
		uc.logger.Error("Failed to extend subscription", zap.Error(err), zap.String("subscription_id", subscriptionID.String()))
		return err
	}

	uc.logger.Info("Subscription extended",
		zap.String("subscription_id", subscriptionID.String()),
		zap.Int("days", days),
		zap.Time("new_end_date", subscription.EndDate))

	return nil
}

// ChangeSubscriptionPlan изменяет тарифный план подписки
func (uc *subscriptionUseCase) ChangeSubscriptionPlan(ctx context.Context, subscriptionID uuid.UUID, newPlanID uuid.UUID) error {
	subscription, err := uc.subscriptionRepo.GetSubscriptionByID(ctx, subscriptionID)
	if err != nil {
		uc.logger.Error("Failed to get subscription", zap.Error(err), zap.String("subscription_id", subscriptionID.String()))
		return err
	}
	if subscription == nil {
		return errors.New("subscription not found")
	}

	newPlan, err := uc.subscriptionRepo.GetPlanByID(ctx, newPlanID)
	if err != nil {
		uc.logger.Error("Failed to get plan", zap.Error(err), zap.String("plan_id", newPlanID.String()))
		return err
	}
	if newPlan == nil {
		return errors.New("plan not found")
	}

	subscription.PlanID = newPlanID

	if err := uc.subscriptionRepo.UpdateSubscription(ctx, subscription); err != nil {
		uc.logger.Error("Failed to change subscription plan", zap.Error(err), zap.String("subscription_id", subscriptionID.String()))
		return err
	}

	uc.logger.Info("Subscription plan changed",
		zap.String("subscription_id", subscriptionID.String()),
		zap.String("new_plan_id", newPlanID.String()))

	return nil
}

// DeactivateSubscription деактивирует подписку
func (uc *subscriptionUseCase) DeactivateSubscription(ctx context.Context, subscriptionID uuid.UUID) error {
	subscription, err := uc.subscriptionRepo.GetSubscriptionByID(ctx, subscriptionID)
	if err != nil {
		uc.logger.Error("Failed to get subscription", zap.Error(err), zap.String("subscription_id", subscriptionID.String()))
		return err
	}
	if subscription == nil {
		return errors.New("subscription not found")
	}

	subscription.IsActive = false

	if err := uc.subscriptionRepo.UpdateSubscription(ctx, subscription); err != nil {
		uc.logger.Error("Failed to deactivate subscription", zap.Error(err), zap.String("subscription_id", subscriptionID.String()))
		return err
	}

	uc.logger.Info("Subscription deactivated", zap.String("subscription_id", subscriptionID.String()))

	return nil
}

// ActivateSubscription активирует подписку
func (uc *subscriptionUseCase) ActivateSubscription(ctx context.Context, subscriptionID uuid.UUID) error {
	subscription, err := uc.subscriptionRepo.GetSubscriptionByID(ctx, subscriptionID)
	if err != nil {
		uc.logger.Error("Failed to get subscription", zap.Error(err), zap.String("subscription_id", subscriptionID.String()))
		return err
	}
	if subscription == nil {
		return errors.New("subscription not found")
	}

	subscription.IsActive = true

	if err := uc.subscriptionRepo.UpdateSubscription(ctx, subscription); err != nil {
		uc.logger.Error("Failed to activate subscription", zap.Error(err), zap.String("subscription_id", subscriptionID.String()))
		return err
	}

	uc.logger.Info("Subscription activated", zap.String("subscription_id", subscriptionID.String()))

	return nil
}

// ListAllPlans возвращает список всех тарифных планов
func (uc *subscriptionUseCase) ListAllPlans(ctx context.Context) ([]*models.SubscriptionPlan, error) {
	plans, err := uc.subscriptionRepo.ListAllPlans(ctx)
	if err != nil {
		uc.logger.Error("Failed to list plans", zap.Error(err))
		return nil, err
	}
	return plans, nil
}

// GetPlanByID возвращает тарифный план по ID
func (uc *subscriptionUseCase) GetPlanByID(ctx context.Context, id uuid.UUID) (*models.SubscriptionPlan, error) {
	plan, err := uc.subscriptionRepo.GetPlanByID(ctx, id)
	if err != nil {
		uc.logger.Error("Failed to get plan", zap.Error(err), zap.String("plan_id", id.String()))
		return nil, err
	}
	if plan == nil {
		return nil, errors.New("plan not found")
	}
	return plan, nil
}

// CreatePlan создает новый тарифный план
func (uc *subscriptionUseCase) CreatePlan(ctx context.Context, name string, duration int, price float64, features string) (*models.SubscriptionPlan, error) {
	if name == "" {
		return nil, errors.New("plan name is required")
	}
	if duration <= 0 {
		return nil, errors.New("duration must be positive")
	}
	if price < 0 {
		return nil, errors.New("price cannot be negative")
	}

	plan := &models.SubscriptionPlan{
		Name:     name,
		Duration: duration,
		Price:    price,
		Features: features,
		Active:   true,
	}

	if err := uc.subscriptionRepo.CreatePlan(ctx, plan); err != nil {
		uc.logger.Error("Failed to create plan", zap.Error(err), zap.String("name", name))
		return nil, err
	}

	uc.logger.Info("Plan created", zap.String("plan_id", plan.ID.String()), zap.String("name", name))

	return plan, nil
}

// UpdatePlan обновляет тарифный план
func (uc *subscriptionUseCase) UpdatePlan(ctx context.Context, id uuid.UUID, name string, duration int, price float64, features string, active bool) error {
	if name == "" {
		return errors.New("plan name is required")
	}
	if duration <= 0 {
		return errors.New("duration must be positive")
	}
	if price < 0 {
		return errors.New("price cannot be negative")
	}

	plan, err := uc.subscriptionRepo.GetPlanByID(ctx, id)
	if err != nil {
		uc.logger.Error("Failed to get plan", zap.Error(err), zap.String("plan_id", id.String()))
		return err
	}
	if plan == nil {
		return errors.New("plan not found")
	}

	plan.Name = name
	plan.Duration = duration
	plan.Price = price
	plan.Features = features
	plan.Active = active

	if err := uc.subscriptionRepo.UpdatePlan(ctx, plan); err != nil {
		uc.logger.Error("Failed to update plan", zap.Error(err), zap.String("plan_id", id.String()))
		return err
	}

	uc.logger.Info("Plan updated", zap.String("plan_id", id.String()), zap.String("name", name))

	return nil
}

// DeletePlan удаляет тарифный план
func (uc *subscriptionUseCase) DeletePlan(ctx context.Context, id uuid.UUID) error {
	if err := uc.subscriptionRepo.DeletePlan(ctx, id); err != nil {
		uc.logger.Error("Failed to delete plan", zap.Error(err), zap.String("plan_id", id.String()))
		return err
	}

	uc.logger.Info("Plan deleted", zap.String("plan_id", id.String()))

	return nil
}

// CreateTrialSubscription создает пробную подписку на 14 дней при регистрации
func (uc *subscriptionUseCase) CreateTrialSubscription(ctx context.Context, userID uuid.UUID) (*models.Subscription, error) {
	// Получаем тарифный план "Trial"
	trialPlan, err := uc.subscriptionRepo.GetPlanByName(ctx, "Trial")
	if err != nil {
		uc.logger.Error("Failed to get Trial plan", zap.Error(err))
		return nil, err
	}

	// Создаем подписку
	now := time.Now()
	subscription := &models.Subscription{
		UserID:    userID,
		PlanID:    trialPlan.ID,
		StartDate: now,
		EndDate:   now.AddDate(0, 0, trialPlan.Duration),
		IsActive:  true,
		AutoRenew: false,
	}

	if err := uc.subscriptionRepo.CreateSubscription(ctx, subscription); err != nil {
		uc.logger.Error("Failed to create trial subscription", zap.Error(err), zap.String("user_id", userID.String()))
		return nil, err
	}

	uc.logger.Info("Trial subscription created",
		zap.String("user_id", userID.String()),
		zap.String("subscription_id", subscription.ID.String()),
		zap.Time("end_date", subscription.EndDate))

	return subscription, nil
}
