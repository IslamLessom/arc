package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/usecases"
)

type StatisticsHandler struct {
	usecase *usecases.StatisticsUseCase
	logger  *zap.Logger
}

func NewStatisticsHandler(usecase *usecases.StatisticsUseCase, logger *zap.Logger) *StatisticsHandler {
	return &StatisticsHandler{
		usecase: usecase,
		logger:  logger,
	}
}

// GetSales возвращает статистику продаж
// @Summary Получить статистику продаж
// @Description Возвращает статистику продаж за указанный период
// @Tags statistics
// @Produce json
// @Security Bearer
// @Param establishment_id query string false "ID заведения"
// @Param start_date query string false "Начальная дата (format: 2006-01-02), опционально"
// @Param end_date query string false "Конечная дата (format: 2006-01-02), опционально"
// @Success 200 {object} models.SalesStatistics
// @Router /statistics/sales [get]
func (h *StatisticsHandler) GetSales(c *gin.Context) {
	establishmentID, startDate, endDate, err := h.parseStatisticsParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stats, err := h.usecase.GetSalesStatistics(c.Request.Context(), establishmentID, startDate, endDate)
	if err != nil {
		h.logger.Error("Failed to get sales statistics", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get sales statistics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetCustomers возвращает статистику клиентов
// @Summary Получить статистику клиентов
// @Description Возвращает статистику клиентов за указанный период
// @Tags statistics
// @Produce json
// @Security Bearer
// @Param establishment_id query string false "ID заведения"
// @Param start_date query string false "Начальная дата (format: 2006-01-02), опционально"
// @Param end_date query string false "Конечная дата (format: 2006-01-02), опционально"
// @Success 200 {object} models.CustomerStatistics
// @Router /statistics/customers [get]
func (h *StatisticsHandler) GetCustomers(c *gin.Context) {
	establishmentID, startDate, endDate, err := h.parseStatisticsParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stats, err := h.usecase.GetCustomerStatistics(c.Request.Context(), establishmentID, startDate, endDate)
	if err != nil {
		h.logger.Error("Failed to get customer statistics", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get customer statistics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetEmployees возвращает статистику сотрудников
// @Summary Получить статистику сотрудников
// @Description Возвращает статистику сотрудников за указанный период
// @Tags statistics
// @Produce json
// @Security Bearer
// @Param establishment_id query string false "ID заведения"
// @Param start_date query string false "Начальная дата (format: 2006-01-02), опционально"
// @Param end_date query string false "Конечная дата (format: 2006-01-02), опционально"
// @Success 200 {object} models.EmployeeStatistics
// @Router /statistics/employees [get]
func (h *StatisticsHandler) GetEmployees(c *gin.Context) {
	establishmentID, startDate, endDate, err := h.parseStatisticsParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stats, err := h.usecase.GetEmployeeStatistics(c.Request.Context(), establishmentID, startDate, endDate)
	if err != nil {
		h.logger.Error("Failed to get employee statistics", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get employee statistics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetWorkshops возвращает статистику цехов
// @Summary Получить статистику цехов
// @Description Возвращает статистику цехов за указанный период
// @Tags statistics
// @Produce json
// @Security Bearer
// @Param establishment_id query string false "ID заведения"
// @Param start_date query string false "Начальная дата (format: 2006-01-02), опционально"
// @Param end_date query string false "Конечная дата (format: 2006-01-02), опционально"
// @Success 200 {object} models.WorkshopStatistics
// @Router /statistics/workshops [get]
func (h *StatisticsHandler) GetWorkshops(c *gin.Context) {
	establishmentID, startDate, endDate, err := h.parseStatisticsParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stats, err := h.usecase.GetWorkshopStatistics(c.Request.Context(), establishmentID, startDate, endDate)
	if err != nil {
		h.logger.Error("Failed to get workshop statistics", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get workshop statistics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetTables возвращает статистику столов
// @Summary Получить статистику столов
// @Description Возвращает статистику столов за указанный период
// @Tags statistics
// @Produce json
// @Security Bearer
// @Param establishment_id query string false "ID заведения"
// @Param start_date query string false "Начальная дата (format: 2006-01-02), опционально"
// @Param end_date query string false "Конечная дата (format: 2006-01-02), опционально"
// @Success 200 {object} models.TableStatistics
// @Router /statistics/tables [get]
func (h *StatisticsHandler) GetTables(c *gin.Context) {
	establishmentID, startDate, endDate, err := h.parseStatisticsParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stats, err := h.usecase.GetTableStatistics(c.Request.Context(), establishmentID, startDate, endDate)
	if err != nil {
		h.logger.Error("Failed to get table statistics", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get table statistics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetCategories возвращает статистику категорий
// @Summary Получить статистику категорий
// @Description Возвращает статистику категорий за указанный период
// @Tags statistics
// @Produce json
// @Security Bearer
// @Param establishment_id query string false "ID заведения"
// @Param start_date query string false "Начальная дата (format: 2006-01-02), опционально"
// @Param end_date query string false "Конечная дата (format: 2006-01-02), опционально"
// @Success 200 {object} models.CategoryStatistics
// @Router /statistics/categories [get]
func (h *StatisticsHandler) GetCategories(c *gin.Context) {
	establishmentID, startDate, endDate, err := h.parseStatisticsParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stats, err := h.usecase.GetCategoryStatistics(c.Request.Context(), establishmentID, startDate, endDate)
	if err != nil {
		h.logger.Error("Failed to get category statistics", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get category statistics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetProducts возвращает статистику товаров
// @Summary Получить статистику товаров
// @Description Возвращает статистику товаров за указанный период
// @Tags statistics
// @Produce json
// @Security Bearer
// @Param establishment_id query string false "ID заведения"
// @Param start_date query string false "Начальная дата (format: 2006-01-02), опционально"
// @Param end_date query string false "Конечная дата (format: 2006-01-02), опционально"
// @Success 200 {object} models.ProductStatistics
// @Router /statistics/products [get]
func (h *StatisticsHandler) GetProducts(c *gin.Context) {
	establishmentID, startDate, endDate, err := h.parseStatisticsParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stats, err := h.usecase.GetProductStatistics(c.Request.Context(), establishmentID, startDate, endDate)
	if err != nil {
		h.logger.Error("Failed to get product statistics", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get product statistics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetABCAnalysis возвращает ABC анализ
// @Summary Получить ABC анализ
// @Description Возвращает ABC анализ товаров за указанный период
// @Tags statistics
// @Produce json
// @Security Bearer
// @Param establishment_id query string false "ID заведения"
// @Param start_date query string false "Начальная дата (format: 2006-01-02), опционально"
// @Param end_date query string false "Конечная дата (format: 2006-01-02), опционально"
// @Success 200 {object} models.ABCAnalysisData
// @Router /statistics/abc [get]
func (h *StatisticsHandler) GetABCAnalysis(c *gin.Context) {
	establishmentID, startDate, endDate, err := h.parseStatisticsParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stats, err := h.usecase.GetABCAnalysis(c.Request.Context(), establishmentID, startDate, endDate)
	if err != nil {
		h.logger.Error("Failed to get ABC analysis", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get ABC analysis"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetChecks возвращает статистику чеков
// @Summary Получить статистику чеков
// @Description Возвращает статистику чеков за указанный период
// @Tags statistics
// @Produce json
// @Security Bearer
// @Param establishment_id query string false "ID заведения"
// @Param start_date query string false "Начальная дата (format: 2006-01-02), опционально"
// @Param end_date query string false "Конечная дата (format: 2006-01-02), опционально"
// @Success 200 {object} models.CheckStatistics
// @Router /statistics/checks [get]
func (h *StatisticsHandler) GetChecks(c *gin.Context) {
	establishmentID, startDate, endDate, err := h.parseStatisticsParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stats, err := h.usecase.GetCheckStatistics(c.Request.Context(), establishmentID, startDate, endDate)
	if err != nil {
		h.logger.Error("Failed to get check statistics", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get check statistics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetReviews возвращает статистику отзывов
// @Summary Получить статистику отзывов
// @Description Возвращает статистику отзывов за указанный период
// @Tags statistics
// @Produce json
// @Security Bearer
// @Param establishment_id query string false "ID заведения"
// @Param start_date query string false "Начальная дата (format: 2006-01-02), опционально"
// @Param end_date query string false "Конечная дата (format: 2006-01-02), опционально"
// @Success 200 {object} models.ReviewStatistics
// @Router /statistics/reviews [get]
func (h *StatisticsHandler) GetReviews(c *gin.Context) {
	establishmentID, startDate, endDate, err := h.parseStatisticsParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stats, err := h.usecase.GetReviewStatistics(c.Request.Context(), establishmentID, startDate, endDate)
	if err != nil {
		h.logger.Error("Failed to get review statistics", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get review statistics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetPayments возвращает статистику оплат
// @Summary Получить статистику оплат
// @Description Возвращает статистику оплат за указанный период
// @Tags statistics
// @Produce json
// @Security Bearer
// @Param establishment_id query string false "ID заведения"
// @Param start_date query string false "Начальная дата (format: 2006-01-02), опционально"
// @Param end_date query string false "Конечная дата (format: 2006-01-02), опционально"
// @Success 200 {object} models.PaymentStatistics
// @Router /statistics/payments [get]
func (h *StatisticsHandler) GetPayments(c *gin.Context) {
	establishmentID, startDate, endDate, err := h.parseStatisticsParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stats, err := h.usecase.GetPaymentStatistics(c.Request.Context(), establishmentID, startDate, endDate)
	if err != nil {
		h.logger.Error("Failed to get payment statistics", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get payment statistics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetTaxes возвращает статистику налогов
// @Summary Получить статистику налогов
// @Description Возвращает статистику налогов за указанный период
// @Tags statistics
// @Produce json
// @Security Bearer
// @Param establishment_id query string false "ID заведения"
// @Param start_date query string false "Начальная дата (format: 2006-01-02), опционально"
// @Param end_date query string false "Конечная дата (format: 2006-01-02), опционально"
// @Success 200 {object} models.TaxStatistics
// @Router /statistics/taxes [get]
func (h *StatisticsHandler) GetTaxes(c *gin.Context) {
	establishmentID, startDate, endDate, err := h.parseStatisticsParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stats, err := h.usecase.GetTaxStatistics(c.Request.Context(), establishmentID, startDate, endDate)
	if err != nil {
		h.logger.Error("Failed to get tax statistics", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get tax statistics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// parseStatisticsParams парсит параметры для запросов статистики
func (h *StatisticsHandler) parseStatisticsParams(c *gin.Context) (uuid.UUID, time.Time, time.Time, error) {
	var establishmentID uuid.UUID

	// Получаем establishment_id из query параметров
	if establishmentIDStr := c.Query("establishment_id"); establishmentIDStr != "" {
		var err error
		establishmentID, err = uuid.Parse(establishmentIDStr)
		if err != nil {
			return uuid.Nil, time.Time{}, time.Time{}, err
		}
	} else {
		// Если establishment_id не передан, берем из контекста (JWT токен)
		if estID, exists := c.Get("establishment_id"); exists {
			if id, ok := estID.(uuid.UUID); ok {
				establishmentID = id
			}
		}
	}

	// Парсим даты
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	var startDate time.Time
	var endDate time.Time
	var err error

	// Если даты не указаны, использум текущий месяц
	if startDateStr == "" || endDateStr == "" {
		startDate, endDate = h.GetDefaultDateRange()
	} else {
		startDate, err = time.Parse("2006-01-02", startDateStr)
		if err != nil {
			return uuid.Nil, time.Time{}, time.Time{}, err
		}

		endDate, err = time.Parse("2006-01-02", endDateStr)
		if err != nil {
			return uuid.Nil, time.Time{}, time.Time{}, err
		}
	}

	// Добавляем время к датам
	startDate = time.Date(startDate.Year(), startDate.Month(), startDate.Day(), 0, 0, 0, 0, time.Local)
	endDate = time.Date(endDate.Year(), endDate.Month(), endDate.Day(), 23, 59, 59, 0, time.Local)

	return establishmentID, startDate, endDate, nil
}

// GetDefaultDateRange возвращает дефолтный диапазон дат (текущий месяц)
func (h *StatisticsHandler) GetDefaultDateRange() (time.Time, time.Time) {
	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.Local)
	endOfMonth := startOfMonth.AddDate(0, 1, -1)
	endOfDay := time.Date(endOfMonth.Year(), endOfMonth.Month(), endOfMonth.Day(), 23, 59, 59, 0, time.Local)
	return startOfMonth, endOfDay
}
