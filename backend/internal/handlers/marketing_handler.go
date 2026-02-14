package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/usecases"
)

type MarketingHandler struct {
	usecase *usecases.MarketingUseCase
	logger  *zap.Logger
}

func NewMarketingHandler(usecase *usecases.MarketingUseCase, logger *zap.Logger) *MarketingHandler {
	return &MarketingHandler{
		usecase: usecase,
		logger:  logger,
	}
}

// ===== CLIENTS =====

type CreateClientRequest struct {
	Name             string  `json:"name" binding:"required"`
	Email            *string `json:"email,omitempty" binding:"omitempty,email"`
	Phone            *string `json:"phone,omitempty"`
	Birthday         *string `json:"birthday,omitempty"`
	GroupID          *string `json:"group_id,omitempty" binding:"omitempty,uuid"`
	LoyaltyProgramID *string `json:"loyalty_program_id,omitempty" binding:"omitempty,uuid"`
}

type UpdateClientRequest struct {
	Name             *string `json:"name,omitempty"`
	Email            *string `json:"email,omitempty" binding:"omitempty,email"`
	Phone            *string `json:"phone,omitempty"`
	Birthday         *string `json:"birthday,omitempty"`
	GroupID          *string `json:"group_id,omitempty" binding:"omitempty,uuid"`
	LoyaltyProgramID *string `json:"loyalty_program_id,omitempty" binding:"omitempty,uuid"`
}

type AddLoyaltyPointsRequest struct {
	Points int `json:"points" binding:"required,min=1"`
}

