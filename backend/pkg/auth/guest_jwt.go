package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// GuestClaims — JWT claims для гостевой сессии QR-меню
type GuestClaims struct {
	SessionID       uuid.UUID `json:"session_id"`
	EstablishmentID uuid.UUID `json:"establishment_id"`
	TableID         uuid.UUID `json:"table_id"`
	GuestName       string    `json:"guest_name"`
	IsAnonymous     bool      `json:"is_anonymous"`
	jwt.RegisteredClaims
}

// GenerateGuestToken создаёт JWT для гостевой сессии (срок действия 24 часа)
func GenerateGuestToken(sessionID, establishmentID, tableID uuid.UUID, guestName string, isAnonymous bool, secret string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)

	claims := &GuestClaims{
		SessionID:       sessionID,
		EstablishmentID: establishmentID,
		TableID:         tableID,
		GuestName:       guestName,
		IsAnonymous:     isAnonymous,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ValidateGuestToken проверяет и парсит гостевой JWT
func ValidateGuestToken(tokenString, secret string) (*GuestClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &GuestClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	if claims, ok := token.Claims.(*GuestClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, ErrInvalidToken
}
