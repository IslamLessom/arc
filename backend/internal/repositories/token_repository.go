package repositories

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type TokenRepository interface {
	AddToBlacklist(ctx context.Context, tokenString string, userID uuid.UUID, expiresAt time.Time) error
	IsBlacklisted(ctx context.Context, tokenString string) (bool, error)
	CleanupExpired(ctx context.Context) error // Очистка истекших токенов
}

type tokenRepository struct {
	db *gorm.DB
}

func NewTokenRepository(db *gorm.DB) TokenRepository {
	return &tokenRepository{db: db}
}

// hashToken создает хеш токена для безопасного хранения
func hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

func (r *tokenRepository) AddToBlacklist(ctx context.Context, tokenString string, userID uuid.UUID, expiresAt time.Time) error {
	blacklistEntry := &models.TokenBlacklist{
		TokenHash: hashToken(tokenString),
		UserID:    userID,
		ExpiresAt: expiresAt,
	}
	return r.db.WithContext(ctx).Create(blacklistEntry).Error
}

func (r *tokenRepository) IsBlacklisted(ctx context.Context, tokenString string) (bool, error) {
	tokenHash := hashToken(tokenString)
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.TokenBlacklist{}).
		Where("token_hash = ? AND expires_at > ?", tokenHash, time.Now()).
		Count(&count).Error
	
	if err != nil {
		return false, err
	}
	
	return count > 0, nil
}

func (r *tokenRepository) CleanupExpired(ctx context.Context) error {
	return r.db.WithContext(ctx).
		Where("expires_at < ?", time.Now()).
		Delete(&models.TokenBlacklist{}).Error
}
