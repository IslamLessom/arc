package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/arc/backend/internal/repositories"
	"github.com/yourusername/arc/backend/pkg/auth"
)

// Auth middleware для проверки JWT токена
func Auth(secret string, tokenRepo repositories.TokenRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header required"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header format"})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// Проверяем, не в blacklist ли токен
		if tokenRepo != nil {
			isBlacklisted, err := tokenRepo.IsBlacklisted(c.Request.Context(), tokenString)
			if err == nil && isBlacklisted {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "token has been revoked"})
				c.Abort()
				return
			}
		}

		claims, err := auth.ValidateToken(tokenString, secret)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			c.Abort()
			return
		}

		// Устанавливаем данные пользователя в контекст
		c.Set("user_id", claims.UserID.String())
		c.Set("email", claims.Email)

		c.Next()
	}
}