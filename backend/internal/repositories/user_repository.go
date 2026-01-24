package repositories

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/pkg/auth"
)

type UserRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	GetByPIN(ctx context.Context, pin string, establishmentID uuid.UUID) (*models.User, error) // Изменена сигнатура
	Create(ctx context.Context, user *models.User) error
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, id uuid.UUID) error
	GetAllByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.User, error)
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) Create(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *userRepository) Update(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

func (r *userRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.User{}, "id = ?", id).Error
}

func (r *userRepository) GetAllByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.User, error) {
	var users []*models.User
	err := r.db.WithContext(ctx).Preload("Role").Where("establishment_id = ?", establishmentID).Find(&users).Error
	if err != nil {
		return nil, err
	}
	return users, nil
}

func (r *userRepository) GetByPIN(ctx context.Context, pin string, establishmentID uuid.UUID) (*models.User, error) {
	// Получаем всех пользователей заведения с PIN
	var users []models.User
	err := r.db.WithContext(ctx).
		Where("establishment_id = ? AND pin IS NOT NULL", establishmentID).
		Find(&users).Error
	if err != nil {
		return nil, err
	}

	// Проверяем PIN для каждого пользователя (PIN хранится как хеш)
	for i := range users {
		if users[i].PIN != nil && auth.CheckPassword(pin, *users[i].PIN) {
			return &users[i], nil
		}
	}

	return nil, ErrUserNotFound
}
