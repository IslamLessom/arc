package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/usecases"
)

type AuthHandler struct {
	usecase *usecases.AuthUseCase
	logger  *zap.Logger
}

func NewAuthHandler(usecase *usecases.AuthUseCase, logger *zap.Logger) *AuthHandler {
	return &AuthHandler{
		usecase: usecase,
		logger:  logger,
	}
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type AuthResponse struct {
	AccessToken  string      `json:"access_token"`
	RefreshToken string      `json:"refresh_token"`
	User         interface{} `json:"user,omitempty"`
}

// Register регистрирует нового пользователя
// @Summary Регистрация нового пользователя
// @Description Регистрирует нового пользователя и возвращает токены доступа
// @Tags auth
// @Accept json
// @Produce json
// @Param request body RegisterRequest true "Данные для регистрации"
// @Success 201 {object} AuthResponse
// @Failure 400 {object} map[string]string
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, accessToken, refreshToken, err := h.usecase.Register(c.Request.Context(), req.Email, req.Password, req.Name)
	if err != nil {
		h.logger.Error("Failed to register user", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: gin.H{
			"id":                   user.ID,
			"email":                user.Email,
			"name":                 user.Name,
			"onboarding_completed": user.OnboardingCompleted,
		},
	})
}

// Login выполняет аутентификацию пользователя
// @Summary Вход в систему
// @Description Аутентифицирует пользователя и возвращает токены доступа
// @Tags auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Данные для входа"
// @Success 200 {object} AuthResponse
// @Failure 401 {object} map[string]string
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, accessToken, refreshToken, err := h.usecase.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		h.logger.Error("Failed to login", zap.Error(err))
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	c.JSON(http.StatusOK, AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: gin.H{
			"id":                   user.ID,
			"email":                user.Email,
			"name":                 user.Name,
			"onboarding_completed": user.OnboardingCompleted,
		},
	})
}

// Refresh обновляет токены доступа
// @Summary Обновление токена
// @Description Обновляет access token используя refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body RefreshRequest true "Refresh token"
// @Success 200 {object} AuthResponse
// @Failure 401 {object} map[string]string
// @Router /auth/refresh [post]
func (h *AuthHandler) Refresh(c *gin.Context) {
	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	accessToken, refreshToken, err := h.usecase.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		h.logger.Error("Failed to refresh token", zap.Error(err))
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token"})
		return
	}

	c.JSON(http.StatusOK, AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	})
}

// Logout выходит из системы и добавляет токен в черный список
// @Summary Выход из системы
// @Description Добавляет токен доступа в черный список
// @Tags auth
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	// Получаем user_id из токена
	userIDStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
		return
	}

	// Получаем токен из заголовка
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "authorization header required"})
		return
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid authorization header format"})
		return
	}

	tokenString := parts[1]

	// Добавляем токен в blacklist
	if err := h.usecase.Logout(c.Request.Context(), tokenString, userID); err != nil {
		h.logger.Error("Failed to logout", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to logout"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "logged out successfully",
	})
}