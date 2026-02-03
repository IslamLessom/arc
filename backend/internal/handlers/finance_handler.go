package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
	"github.com/yourusername/arc/backend/internal/usecases"
)

type FinanceHandler struct {
	usecase *usecases.FinanceUseCase
	logger  *zap.Logger
}

func NewFinanceHandler(usecase *usecases.FinanceUseCase, logger *zap.Logger) *FinanceHandler {
	return &FinanceHandler{
		usecase: usecase,
		logger:  logger,
	}
}

type CreateTransactionRequest struct {
	AccountID       string    `json:"account_id" binding:"required,uuid" example:"550e8400-e29b-41d4-a716-446655440000"`
	Type            string    `json:"type" binding:"required,oneof=income expense transfer" example:"expense"`
	Category        string    `json:"category" example:"Аренда"`
	Amount          float64   `json:"amount" binding:"required,gt=0" example:"10000"`
	Description     string    `json:"description" example:"Оплата аренды помещения"`
	TransactionDate time.Time `json:"transaction_date" example:"2026-01-22T21:45:00Z"`
	ShiftID         *string   `json:"shift_id,omitempty" binding:"omitempty,uuid"`
	OrderID         *string   `json:"order_id,omitempty" binding:"omitempty,uuid"`
}

type UpdateTransactionRequest struct {
	AccountID       *string    `json:"account_id,omitempty" binding:"omitempty,uuid"`
	Type            *string    `json:"type,omitempty" binding:"omitempty,oneof=income expense transfer"`
	Category        *string    `json:"category,omitempty"`
	Amount          *float64   `json:"amount,omitempty" binding:"omitempty,gt=0"`
	Description     *string    `json:"description,omitempty"`
	TransactionDate *time.Time `json:"transaction_date,omitempty"`
}

