package handlers

import (
	"encoding/json"
	"fmt"
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

// QuestionResponse представляет структуру вопроса в ответе API
// @Description Структура вопроса опросника. Содержит все необходимые поля для отображения и обработки вопроса на фронтенде
type QuestionResponse struct {
	// ID уникальный идентификатор вопроса (UUID)
	ID          string                 `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	// Key ключ вопроса, используется при отправке ответов (например: "establishment_name", "has_seating_places")
	Key         string                 `json:"key" example:"establishment_name"`
	// Type тип вопроса: text, email, phone, number, boolean, select
	Type        string                 `json:"type" example:"text" enums:"text,email,phone,number,boolean,select"`
	// Label текст вопроса для отображения пользователю
	Label       string                 `json:"label" example:"Название заведения"`
	// Placeholder подсказка для поля ввода
	Placeholder string                 `json:"placeholder,omitempty" example:"Введите название вашего заведения"`
	// Required обязательность заполнения вопроса
	Required    bool                   `json:"required" example:"true"`
	// DefaultValue значение по умолчанию
	DefaultValue string                `json:"default_value,omitempty" example:""`
	// Condition условие показа вопроса (например: "has_seating_places=true")
	Condition   string                 `json:"condition,omitempty" example:"has_seating_places=true"`
	// Validation правила валидации в формате JSON
	Validation  string                 `json:"validation,omitempty" example:"{\"min\": 3, \"max\": 100}"`
	// Options варианты ответов для вопросов типа "select"
	Options     []QuestionOptionResponse `json:"options,omitempty"`
}

// QuestionOptionResponse представляет вариант ответа для вопроса типа select
// @Description Вариант ответа для вопросов типа "select". Содержит значение для отправки и текст для отображения
type QuestionOptionResponse struct {
	// Value значение, которое отправляется в ответе (используется в поле "key" при SubmitAnswers)
	Value string `json:"value" example:"restaurant"`
	// Label текст для отображения пользователю
	Label string `json:"label" example:"Ресторан"`
}

// QuestionsResponse представляет ответ с вопросами, сгруппированными по шагам
// @Description Структура ответа с вопросами, сгруппированными по шагам. Поле data содержит объект, где ключи - номера шагов (строки "1", "2", "3"...), а значения - массивы вопросов
type QuestionsResponse struct {
	// Data содержит вопросы, сгруппированные по шагам. Ключи - номера шагов (строки), значения - массивы вопросов
	Data  map[string][]QuestionResponse `json:"data"`
	// Steps - количество шагов в опроснике
	Steps int                            `json:"steps"`
}

// GetQuestions возвращает все вопросы опросника
// @Summary Получить вопросы опросника
// @Description Возвращает все активные вопросы опросника, отсортированные по шагам. Вопросы группируются по номерам шагов (1, 2, 3...). Каждый вопрос содержит: id (UUID), key (ключ для ответа, используется при отправке ответов), type (text/email/phone/number/boolean/select), label (текст вопроса), placeholder (подсказка), required (обязательность), default_value (значение по умолчанию), condition (условие показа), validation (правила валидации). Для вопросов типа "select" дополнительно возвращается массив options с полями value (значение для отправки) и label (текст для отображения).
// @Tags onboarding
// @Produce json
// @Success 200 {object} QuestionsResponse "Структура ответа: {\"data\": {\"1\": [вопросы шага 1], \"2\": [вопросы шага 2]}, \"steps\": количество_шагов}" "Пример ответа: {\"data\":{\"1\":[{\"id\":\"uuid\",\"key\":\"establishment_name\",\"type\":\"text\",\"label\":\"Название заведения\",\"placeholder\":\"Введите название\",\"required\":true,\"default_value\":\"\",\"condition\":\"\",\"validation\":\"\"}],\"2\":[{\"id\":\"uuid\",\"key\":\"establishment_type\",\"type\":\"select\",\"label\":\"Тип заведения\",\"required\":true,\"options\":[{\"value\":\"restaurant\",\"label\":\"Ресторан\"},{\"value\":\"cafe\",\"label\":\"Кафе\"}]}]},\"steps\":2}"
// @Failure 500 {object} map[string]string
// @Router /auth/onboarding/questions [get]
func (h *OnboardingHandler) GetQuestions(c *gin.Context) {
	questions, err := h.usecase.GetQuestions(c.Request.Context())
	if err != nil {
		h.logger.Error("Failed to get onboarding questions", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get questions"})
		return
	}

	// Группируем вопросы по шагам для удобства фронтенда
	questionsByStep := make(map[string][]QuestionResponse)
	for _, q := range questions {
		questionResp := QuestionResponse{
			ID:          q.ID.String(),
			Key:         q.Key,
			Type:        q.Type,
			Label:       q.Label,
			Placeholder: q.Placeholder,
			Required:    q.Required,
			DefaultValue: q.DefaultValue,
			Condition:   q.Condition,
			Validation:  q.Validation,
		}

		// Добавляем опции для select типа
		if len(q.Options) > 0 {
			questionResp.Options = make([]QuestionOptionResponse, 0, len(q.Options))
			for _, opt := range q.Options {
				questionResp.Options = append(questionResp.Options, QuestionOptionResponse{
					Value: opt.Value,
					Label: opt.Label,
				})
			}
		}

		// Преобразуем номер шага в строку
		stepKey := fmt.Sprintf("%d", q.Step)
		questionsByStep[stepKey] = append(questionsByStep[stepKey], questionResp)
	}

	response := QuestionsResponse{
		Data:  questionsByStep,
		Steps: len(questionsByStep),
	}

	c.JSON(http.StatusOK, response)
}

type SubmitAnswersRequest struct {
	Answers map[string]interface{} `json:"answers" binding:"required"`
}

// SubmitAnswers обрабатывает ответы пользователя и создает заведение
// @Summary Отправить ответы опросника
// @Description Обрабатывает ответы пользователя, создает заведение и настраивает систему. Ответы передаются в формате объекта, где ключи соответствуют полю "key" из вопросов, а значения - ответы пользователя. Типы значений зависят от типа вопроса: text/email/phone - строка, number - число, boolean - true/false, select - значение из options.value
// @Tags onboarding
// @Accept json
// @Produce json
// @Param answers body SubmitAnswersRequest true "Ответы на вопросы опросника. Ключи объекта answers соответствуют полю 'key' из вопросов"
// @Success 201 {object} map[string]interface{} "Ответ содержит message и establishment объект"
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
// @Description Возвращает сохраненные ответы пользователя на опросник. Если опросник не пройден, возвращается completed: false и data: null. Если пройден, возвращается объект с полями: data (объект с ответами, где ключи - это question_key, значения - ответы пользователя) и completed (true/false)
// @Tags onboarding
// @Produce json
// @Success 200 {object} map[string]interface{} "Ответ содержит data (объект с ответами, ключи - question_key) и completed (true/false). Если опросник не пройден, data: null"
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
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
