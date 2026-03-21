package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/usecases"
)

// SubscriptionCheck middleware проверяет активную подписку пользователя (полная блокировка)
func SubscriptionCheck(authUseCase *usecases.AuthUseCase, logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDStr, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
			c.Abort()
			return
		}

		userID, err := uuid.Parse(userIDStr.(string))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
			c.Abort()
			return
		}

		// Проверяем подписку
		isValid, err := authUseCase.ValidateSubscription(c.Request.Context(), userID)
		if err != nil {
			logger.Error("Failed to validate subscription", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to validate subscription"})
			c.Abort()
			return
		}

		if !isValid {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "subscription expired",
				"message": "Your subscription has expired. Please renew your subscription to continue using the service.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// SubscriptionReadOnlyCheck проверяет подписку и устанавливает режим read-only если истекла
// Используется для админки - пользователь может смотреть данные, но не может изменять
func SubscriptionReadOnlyCheck(authUseCase *usecases.AuthUseCase, logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDStr, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
			c.Abort()
			return
		}

		userID, err := uuid.Parse(userIDStr.(string))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
			c.Abort()
			return
		}

		// Проверяем подписку
		isValid, err := authUseCase.ValidateSubscription(c.Request.Context(), userID)
		if err != nil {
			logger.Error("Failed to validate subscription", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to validate subscription"})
			c.Abort()
			return
		}

		// Если подписка истекла и это запрос на изменение данных (POST, PUT, PATCH, DELETE)
		if !isValid && (c.Request.Method == "POST" || c.Request.Method == "PUT" ||
			c.Request.Method == "PATCH" || c.Request.Method == "DELETE") {
			c.JSON(http.StatusForbidden, gin.H{
				"error":     "subscription expired",
				"message":   "Your subscription has expired. You can only view data in read-only mode. Please renew your subscription to make changes.",
				"read_only": true,
			})
			c.Abort()
			return
		}

		// Устанавливаем флаг read-only в контекст для информирования frontend
		c.Set("read_only", !isValid)
		c.Next()
	}
}

// RequireSuperAdmin проверяет, является ли пользователь супер-админом
func RequireSuperAdmin(authUseCase *usecases.AuthUseCase, logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDStr, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
			c.Abort()
			return
		}

		userID, err := uuid.Parse(userIDStr.(string))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
			c.Abort()
			return
		}

		// Получаем пользователя и проверяем его роль
		user, err := authUseCase.GetUserByID(c.Request.Context(), userID)
		if err != nil {
			logger.Error("Failed to get user", zap.Error(err), zap.String("user_id", userID.String()))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user"})
			c.Abort()
			return
		}

		if user.Role == nil || !user.Role.IsSuperAdmin {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "access denied",
				"message": "Only super administrators can access this resource",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
