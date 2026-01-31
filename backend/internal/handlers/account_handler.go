package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
	"github.com/yourusername/arc/backend/internal/usecases"
)

type AccountHandler struct {
	usecase *usecases.AccountUseCase
	logger  *zap.Logger
}

func NewAccountHandler(usecase *usecases.AccountUseCase, logger *zap.Logger) *AccountHandler {
	return &AccountHandler{
		usecase: usecase,
		logger:  logger,
	}
}

type CreateAccountRequest struct {
	Name     string  `json:"name" binding:"required" example:"Основной счет"`
	Currency string  `json:"currency" binding:"required" example:"RUB"`
	TypeID   string  `json:"typeId" binding:"required,uuid" example:"550e8400-e29b-41d4-a716-446655440000"`
	Balance  float64 `json:"balance" example:"0"`
}

type UpdateAccountRequest struct {
	Name     *string `json:"name,omitempty"`
	Currency *string `json:"currency,omitempty"`
	TypeID   *string `json:"typeId,omitempty" binding:"omitempty,uuid"`
	Balance  *float64 `json:"balance,omitempty"`
	Active   *bool   `json:"active,omitempty"`
}

// ListAccounts возвращает список счетов
// @Summary Получить список счетов
// @Description Возвращает список счетов заведения с возможностью фильтрации
// @Tags finance
// @Produce json
// @Security Bearer
// @Param type_id query string false "ID типа счета"
// @Param active query string false "Активность (true/false)"
// @Param search query string false "Поиск по названию"
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /finance/accounts [get]
func (h *AccountHandler) ListAccounts(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	filter := &repositories.AccountFilter{}
	if typeID := c.Query("type_id"); typeID != "" {
		if id, e := uuid.Parse(typeID); e == nil {
			filter.TypeID = &id
		}
	}
	if active := c.Query("active"); active != "" {
		activeBool := active == "true"
		filter.Active = &activeBool
	}
	if search := c.Query("search"); search != "" {
		filter.Search = &search
	}

	list, err := h.usecase.ListAccounts(c.Request.Context(), estID, filter)
	if err != nil {
		h.logger.Error("Failed to list accounts", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list accounts"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// GetAccount возвращает счет по ID
// @Summary Получить счет по ID
// @Description Возвращает счет по ID
// @Tags finance
// @Produce json
// @Security Bearer
// @Param id path string true "ID счета"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /finance/accounts/{id} [get]
func (h *AccountHandler) GetAccount(c *gin.Context) {
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
	account, err := h.usecase.GetAccount(c.Request.Context(), id, estID)
	if err != nil {
		h.logger.Error("Failed to get account", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get account"})
		return
	}
	if account == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "account not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": account})
}

// CreateAccount создает новый счет
// @Summary Создать счет
// @Description Создает новый счет для заведения
// @Tags finance
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateAccountRequest true "Данные счета"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /finance/accounts [post]
func (h *AccountHandler) CreateAccount(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	var req CreateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	typeID, err := uuid.Parse(req.TypeID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid type_id"})
		return
	}
	
	account := &models.Account{
		Name:     req.Name,
		Currency: req.Currency,
		TypeID:   typeID,
		Balance:  req.Balance,
		Active:   true,
	}
	
	if err := h.usecase.CreateAccount(c.Request.Context(), account, estID); err != nil {
		h.logger.Error("Failed to create account", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": account})
}

// UpdateAccount обновляет счет
// @Summary Обновить счет
// @Description Обновляет данные счета
// @Tags finance
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID счета"
// @Param request body UpdateAccountRequest true "Данные для обновления"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /finance/accounts/{id} [put]
func (h *AccountHandler) UpdateAccount(c *gin.Context) {
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
	account, err := h.usecase.GetAccount(c.Request.Context(), id, estID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "account not found"})
		return
	}
	
	var req UpdateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if req.Name != nil {
		account.Name = *req.Name
	}
	if req.Currency != nil {
		account.Currency = *req.Currency
	}
	if req.TypeID != nil {
		typeID, err := uuid.Parse(*req.TypeID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid typeId"})
			return
		}
		account.TypeID = typeID
	}
	if req.Active != nil {
		account.Active = *req.Active
	}
	
	if err := h.usecase.UpdateAccount(c.Request.Context(), account, estID); err != nil {
		h.logger.Error("Failed to update account", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": account})
}

// DeleteAccount удаляет счет
// @Summary Удалить счет
// @Description Удаляет счет по ID
// @Tags finance
// @Produce json
// @Security Bearer
// @Param id path string true "ID счета"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /finance/accounts/{id} [delete]
func (h *AccountHandler) DeleteAccount(c *gin.Context) {
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
	if err := h.usecase.DeleteAccount(c.Request.Context(), id, estID); err != nil {
		h.logger.Error("Failed to delete account", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "account deleted"})
}

// GetAccountTypes возвращает список типов счетов
// @Summary Получить типы счетов
// @Description Возвращает список всех доступных типов счетов
// @Tags finance
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Router /finance/account-types [get]
func (h *AccountHandler) GetAccountTypes(c *gin.Context) {
	types, err := h.usecase.GetAccountTypes(c.Request.Context())
	if err != nil {
		h.logger.Error("Failed to get account types", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get account types"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": types})
}