// CreateClient creates a new client
// @Summary Создать клиента
// @Description Создает нового клиента для текущего заведения
// @Tags marketing,clients
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateClientRequest true "Данные клиента"
// @Success 201 {object} models.Client
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/clients [post]
func (h *MarketingHandler) CreateClient(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var req CreateClientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var groupID *uuid.UUID
	if req.GroupID != nil {
		parsedID, err := uuid.Parse(*req.GroupID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID группы"})
			return
		}
		groupID = &parsedID
	}

	var loyaltyProgramID *uuid.UUID
	if req.LoyaltyProgramID != nil {
		parsedID, err := uuid.Parse(*req.LoyaltyProgramID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID программы лояльности"})
			return
		}
		loyaltyProgramID = &parsedID
	}

	client, err := h.usecase.CreateClient(
		c.Request.Context(),
		req.Name,
		req.Email,
		req.Phone,
		req.Birthday,
		groupID,
		loyaltyProgramID,
		estID,
	)
	if err != nil {
		h.logger.Error("Failed to create client", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": client})
}

// GetClient retrieves a client by ID
// @Summary Получить клиента
// @Description Возвращает клиента по ID
// @Tags marketing,clients
// @Produce json
// @Security Bearer
// @Param id path string true "ID клиента"
// @Success 200 {object} models.Client
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/clients/{id} [get]
func (h *MarketingHandler) GetClient(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	clientID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID клиента"})
		return
	}

	client, err := h.usecase.GetClient(c.Request.Context(), clientID)
	if err != nil {
		h.logger.Error("Failed to get client", zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": client})
}

// ListClients returns all clients
// @Summary Получить список клиентов
// @Description Возвращает список всех клиентов для текущего заведения
// @Tags marketing,clients
// @Produce json
// @Security Bearer
// @Success 200 {array} models.Client
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/clients [get]
func (h *MarketingHandler) ListClients(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	clients, err := h.usecase.ListClients(c.Request.Context(), estID)
	if err != nil {
		h.logger.Error("Failed to list clients", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": clients})
}

// UpdateClient updates an existing client
// @Summary Обновить клиента
// @Description Обновляет данные существующего клиента
// @Tags marketing,clients
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID клиента"
// @Param request body UpdateClientRequest true "Новые данные клиента"
// @Success 200 {object} models.Client
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/clients/{id} [put]
func (h *MarketingHandler) UpdateClient(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	clientID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID клиента"})
		return
	}

	var req UpdateClientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var groupID *uuid.UUID
	if req.GroupID != nil {
		parsedID, err := uuid.Parse(*req.GroupID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID группы"})
			return
		}
		groupID = &parsedID
	}

	var loyaltyProgramID *uuid.UUID
	if req.LoyaltyProgramID != nil {
		parsedID, err := uuid.Parse(*req.LoyaltyProgramID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID программы лояльности"})
			return
		}
		loyaltyProgramID = &parsedID
	}

	client, err := h.usecase.UpdateClient(
		c.Request.Context(),
		clientID,
		req.Name,
		req.Email,
		req.Phone,
		req.Birthday,
		groupID,
		loyaltyProgramID,
		estID,
	)
	if err != nil {
		h.logger.Error("Failed to update client", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": client})
}

// DeleteClient deletes a client
// @Summary Удалить клиента
// @Description Удаляет клиента по ID
// @Tags marketing,clients
// @Produce json
// @Security Bearer
// @Param id path string true "ID клиента"
// @Success 200 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/clients/{id} [delete]
func (h *MarketingHandler) DeleteClient(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	clientID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID клиента"})
		return
	}

	if err := h.usecase.DeleteClient(c.Request.Context(), clientID); err != nil {
		h.logger.Error("Failed to delete client", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": "ok"})
}

// AddClientLoyaltyPoints adds loyalty points to client
// @Summary Начислить баллы
// @Description Начисляет баллы лояльности клиенту
// @Tags marketing,clients
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID клиента"
// @Param request body AddLoyaltyPointsRequest true "Количество баллов"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/clients/{id}/loyalty/add [post]
func (h *MarketingHandler) AddClientLoyaltyPoints(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	clientID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID клиента"})
		return
	}

	var req AddLoyaltyPointsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.usecase.AddClientLoyaltyPoints(c.Request.Context(), clientID, req.Points); err != nil {
		h.logger.Error("Failed to add loyalty points", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": "ok"})
}

// RedeemClientLoyaltyPoints redeems loyalty points
// @Summary Погасить баллы
// @Description Погасить (списать) баллы лояльности
// @Tags marketing,clients
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID клиента"
// @Param request body AddLoyaltyPointsRequest true "Количество баллов"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/clients/{id}/loyalty/redeem [post]
func (h *MarketingHandler) RedeemClientLoyaltyPoints(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	clientID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID клиента"})
		return
	}

	var req AddLoyaltyPointsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.usecase.RedeemClientLoyaltyPoints(c.Request.Context(), clientID, req.Points); err != nil {
		h.logger.Error("Failed to redeem loyalty points", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": "ok"})
}

// ===== CLIENT GROUPS =====

type CreateClientGroupRequest struct {
	Name               string   `json:"name" binding:"required"`
	Description         *string  `json:"description,omitempty"`
	DiscountPercentage  float64  `json:"discount_percentage" binding:"required,min=0,max=100"`
	MinOrders          *int      `json:"min_orders,omitempty" binding:"omitempty,min=0"`
	MinSpent           *float64  `json:"min_spent,omitempty" binding:"omitempty,min=0"`
}

type UpdateClientGroupRequest struct {
	Name               *string  `json:"name,omitempty"`
	Description         *string  `json:"description,omitempty"`
	DiscountPercentage  *float64 `json:"discount_percentage,omitempty" binding:"omitempty,min=0,max=100"`
	MinOrders          *int     `json:"min_orders,omitempty" binding:"omitempty,min=0"`
	MinSpent           *float64  `json:"min_spent,omitempty" binding:"omitempty,min=0"`
}

// CreateClientGroup creates a new client group
// @Summary Создать группу клиентов
// @Description Создает новую группу клиентов для текущего заведения
// @Tags marketing,groups
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateClientGroupRequest true "Данные группы"
// @Success 201 {object} models.ClientGroup
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/customer-groups [post]
func (h *MarketingHandler) CreateClientGroup(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var req CreateClientGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	group, err := h.usecase.CreateClientGroup(
		c.Request.Context(),
		req.Name,
		req.Description,
		req.DiscountPercentage,
		req.MinOrders,
		req.MinSpent,
		estID,
	)
	if err != nil {
		h.logger.Error("Failed to create client group", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": group})
}

// GetClientGroup retrieves a client group by ID
// @Summary Получить группу клиентов
// @Description Возвращает группу клиентов по ID
// @Tags marketing,groups
// @Produce json
// @Security Bearer
// @Param id path string true "ID группы"
// @Success 200 {object} models.ClientGroup
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/customer-groups/{id} [get]
func (h *MarketingHandler) GetClientGroup(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	groupID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID группы"})
		return
	}

	group, err := h.usecase.GetClientGroup(c.Request.Context(), groupID)
	if err != nil {
		h.logger.Error("Failed to get client group", zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": group})
}

// ListClientGroups returns all client groups
// @Summary Получить список групп клиентов
// @Description Возвращает список всех групп клиентов для текущего заведения
// @Tags marketing,groups
// @Produce json
// @Security Bearer
// @Success 200 {array} models.ClientGroup
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/customer-groups [get]
func (h *MarketingHandler) ListClientGroups(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	groups, err := h.usecase.ListClientGroups(c.Request.Context(), estID)
	if err != nil {
		h.logger.Error("Failed to list client groups", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": groups})
}

// UpdateClientGroup updates a client group
// @Summary Обновить группу клиентов
// @Description Обновляет данные существующей группы клиентов
// @Tags marketing,groups
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID группы"
// @Param request body UpdateClientGroupRequest true "Новые данные группы"
// @Success 200 {object} models.ClientGroup
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/customer-groups/{id} [put]
func (h *MarketingHandler) UpdateClientGroup(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	groupID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID группы"})
		return
	}

	var req UpdateClientGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	group, err := h.usecase.UpdateClientGroup(
		c.Request.Context(),
		groupID,
		req.Name,
		req.Description,
		req.DiscountPercentage,
		req.MinOrders,
		req.MinSpent,
		estID,
	)
	if err != nil {
		h.logger.Error("Failed to update client group", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": group})
}

// DeleteClientGroup deletes a client group
// @Summary Удалить группу клиентов
// @Description Удаляет группу клиентов по ID
// @Tags marketing,groups
// @Produce json
// @Security Bearer
// @Param id path string true "ID группы"
// @Success 200 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/customer-groups/{id} [delete]
func (h *MarketingHandler) DeleteClientGroup(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	groupID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID группы"})
		return
	}

	if err := h.usecase.DeleteClientGroup(c.Request.Context(), groupID); err != nil {
		h.logger.Error("Failed to delete client group", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": "ok"})
}

// Helper function to format date for response
func formatDatePtr(t *time.Time) *string {
	if t == nil {
		return nil
	}
	formatted := t.Format("2006-01-02")
	return &formatted
}
