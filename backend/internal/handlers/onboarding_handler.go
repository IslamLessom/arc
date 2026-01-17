package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/usecases"
)

type OnboardingHandler struct {
	usecase *usecases.OnboardingUseCase
	logger  *zap.Logger
}

func NewOnboardingHandler(usecase *usecases.OnboardingUseCase, logger *zap.Logger) *OnboardingHandler {
	return &OnboardingHandler{
		usecase: usecase,
		logger:  logger,
	}
}

// GetQuestions возвращает все вопросы опросника
// @Summary Получить вопросы опросника
// @Description Возвращает все активные вопросы опросника, отсортированные по шагам
// @Tags onboarding
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /auth/onboarding/questions [get]
func (h *OnboardingHandler) GetQuestions(c *gin.Context) {
	questions, err := h.usecase.GetQuestions(c.Request.Context())
	if err != nil {
		h.logger.Error("Failed to get onboarding questions", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get questions"})
		return
	}

	// Группируем вопросы по шагам для удобства фронтенда
	questionsByStep := make(map[int][]interface{})
	for _, q := range questions {
		questionData := map[string]interface{}{
			"id":          q.ID,
			"key":         q.Key,
			"type":        q.Type,
			"label":       q.Label,
			"placeholder": q.Placeholder,
			"required":    q.Required,
			"default_value": q.DefaultValue,
			"condition":   q.Condition,
			"validation": q.Validation,
		}

		// Добавляем опции для select типа
		if len(q.Options) > 0 {
			options := make([]map[string]interface{}, 0, len(q.Options))
			for _, opt := range q.Options {
				options = append(options, map[string]interface{}{
					"value": opt.Value,
					"label": opt.Label,
				})
			}
			questionData["options"] = options
		}

		if questionsByStep[q.Step] == nil {
			questionsByStep[q.Step] = []interface{}{}
		}
		questionsByStep[q.Step] = append(questionsByStep[q.Step], questionData)
	}

	c.JSON(http.StatusOK, gin.H{
		"data": questionsByStep,
		"steps": len(questionsByStep),
	})
}

type SubmitAnswersRequest struct {
	Answers map[string]interface{} `json:"answers" binding:"required"`
}

// SubmitAnswers обрабатывает ответы пользователя и создает заведение
// @Summary Отправить ответы опросника
// @Description Обрабатывает ответы пользователя, создает заведение и настраивает систему
// @Tags onboarding
// @Accept json
// @Produce json
// @Param answers body SubmitAnswersRequest true "Ответы на вопросы опросника"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/onboarding/submit [post]
// @Security Bearer
func (h *OnboardingHandler) SubmitAnswers(c *gin.Context) {
	// Получаем user_id из токена (должен быть установлен middleware.Auth)
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

	var req SubmitAnswersRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	establishment, err := h.usecase.SubmitAnswers(c.Request.Context(), userID, req.Answers)
	if err != nil {
		h.logger.Error("Failed to submit onboarding answers", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":      "onboarding completed successfully",
		"establishment": establishment,
	})
}

// GetUserResponse возвращает ответы пользователя
// @Summary Получить ответы пользователя
// @Description Возвращает сохраненные ответы пользователя на опросник
// @Tags onboarding
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /auth/onboarding/response [get]
// @Security Bearer
func (h *OnboardingHandler) GetUserResponse(c *gin.Context) {
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

	response, err := h.usecase.GetUserResponse(c.Request.Context(), userID)
	if err != nil {
		h.logger.Error("Failed to get user response", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get response"})
		return
	}

	if response == nil {
		c.JSON(http.StatusOK, gin.H{"data": nil, "completed": false})
		return
	}

	// Преобразуем ответы в удобный формат
	answers := make(map[string]interface{})
	for _, answer := range response.Answers {
		var value interface{}
		if err := json.Unmarshal([]byte(answer.Value), &value); err != nil {
			// Если не JSON, используем как строку
			value = answer.Value
		}
		answers[answer.QuestionKey] = value
	}

	c.JSON(http.StatusOK, gin.H{
		"data":      answers,
		"completed": response.Completed,
	})
}
