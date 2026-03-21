package repositories

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type GuestSessionRepository interface {
	Create(ctx context.Context, session *models.GuestSession) error
	GetByToken(ctx context.Context, token uuid.UUID) (*models.GuestSession, error)
	GetByPhone(ctx context.Context, phone string, establishmentID uuid.UUID) (*models.GuestSession, error)
	ListByTable(ctx context.Context, tableID uuid.UUID) ([]*models.GuestSession, error)
}

type guestSessionRepository struct {
	db *gorm.DB
}

func NewGuestSessionRepository(db *gorm.DB) GuestSessionRepository {
	return &guestSessionRepository{db: db}
}

func (r *guestSessionRepository) Create(ctx context.Context, session *models.GuestSession) error {
	return r.db.WithContext(ctx).Create(session).Error
}

func (r *guestSessionRepository) GetByToken(ctx context.Context, token uuid.UUID) (*models.GuestSession, error) {
	var session models.GuestSession
	err := r.db.WithContext(ctx).
		Preload("Table").
		Where("token = ?", token).
		First(&session).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &session, nil
}

func (r *guestSessionRepository) GetByPhone(ctx context.Context, phone string, establishmentID uuid.UUID) (*models.GuestSession, error) {
	var session models.GuestSession
	err := r.db.WithContext(ctx).
		Where("phone = ? AND establishment_id = ? AND is_anonymous = false", phone, establishmentID).
		Order("created_at DESC").
		First(&session).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &session, nil
}

func (r *guestSessionRepository) ListByTable(ctx context.Context, tableID uuid.UUID) ([]*models.GuestSession, error) {
	var sessions []*models.GuestSession
	err := r.db.WithContext(ctx).
		Where("table_id = ?", tableID).
		Order("created_at DESC").
		Find(&sessions).Error
	return sessions, err
}
