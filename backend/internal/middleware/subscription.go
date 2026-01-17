package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/usecases"
)

// SubscriptionCheck middleware проверяет активную подписку пользователя
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
				"error": "subscription expired",
				"message": "Your subscription has expired. Please renew your subscription to continue using the service.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
