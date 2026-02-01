package repositories

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/yourusername/arc/backend/internal/models"
	"gorm.io/gorm"
)

var (
	ErrShiftSessionNotFound = errors.New("shift session not found")
)

type ShiftSessionRepository interface {
	Create(ctx context.Context, session *models.ShiftSession) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.ShiftSession, error)
	GetActiveSessionByUserID(ctx context.Context, userID uuid.UUID) (*models.ShiftSession, error)
	GetActiveSessionByUserIDAndShiftID(ctx context.Context, userID uuid.UUID, shiftID uuid.UUID) (*models.ShiftSession, error)
	GetByShiftID(ctx context.Context, shiftID uuid.UUID) ([]models.ShiftSession, error)
	Update(ctx context.Context, session *models.ShiftSession) error
	EndSession(ctx context.Context, id uuid.UUID) error
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]models.ShiftSession, error)
}

type shiftSessionRepository struct {
	db *gorm.DB
}

func NewShiftSessionRepository(db *gorm.DB) ShiftSessionRepository {
	return &shiftSessionRepository{db: db}
}

func (r *shiftSessionRepository) Create(ctx context.Context, session *models.ShiftSession) error {
	return r.db.WithContext(ctx).Create(session).Error
}

func (r *shiftSessionRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.ShiftSession, error) {
	var session models.ShiftSession
	err := r.db.WithContext(ctx).
		Preload("Shift").
		Preload("User").
		First(&session, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrShiftSessionNotFound
		}
		return nil, err
	}
	return &session, nil
}

// GetActiveSessionByUserID находит активную сессию пользователя (без привязки к конкретной смене)
func (r *shiftSessionRepository) GetActiveSessionByUserID(ctx context.Context, userID uuid.UUID) (*models.ShiftSession, error) {
	var session models.ShiftSession
	err := r.db.WithContext(ctx).
		Preload("Shift").
		Preload("User").
		Where("user_id = ? AND end_time IS NULL", userID).
		First(&session).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrShiftSessionNotFound
		}
		return nil, err
	}
	return &session, nil
}

// GetActiveSessionByUserIDAndShiftID находит активную сессию пользователя в рамках конкретной смены
func (r *shiftSessionRepository) GetActiveSessionByUserIDAndShiftID(ctx context.Context, userID uuid.UUID, shiftID uuid.UUID) (*models.ShiftSession, error) {
	var session models.ShiftSession
	err := r.db.WithContext(ctx).
		Preload("Shift").
		Preload("User").
		Where("user_id = ? AND shift_id = ? AND end_time IS NULL", userID, shiftID).
		First(&session).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrShiftSessionNotFound
		}
		return nil, err
	}
	return &session, nil
}

func (r *shiftSessionRepository) GetByShiftID(ctx context.Context, shiftID uuid.UUID) ([]models.ShiftSession, error) {
	var sessions []models.ShiftSession
	err := r.db.WithContext(ctx).
		Preload("User").
		Where("shift_id = ?", shiftID).
		Order("start_time ASC").
		Find(&sessions).Error
	if err != nil {
		return nil, err
	}
	return sessions, nil
}

func (r *shiftSessionRepository) Update(ctx context.Context, session *models.ShiftSession) error {
	return r.db.WithContext(ctx).Save(session).Error
}

// EndSession завершает сессию (устанавливает end_time)
func (r *shiftSessionRepository) EndSession(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&models.ShiftSession{}).
		Where("id = ?", id).
		Update("end_time", gorm.Expr("NOW()")).Error
}

func (r *shiftSessionRepository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]models.ShiftSession, error) {
	var sessions []models.ShiftSession
	err := r.db.WithContext(ctx).
		Preload("Shift").
		Where("user_id = ?", userID).
		Order("start_time DESC").
		Find(&sessions).Error
	if err != nil {
		return nil, err
	}
	return sessions, nil
}
