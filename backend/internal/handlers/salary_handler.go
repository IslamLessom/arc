package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
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
