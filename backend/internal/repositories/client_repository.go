package repositories

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

// ClientRepository интерфейс для работы с клиентами
type ClientRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*models.Client, error)
	GetAllByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Client, error)
	Create(ctx context.Context, client *models.Client) error
	Update(ctx context.Context, client *models.Client) error
	Delete(ctx context.Context, id uuid.UUID) error
	AddLoyaltyPoints(ctx context.Context, clientID uuid.UUID, points int) error
	RedeemLoyaltyPoints(ctx context.Context, clientID uuid.UUID, points int) error
	GetClientLoyaltyPoints(ctx context.Context, clientID uuid.UUID) (int, error)
}

type clientRepository struct {
	db *gorm.DB
}

func NewClientRepository(db *gorm.DB) ClientRepository {
	return &clientRepository{db: db}
}

func (r *clientRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Client, error) {
	var client models.Client
	err := r.db.WithContext(ctx).
		Preload("LoyaltyProgram").
		Preload("Group").
		First(&client, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrClientNotFound
		}
		return nil, err
	}
	return &client, nil
}

func (r *clientRepository) GetAllByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Client, error) {
	var clients []*models.Client
	err := r.db.WithContext(ctx).
		Preload("LoyaltyProgram").
		Preload("Group").
		Where("establishment_id = ?", establishmentID).
		Find(&clients).Error
	if err != nil {
		return nil, err
	}
	return clients, nil
}

func (r *clientRepository) Create(ctx context.Context, client *models.Client) error {
	return r.db.WithContext(ctx).Create(client).Error
}

func (r *clientRepository) Update(ctx context.Context, client *models.Client) error {
	return r.db.WithContext(ctx).Save(client).Error
}

func (r *clientRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Client{}, "id = ?", id).Error
}

func (r *clientRepository) AddLoyaltyPoints(ctx context.Context, clientID uuid.UUID, points int) error {
	return r.db.WithContext(ctx).
		Model(&models.Client{}).
		Where("id = ?", clientID).
		Update("loyalty_points", gorm.Expr("loyalty_points + ?", points)).Error
}

func (r *clientRepository) RedeemLoyaltyPoints(ctx context.Context, clientID uuid.UUID, points int) error {
	return r.db.WithContext(ctx).
		Model(&models.Client{}).
		Where("id = ? AND loyalty_points >= ?", clientID, points).
		Update("loyalty_points", gorm.Expr("loyalty_points - ?", points)).Error
}

func (r *clientRepository) GetClientLoyaltyPoints(ctx context.Context, clientID uuid.UUID) (int, error) {
	var client models.Client
	err := r.db.WithContext(ctx).
		Select("loyalty_points").
		First(&client, "id = ?", clientID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, ErrClientNotFound
		}
		return 0, err
	}
	return client.LoyaltyPoints, nil
}
