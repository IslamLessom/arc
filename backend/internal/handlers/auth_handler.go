package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/repositories"
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

type EmployeeLoginRequest struct {
	PIN           string  `json:"pin" binding:"required,numeric,len=4"`
	InitialCash   float64 `json:"initial_cash" binding:"omitempty,min=0"`
	EstablishmentID string  `json:"establishment_id" binding:"required,uuid"` // Добавлено поле заведения
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
		
statusCode := http.StatusInternalServerError
		errorMessage := "Внутренняя ошибка сервера"

		if errors.Is(err, usecases.ErrUserAlreadyExists) {
			statusCode = http.StatusBadRequest
			errorMessage = "Пользователь с таким email уже существует"
		} else if errors.Is(err, usecases.ErrEmailRequired) {
			statusCode = http.StatusBadRequest
			errorMessage = "Требуется адрес электронной почты"
		}
		c.JSON(statusCode, gin.H{"error": errorMessage})
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
statusCode := http.StatusInternalServerError
		errorMessage := "Внутренняя ошибка сервера"

		if errors.Is(err, repositories.ErrUserNotFound) || errors.Is(err, repositories.ErrInvalidCredentials) {
			statusCode = http.StatusUnauthorized
			errorMessage = "Неверные учетные данные"
		}
		c.JSON(statusCode, gin.H{"error": errorMessage})
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

// EmployeeLogin выполняет аутентификацию сотрудника по ПИН-коду и начинает смену
// @Summary Вход сотрудника
// @Description Аутентифицирует сотрудника по 4-значному ПИН-коду, начинает смену и возвращает токены доступа
// @Tags auth
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body EmployeeLoginRequest true "Данные для входа сотрудника"
// @Success 200 {object} AuthResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/employee/login [post]
func (h *AuthHandler) EmployeeLogin(c *gin.Context) {
	var req EmployeeLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	estID, err := uuid.Parse(req.EstablishmentID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID заведения"})
		return
	}

	user, accessToken, refreshToken, err := h.usecase.LoginEmployee(c.Request.Context(), req.PIN, req.InitialCash, estID) // Передаем ID заведения
	if err != nil {
		h.logger.Error("Failed to login employee", zap.Error(err))
		
		statusCode := http.StatusInternalServerError
		errorMessage := "Внутренняя ошибка сервера"

		if errors.Is(err, repositories.ErrUserNotFound) {
			statusCode = http.StatusUnauthorized
			errorMessage = "Неверный ПИН-код или сотрудник не найден в этом заведении"
		} else if strings.Contains(err.Error(), "employee not found in this establishment") {
			statusCode = http.StatusUnauthorized
			errorMessage = "Сотрудник не найден в этом заведении"
		} else if strings.Contains(err.Error(), "employee is not assigned to an establishment") {
			// This case might still be possible if GetByPIN returns a user without an establishment_id
			// but the primary check is now in GetByPIN
			statusCode = http.StatusBadRequest
			errorMessage = "Сотрудник не привязан к заведению"
		}
		c.JSON(statusCode, gin.H{"error": errorMessage})
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
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный токен обновления"})
		return
	}

	c.JSON(http.StatusOK, AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	})
}

// CurrentUserResponse представляет ответ с данными текущего пользователя
// @Description Структура ответа с данными пользователя и настройками заведения
type CurrentUserResponse struct {
	// ID уникальный идентификатор пользователя
	ID string `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	// Email email пользователя
	Email string `json:"email" example:"user@example.com"`
	// Name имя пользователя
	Name string `json:"name" example:"User Name"`
	// OnboardingCompleted завершен ли onboarding
	OnboardingCompleted bool `json:"onboarding_completed" example:"true"`
	// EstablishmentID идентификатор заведения (может быть null)
	EstablishmentID *string `json:"establishment_id,omitempty" example:"550e8400-e29b-41d4-a716-446655440000"`
	// EstablishmentSettings настройки заведения (может быть null)
	EstablishmentSettings *EstablishmentSettingsResponse `json:"establishment_settings,omitempty"`
}

// EstablishmentSettingsResponse представляет настройки заведения
// @Description Настройки заведения из опросника при регистрации
type EstablishmentSettingsResponse struct {
	// HasSeatingPlaces есть ли сидячие места
	HasSeatingPlaces bool `json:"has_seating_places" example:"true"`
	// TableCount количество столов (если есть сидячие места)
	TableCount *int `json:"table_count,omitempty" example:"10"`
	// Type тип заведения: restaurant, cafe, fast_food, bar, etc.
	Type string `json:"type" example:"cafe"`
	// HasDelivery есть ли доставка
	HasDelivery bool `json:"has_delivery" example:"false"`
	// HasTakeaway есть ли на вынос
	HasTakeaway bool `json:"has_takeaway" example:"true"`
	// HasReservations принимаются ли бронирования
	HasReservations bool `json:"has_reservations" example:"false"`
}

// GetCurrentUser возвращает данные текущего авторизованного пользователя
// @Summary Получение данных текущего пользователя
// @Description Возвращает данные текущего авторизованного пользователя с настройками заведения (если есть). Включает: id, email, name, onboarding_completed, establishment_id, establishment_settings (has_seating_places, table_count, type, has_delivery, has_takeaway, has_reservations)
// @Tags auth
// @Produce json
// @Security Bearer
// @Success 200 {object} CurrentUserResponse "Ответ содержит данные пользователя и настройки заведения"
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/me [get]
func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	userIDStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Пользователь не авторизован"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID пользователя"})
		return
	}

	user, establishment, err := h.usecase.GetCurrentUserWithEstablishment(c.Request.Context(), userID)
	if err != nil {
		h.logger.Error("Failed to get current user", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить пользователя"})
		return
	}

	response := CurrentUserResponse{
		ID:                   user.ID.String(),
		Email:                *user.Email,
		Name:                 user.Name,
		OnboardingCompleted: user.OnboardingCompleted,
	}

	if user.EstablishmentID != nil {
		estID := user.EstablishmentID.String()
		response.EstablishmentID = &estID

		if establishment != nil {
			response.EstablishmentSettings = &EstablishmentSettingsResponse{
				HasSeatingPlaces: establishment.HasSeatingPlaces,
				TableCount:       establishment.TableCount,
				Type:             establishment.Type,
				HasDelivery:      establishment.HasDelivery,
				HasTakeaway:      establishment.HasTakeaway,
				HasReservations:  establishment.HasReservations,
			}
		}
	}

	c.JSON(http.StatusOK, response)
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
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Пользователь не авторизован"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID пользователя"})
		return
	}

	// Получаем токен из заголовка
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Требуется заголовок авторизации"})
		return
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат заголовка авторизации"})
		return
	}

	tokenString := parts[1]

	// Добавляем токен в blacklist
	if err := h.usecase.Logout(c.Request.Context(), tokenString, userID); err != nil {
		h.logger.Error("Failed to logout", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось выйти из системы"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Выход выполнен успешно",
	})
}