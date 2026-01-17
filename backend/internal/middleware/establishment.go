package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/yourusername/arc/backend/internal/usecases"
)

// RequireEstablishment требует, чтобы у пользователя было заведение (onboarding завершён).
// Ставит establishment_id в контекст. Вызывать после Auth.
func RequireEstablishment(authUC *usecases.AuthUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDVal, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "user not authenticated"})
			c.Abort()
			return
		}

		userID, err := uuid.Parse(userIDVal.(string))
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "invalid user_id"})
			c.Abort()
			return
		}

		estID, err := authUC.GetEstablishmentID(c.Request.Context(), userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get establishment"})
			c.Abort()
			return
		}

		if estID == nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "onboarding not completed or no establishment"})
			c.Abort()
			return
		}

		c.Set("establishment_id", *estID)
		c.Next()
	}
}
