package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/usecases"
)

type ShiftHandler struct {
	usecase *usecases.ShiftUseCase
	logger  *zap.Logger
}

func NewShiftHandler(usecase *usecases.ShiftUseCase, logger *zap.Logger) *ShiftHandler {
	return &ShiftHandler{
		usecase: usecase,
		logger:  logger,
	}
}

type EndShiftRequest struct {
	ShiftID   string  `json:"shift_id" binding:"required,uuid"`
	FinalCash float64 `json:"final_cash" binding:"required,min=0"`
	Comment   *string `json:"comment"`
	CashAccountID string `json:"cash_account_id" binding:"required,uuid"`
}

type StartShiftRequest struct {
	InitialCash float64 `json:"initial_cash" binding:"required,min=0"`
	EstablishmentID string `json:"establishment_id" binding:"required,uuid"` // Добавлено поле заведения
}

// StartShift начинает новую смену
// @Summary Начать смену
// @Description Начинает новую смену в заведении, фиксируя начальную сумму наличных.
// @Tags shifts
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body StartShiftRequest true "Данные для начала смены"
// @Success 201 {object} models.Shift
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /shifts/start [post]
func (h *ShiftHandler) StartShift(c *gin.Context) {
	var req StartShiftRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	estID, err := uuid.Parse(req.EstablishmentID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID заведения"})
		return
	}

	shift, err := h.usecase.StartShift(c.Request.Context(), estID, req.InitialCash)
	if err != nil {
		h.logger.Error("Failed to start shift", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось начать смену"})
		return
	}

	c.JSON(http.StatusCreated, shift)
}

// EndShift завершает активную смену
// @Summary Завершить смену
// @Description Завершает текущую активную смену кассира, фиксируя итоговую сумму наличных и опциональный комментарий.
// @Tags shifts
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body EndShiftRequest true "Данные для завершения смены"
// @Success 200 {object} models.Shift
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /shifts/end [post]
func (h *ShiftHandler) EndShift(c *gin.Context) {
	var req EndShiftRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	shiftID, err := uuid.Parse(req.ShiftID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID смены"})
		return
	}

	cashAccountID, err := uuid.Parse(req.CashAccountID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID аккаунта для наличных"})
		return
	}

	shift, err := h.usecase.EndShift(c.Request.Context(), shiftID, req.FinalCash, req.Comment, cashAccountID)
	if err != nil {
		h.logger.Error("Failed to end shift", zap.Error(err))
		if err.Error() == "shift already ended" { // Assuming this specific error string from usecase
			c.JSON(http.StatusBadRequest, gin.H{"error": "Смена уже завершена"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось завершить смену"})
		return
	}

	c.JSON(http.StatusOK, shift)
}

// GetCurrentActiveShift возвращает текущую активную смену для заведения
// @Summary Получить текущую активную смену
// @Description Возвращает текущую активную смену заведения.
// @Tags shifts
// @Produce json
// @Security Bearer
// @Success 200 {object} models.Shift
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /shifts/me/active [get]
func (h *ShiftHandler) GetCurrentActiveShift(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	shift, err := h.usecase.GetActiveShiftByEstablishment(c.Request.Context(), estID)
	if err != nil {
		h.logger.Error("Failed to get current active shift", zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"error": "Активная смена не найдена"})
		return
	}

	c.JSON(http.StatusOK, shift)
}