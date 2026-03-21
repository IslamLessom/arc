package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/usecases"
)

type SalaryHandler struct {
	usecase *usecases.SalaryUseCase
	logger  *zap.Logger
}

func NewSalaryHandler(usecase *usecases.SalaryUseCase, logger *zap.Logger) *SalaryHandler {
	return &SalaryHandler{
		usecase: usecase,
		logger:  logger,
	}
}

// GetSalaryReport возвращает отчет по зарплатам за период
// @Summary Получить отчет по зарплатам
// @Description Возвращает отчет по зарплатам сотрудников за указанный период с учетом настроек должностей (фиксированная ставка, почасовая оплата, процент от продаж)
// @Tags salary
// @Produce json
// @Security Bearer
// @Param start_date query string true "Начальная дата периода (RFC3339)"
// @Param end_date query string true "Конечная дата периода (RFC3339)"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /finance/salary [get]
func (h *SalaryHandler) GetSalaryReport(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	if startDateStr == "" || endDateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "start_date and end_date are required"})
		return
	}

	startDate, err := time.Parse(time.RFC3339, startDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start_date format, use RFC3339"})
		return
	}

	endDate, err := time.Parse(time.RFC3339, endDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end_date format, use RFC3339"})
		return
	}

	report, err := h.usecase.GetSalaryReport(c.Request.Context(), estID, startDate, endDate)
	if err != nil {
		h.logger.Error("Failed to get salary report", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get salary report"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": report})
}

// PaySalaryRequest представляет запрос на выплату зарплаты
type PaySalaryRequest struct {
	UserID      string  `json:"user_id" binding:"required"`
	AccountID   string  `json:"account_id" binding:"required"`
	PeriodStart string  `json:"period_start" binding:"required"`
	PeriodEnd   string  `json:"period_end" binding:"required"`
	Notes       *string `json:"notes,omitempty"`
}

// PaySalary выплачивает зарплату сотруднику
// @Summary Выплатить зарплату сотруднику
// @Description Создаёт расходную транзакцию, помечает авансы как применённые и фиксирует факт выплаты
// @Tags salary
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body PaySalaryRequest true "Данные для выплаты"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 409 {object} map[string]string "Salary already paid for this period"
// @Failure 500 {object} map[string]string
// @Router /finance/salary/pay [post]
func (h *SalaryHandler) PaySalary(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	// Получаем ID пользователя, который выполняет выплату
	var paidByID *uuid.UUID
	if userID, exists := c.Get("user_id"); exists {
		if id, ok := userID.(uuid.UUID); ok {
			paidByID = &id
		}
	}

	var req PaySalaryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
		return
	}

	accountID, err := uuid.Parse(req.AccountID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account_id"})
		return
	}

	periodStart, err := time.Parse(time.RFC3339, req.PeriodStart)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid period_start format, use RFC3339"})
		return
	}

	periodEnd, err := time.Parse(time.RFC3339, req.PeriodEnd)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid period_end format, use RFC3339"})
		return
	}

	payment, err := h.usecase.PaySalary(c.Request.Context(), estID, &usecases.PaySalaryRequest{
		UserID:      userID,
		AccountID:   accountID,
		PeriodStart: periodStart,
		PeriodEnd:   periodEnd,
		Notes:       req.Notes,
		PaidBy:      paidByID,
	})

	if err != nil {
		h.logger.Error("Failed to pay salary", zap.Error(err))
		// Проверяем специфичные ошибки
		if err.Error() == "salary already paid for this period" {
			c.JSON(http.StatusConflict, gin.H{"error": "salary already paid for this period"})
			return
		}
		if err.Error() == "insufficient balance on account" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "insufficient balance on account"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to pay salary"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": payment})
}