// ListTransactions возвращает транзакции с фильтрацией и поиском
// @Summary Получить список транзакций
// @Description Возвращает список транзакций заведения с возможностью фильтрации по счету, типу, категории, дате и поиска по описанию. Фильтры: account_id, type (income/expense/transfer), category, start_date, end_date, search (поиск по описанию и категории)
// @Tags finance
// @Produce json
// @Security Bearer
// @Param account_id query string false "ID счета"
// @Param type query string false "Тип транзакции (income, expense, transfer)"
// @Param category query string false "Категория"
// @Param start_date query string false "Начальная дата (RFC3339)"
// @Param end_date query string false "Конечная дата (RFC3339)"
// @Param search query string false "Поиск по описанию и категории"
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /finance/transactions [get]
func (h *FinanceHandler) ListTransactions(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	filter := &repositories.TransactionFilter{}
	
	if accountID := c.Query("account_id"); accountID != "" {
		if id, e := uuid.Parse(accountID); e == nil {
			filter.AccountID = &id
		}
	}
	if transactionType := c.Query("type"); transactionType != "" {
		filter.Type = &transactionType
	}
	if category := c.Query("category"); category != "" {
		filter.Category = &category
	}
	if startDateStr := c.Query("start_date"); startDateStr != "" {
		if startDate, e := time.Parse(time.RFC3339, startDateStr); e == nil {
			filter.StartDate = &startDate
		}
	}
	if endDateStr := c.Query("end_date"); endDateStr != "" {
		if endDate, e := time.Parse(time.RFC3339, endDateStr); e == nil {
			filter.EndDate = &endDate
		}
	}
	if search := c.Query("search"); search != "" {
		filter.Search = &search
	}

	list, err := h.usecase.ListTransactions(c.Request.Context(), estID, filter)
	if err != nil {
		h.logger.Error("Failed to list transactions", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list transactions"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// GetTransaction возвращает транзакцию по ID
// @Summary Получить транзакцию по ID
// @Description Возвращает транзакцию по ID
// @Tags finance
// @Produce json
// @Security Bearer
// @Param id path string true "ID транзакции"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /finance/transactions/{id} [get]
func (h *FinanceHandler) GetTransaction(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	transaction, err := h.usecase.GetTransaction(c.Request.Context(), id, estID)
	if err != nil {
		h.logger.Error("Failed to get transaction", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get transaction"})
		return
	}
	if transaction == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "transaction not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": transaction})
}

// CreateTransaction создает новую транзакцию
// @Summary Создать транзакцию
// @Description Создает новую транзакцию (доход или расход). При создании транзакции автоматически обновляется баланс счета: для дохода (income) баланс увеличивается, для расхода (expense) - уменьшается.
// @Tags finance
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateTransactionRequest true "Данные транзакции"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /finance/transactions [post]
func (h *FinanceHandler) CreateTransaction(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	var req CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	accountID, err := uuid.Parse(req.AccountID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account_id"})
		return
	}
	
	transaction := &models.Transaction{
		AccountID:       accountID,
		Type:           req.Type,
		Category:       req.Category,
		Amount:         req.Amount,
		Description:    req.Description,
		TransactionDate: req.TransactionDate,
	}
	
	if transaction.TransactionDate.IsZero() {
		transaction.TransactionDate = time.Now()
	}
	
	if req.ShiftID != nil {
		if shiftID, e := uuid.Parse(*req.ShiftID); e == nil {
			transaction.ShiftID = &shiftID
		}
	}
	if req.OrderID != nil {
		if orderID, e := uuid.Parse(*req.OrderID); e == nil {
			transaction.OrderID = &orderID
		}
	}
	
	if err := h.usecase.CreateTransaction(c.Request.Context(), transaction, estID); err != nil {
		h.logger.Error("Failed to create transaction", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Загружаем транзакцию с связанными данными для ответа
	transactionWithRelations, err := h.usecase.GetTransaction(c.Request.Context(), transaction.ID, estID)
	if err != nil {
		h.logger.Error("Failed to get transaction with relations", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": transactionWithRelations})
}

// UpdateTransaction обновляет транзакцию
// @Summary Обновить транзакцию
// @Description Обновляет транзакцию и пересчитывает баланс счета
// @Tags finance
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID транзакции"
// @Param request body UpdateTransactionRequest true "Данные для обновления"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /finance/transactions/{id} [put]
func (h *FinanceHandler) UpdateTransaction(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	
	transaction, err := h.usecase.GetTransaction(c.Request.Context(), id, estID)
	if err != nil || transaction == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "transaction not found"})
		return
	}
	
	var req UpdateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if req.AccountID != nil {
		accountID, err := uuid.Parse(*req.AccountID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account_id"})
			return
		}
		transaction.AccountID = accountID
	}
	if req.Type != nil {
		transaction.Type = *req.Type
	}
	if req.Category != nil {
		transaction.Category = *req.Category
	}
	if req.Amount != nil {
		transaction.Amount = *req.Amount
	}
	if req.Description != nil {
		transaction.Description = *req.Description
	}
	if req.TransactionDate != nil {
		transaction.TransactionDate = *req.TransactionDate
	}
	
	if err := h.usecase.UpdateTransaction(c.Request.Context(), transaction, estID); err != nil {
		h.logger.Error("Failed to update transaction", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": transaction})
}

// DeleteTransaction удаляет транзакцию
// @Summary Удалить транзакцию
// @Description Удаляет транзакцию и откатывает изменения баланса счета
// @Tags finance
// @Produce json
// @Security Bearer
// @Param id path string true "ID транзакции"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /finance/transactions/{id} [delete]
func (h *FinanceHandler) DeleteTransaction(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := h.usecase.DeleteTransaction(c.Request.Context(), id, estID); err != nil {
		h.logger.Error("Failed to delete transaction", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "transaction deleted"})
}

// GetTotalTransactionsAmount возвращает общую сумму транзакций
// @Summary Получить общую сумму транзакций
// @Description Возвращает общую сумму транзакций заведения с возможностью фильтрации.
// @Tags finance
// @Produce json
// @Security Bearer
// @Param account_id query string false "ID счета"
// @Param type query string false "Тип транзакции (income, expense, transfer)"
// @Param category query string false "Категория"
// @Param start_date query string false "Начальная дата (RFC3339)"
// @Param end_date query string false "Конечная дата (RFC3339)"
// @Param search query string false "Поиск по описанию и категории"
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /finance/transactions/total [get]
func (h *FinanceHandler) GetTotalTransactionsAmount(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	filter := &repositories.TransactionFilter{}
	
	if accountID := c.Query("account_id"); accountID != "" {
		if id, e := uuid.Parse(accountID); e == nil {
			filter.AccountID = &id
		}
	}
	if transactionType := c.Query("type"); transactionType != "" {
		filter.Type = &transactionType
	}
	if category := c.Query("category"); category != "" {
		filter.Category = &category
	}
	if startDateStr := c.Query("start_date"); startDateStr != "" {
		if startDate, e := time.Parse(time.RFC3339, startDateStr); e == nil {
			filter.StartDate = &startDate
		}
	}
	if endDateStr := c.Query("end_date"); endDateStr != "" {
		if endDate, e := time.Parse(time.RFC3339, endDateStr); e == nil {
			filter.EndDate = &endDate
		}
	}
	if search := c.Query("search"); search != "" {
		filter.Search = &search
	}

	totalAmount, err := h.usecase.GetTotalTransactionsAmount(c.Request.Context(), estID, filter)
	if err != nil {
		h.logger.Error("Failed to get total transactions amount", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить общую сумму транзакций"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"total_amount": totalAmount})
}

// GetShifts возвращает смены
// @Summary Получить смены
// @Description Возвращает список смен с возможностью фильтрации по датам
// @Tags finance
// @Produce json
// @Security Bearer
// @Param establishment_id query string false "ID заведения"
// @Param start_date query string false "Начальная дата (RFC3339)"
// @Param end_date query string false "Конечная дата (RFC3339)"
// @Success 200 {object} map[string]interface{}
// @Router /finance/shifts [get]
func (h *FinanceHandler) GetShifts(c *gin.Context) {
	ctx := c.Request.Context()

	// Получаем параметры фильтрации
	var establishmentID *uuid.UUID
	if estIDStr := c.Query("establishment_id"); estIDStr != "" {
		id, err := uuid.Parse(estIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid establishment_id format"})
			return
		}
		establishmentID = &id
	}

	var startDate, endDate *time.Time
	if startDateStr := c.Query("start_date"); startDateStr != "" {
		t, err := time.Parse(time.RFC3339, startDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start_date format, use RFC3339"})
			return
		}
		startDate = &t
	}

	if endDateStr := c.Query("end_date"); endDateStr != "" {
		t, err := time.Parse(time.RFC3339, endDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end_date format, use RFC3339"})
			return
		}
		endDate = &t
	}

	shifts, err := h.usecase.GetShifts(ctx, establishmentID, startDate, endDate)
	if err != nil {
		h.logger.Error("failed to get shifts", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get shifts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": shifts})
}

// GetPNL возвращает отчет о прибылях и убытках
// @Summary Получить отчет P&L
// @Description Возвращает отчет о прибылях и убытках за период
// @Tags finance
// @Produce json
// @Security Bearer
// @Param start_date query string false "Начальная дата (RFC3339)"
// @Param end_date query string false "Конечная дата (RFC3339)"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /finance/pnl [get]
func (h *FinanceHandler) GetPNL(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	// Default to current month if no dates provided
	now := time.Now()
	var startDate, endDate time.Time

	// Try multiple date formats
	dateFormats := []string{time.RFC3339, "2006-01-02", "2006-01-02T15:04:05Z"}

	if startDateStr := c.Query("start_date"); startDateStr != "" {
		for _, format := range dateFormats {
			startDate, err = time.Parse(format, startDateStr)
			if err == nil {
				break
			}
		}
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start_date format"})
			return
		}
	} else {
		startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	}

	if endDateStr := c.Query("end_date"); endDateStr != "" {
		for _, format := range dateFormats {
			endDate, err = time.Parse(format, endDateStr)
			if err == nil {
				break
			}
		}
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end_date format"})
			return
		}
		// Set end of day for end date
		endDate = time.Date(endDate.Year(), endDate.Month(), endDate.Day(), 23, 59, 59, 0, endDate.Location())
	} else {
		endDate = now
	}

	report, err := h.usecase.GetPNL(c.Request.Context(), estID, startDate, endDate)
	if err != nil {
		h.logger.Error("Failed to generate P&L report", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate P&L report"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": report})
}

// GetCashFlow возвращает отчет о движении денежных средств
// @Summary Получить отчет о движении денежных средств
// @Description Возвращает отчет о движении денежных средств
// @Tags finance
// @Produce json
// @Security Bearer
// @Param start_date query string false "Начальная дата"
// @Param end_date query string false "Конечная дата"
// @Success 200 {object} map[string]interface{}
// @Router /finance/cash-flow [get]
func (h *FinanceHandler) GetCashFlow(c *gin.Context) {
	// TODO: Implement cash flow report logic
	c.JSON(http.StatusOK, gin.H{"data": map[string]interface{}{}})
}

// GenerateShiftReport создает и возвращает отчет о смене
// @Summary Сгенерировать отчет о смене
// @Description Генерирует подробный отчет о смене кассира за указанный период, с возможностью фильтрации по сотруднику и включения списка товаров.
// @Tags finance
// @Produce json
// @Security Bearer
// @Param start_date query string true "Дата начала смены (RFC3339)"
// @Param end_date query string true "Дата окончания смены (RFC3339)"
// @Param employee_id query string false "ID сотрудника для фильтрации (UUID)"
// @Param include_products query bool false "Включить детализацию товаров в отчет"
// @Success 200 {object} usecases.ShiftReport
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /finance/reports/shift [get]
func (h *FinanceHandler) GenerateShiftReport(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")
	employeeIDStr := c.Query("employee_id")
	includeProductsStr := c.Query("include_products")

	startDate, err := time.Parse(time.RFC3339, startDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат start_date"})
		return
	}

	endDate, err := time.Parse(time.RFC3339, endDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат end_date"})
		return
	}

	filter := usecases.ShiftReportFilter{
		StartDate: startDate,
		EndDate:   endDate,
	}

	if employeeIDStr != "" {
		// Фильтрация по сотрудникам пока не поддерживается - убираем этот параметр
		// В будущем можно будет добавить фильтрацию через sessions
	}

	if includeProductsStr == "true" {
		filter.IncludeProducts = true
	}

	report, err := h.usecase.GenerateShiftReport(c.Request.Context(), estID, filter)
	if err != nil {
		h.logger.Error("Failed to generate shift report", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, report)
}