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

type InventoryHandler struct {
	usecase *usecases.InventoryUseCase
	logger  *zap.Logger
}

func NewInventoryHandler(usecase *usecases.InventoryUseCase, logger *zap.Logger) *InventoryHandler {
	return &InventoryHandler{
		usecase: usecase,
		logger:  logger,
	}
}

// ——— Requests ———

type CreateInventoryRequest struct {
	WarehouseID   string                        `json:"warehouse_id" binding:"required,uuid"`
	Type          models.InventoryType          `json:"type" binding:"required,oneof=full partial"`
	ScheduledDate *string                       `json:"scheduled_date"` // RFC3339 format
	Comment       string                        `json:"comment"`
	Items         []CreateInventoryItemRequest  `json:"items"`
}

type CreateInventoryItemRequest struct {
	Type             models.InventoryItemType `json:"type" binding:"required,oneof=ingredient product tech_card semi_finished"`
	IngredientID     *string                  `json:"ingredient_id,omitempty" binding:"omitempty,uuid"`
	ProductID        *string                  `json:"product_id,omitempty" binding:"omitempty,uuid"`
	TechCardID       *string                  `json:"tech_card_id,omitempty" binding:"omitempty,uuid"`
	SemiFinishedID   *string                  `json:"semi_finished_id,omitempty" binding:"omitempty,uuid"`
	ActualQuantity   float64                  `json:"actual_quantity"`
	Comment          string                   `json:"comment"`
}

type UpdateInventoryItemRequest struct {
	ActualQuantity float64 `json:"actual_quantity"`
	Comment        string  `json:"comment"`
}

type UpdateInventoryStatusRequest struct {
	Status models.InventoryStatus `json:"status" binding:"required,oneof=draft in_progress completed cancelled"`
}

type UpdateInventoryRequest struct {
	ScheduledDate *string `json:"scheduled_date"`
	Comment       string  `json:"comment"`
}

// ——— Handlers ———

// List возвращает список инвентаризаций
// @Summary Получить список инвентаризаций
// @Description Возвращает список инвентаризаций с возможностью фильтрации
// @Tags inventory
// @Produce json
// @Security Bearer
// @Param warehouse_id query string false "ID склада"
// @Param type query string false "Тип инвентаризации (full, partial)"
// @Param status query string false "Статус (draft, in_progress, completed, cancelled)"
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /inventory [get]
func (h *InventoryHandler) List(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	filter := &repositories.InventoryFilter{}
	if s := c.Query("warehouse_id"); s != "" {
		if id, e := uuid.Parse(s); e == nil {
			filter.WarehouseID = &id
		}
	}
	if s := c.Query("type"); s != "" {
		invType := models.InventoryType(s)
		filter.Type = &invType
	}
	if s := c.Query("status"); s != "" {
		status := models.InventoryStatus(s)
		filter.Status = &status
	}

	list, err := h.usecase.List(c.Request.Context(), estID, filter)
	if err != nil {
		h.logger.Error("Failed to list inventories", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list inventories"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// GetByID возвращает инвентаризацию по ID
// @Summary Получить инвентаризацию по ID
// @Description Возвращает инвентаризацию по ID с детальной информацией
// @Tags inventory
// @Produce json
// @Security Bearer
// @Param id path string true "ID инвентаризации"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /inventory/{id} [get]
func (h *InventoryHandler) GetByID(c *gin.Context) {
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
	inventory, err := h.usecase.GetByID(c.Request.Context(), id, estID)
	if err != nil {
		h.logger.Error("Failed to get inventory", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": inventory})
}

// Update обновляет инвентаризацию
// @Summary Обновить инвентаризацию
// @Description Обновляет комментарий и запланированную дату инвентаризации
// @Tags inventory
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID инвентаризации"
// @Param request body UpdateInventoryRequest true "Данные для обновления"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /inventory/{id} [put]
func (h *InventoryHandler) Update(c *gin.Context) {
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

	var req UpdateInventoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Парсим scheduled_date если указан
	var scheduledDate *time.Time
	if req.ScheduledDate != nil && *req.ScheduledDate != "" {
		t, err := time.Parse(time.RFC3339, *req.ScheduledDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid scheduled_date format, expected RFC3339"})
			return
		}
		scheduledDate = &t
	}

	updateReq := &usecases.UpdateInventoryRequest{
		ScheduledDate: scheduledDate,
		Comment:       req.Comment,
	}

	inventory, err := h.usecase.Update(c.Request.Context(), id, updateReq, estID)
	if err != nil {
		h.logger.Error("Failed to update inventory", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": inventory})
}

// Create создает новую инвентаризацию
// @Summary Создать инвентаризацию
// @Description Создает новую инвентаризацию. Для частичной инвентаризации необходимо указать элементы. Для полной - элементы опциональны.
// @Tags inventory
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateInventoryRequest true "Данные инвентаризации"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /inventory [post]
func (h *InventoryHandler) Create(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var req CreateInventoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	warehouseID, err := uuid.Parse(req.WarehouseID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid warehouse_id"})
		return
	}

	// Парсим scheduled_date если указан
	var scheduledDate *time.Time
	if req.ScheduledDate != nil && *req.ScheduledDate != "" {
		t, err := time.Parse(time.RFC3339, *req.ScheduledDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid scheduled_date format, expected RFC3339"})
			return
		}
		scheduledDate = &t
	}

	// Преобразуем элементы
	items := make([]usecases.CreateInventoryItemRequest, 0, len(req.Items))
	for _, item := range req.Items {
		itemReq := usecases.CreateInventoryItemRequest{
			Type:           item.Type,
			ActualQuantity: item.ActualQuantity,
			Comment:        item.Comment,
		}

		if item.IngredientID != nil && *item.IngredientID != "" {
			if id, e := uuid.Parse(*item.IngredientID); e == nil {
				itemReq.IngredientID = &id
			}
		}
		if item.ProductID != nil && *item.ProductID != "" {
			if id, e := uuid.Parse(*item.ProductID); e == nil {
				itemReq.ProductID = &id
			}
		}
		if item.TechCardID != nil && *item.TechCardID != "" {
			if id, e := uuid.Parse(*item.TechCardID); e == nil {
				itemReq.TechCardID = &id
			}
		}
		if item.SemiFinishedID != nil && *item.SemiFinishedID != "" {
			if id, e := uuid.Parse(*item.SemiFinishedID); e == nil {
				itemReq.SemiFinishedID = &id
			}
		}

		items = append(items, itemReq)
	}

	createReq := &usecases.CreateInventoryRequest{
		WarehouseID:   warehouseID,
		Type:          req.Type,
		ScheduledDate: scheduledDate,
		Comment:       req.Comment,
		Items:         items,
	}

	// Получаем ID пользователя из контекста (если есть)
	var createdBy *uuid.UUID
	if userID, exists := c.Get("user_id"); exists {
		if uid, ok := userID.(uuid.UUID); ok {
			createdBy = &uid
		}
	}

	inventory, err := h.usecase.Create(c.Request.Context(), createReq, estID, createdBy)
	if err != nil {
		h.logger.Error("Failed to create inventory", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": inventory})
}

// UpdateItem обновляет элемент инвентаризации
// @Summary Обновить элемент инвентаризации
// @Description Обновляет элемент инвентаризации (фактическое количество)
// @Tags inventory
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID инвентаризации"
// @Param item_id path string true "ID элемента"
// @Param request body UpdateInventoryItemRequest true "Данные для обновления"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /inventory/{id}/items/{item_id} [put]
func (h *InventoryHandler) UpdateItem(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid inventory id"})
		return
	}

	itemID, err := uuid.Parse(c.Param("item_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item id"})
		return
	}

	var req UpdateInventoryItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updateReq := &usecases.UpdateInventoryItemRequest{
		ActualQuantity: req.ActualQuantity,
		Comment:        req.Comment,
	}

	if err := h.usecase.UpdateItem(c.Request.Context(), id, itemID, estID, updateReq); err != nil {
		h.logger.Error("Failed to update inventory item", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "inventory item updated"})
}

// DeleteItem удаляет элемент инвентаризации
// @Summary Удалить элемент инвентаризации
// @Description Удаляет элемент из инвентаризации (только для черновиков)
// @Tags inventory
// @Produce json
// @Security Bearer
// @Param id path string true "ID инвентаризации"
// @Param item_id path string true "ID элемента"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /inventory/{id}/items/{item_id} [delete]
func (h *InventoryHandler) DeleteItem(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid inventory id"})
		return
	}

	itemID, err := uuid.Parse(c.Param("item_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item id"})
		return
	}

	if err := h.usecase.DeleteItem(c.Request.Context(), id, itemID, estID); err != nil {
		h.logger.Error("Failed to delete inventory item", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "inventory item deleted"})
}

// UpdateStatus обновляет статус инвентаризации
// @Summary Обновить статус инвентаризации
// @Description Обновляет статус инвентаризации (draft -> in_progress -> completed)
// @Tags inventory
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID инвентаризации"
// @Param request body UpdateInventoryStatusRequest true "Новый статус"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /inventory/{id}/status [put]
func (h *InventoryHandler) UpdateStatus(c *gin.Context) {
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

	var req UpdateInventoryStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Получаем ID пользователя из контекста (если есть)
	var completedBy *uuid.UUID
	if req.Status == models.InventoryStatusCompleted {
		if userID, exists := c.Get("user_id"); exists {
			if uid, ok := userID.(uuid.UUID); ok {
				completedBy = &uid
			}
		}
	}

	if err := h.usecase.UpdateStatus(c.Request.Context(), id, estID, req.Status, completedBy); err != nil {
		h.logger.Error("Failed to update inventory status", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "inventory status updated"})
}

// Delete удаляет инвентаризацию
// @Summary Удалить инвентаризацию
// @Description Удаляет инвентаризацию (только черновики)
// @Tags inventory
// @Produce json
// @Security Bearer
// @Param id path string true "ID инвентаризации"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /inventory/{id} [delete]
func (h *InventoryHandler) Delete(c *gin.Context) {
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

	if err := h.usecase.Delete(c.Request.Context(), id, estID); err != nil {
		h.logger.Error("Failed to delete inventory", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "inventory deleted"})
}

// GetStockSnapshot возвращает снапшот остатков на определенную дату
// @Summary Получить снапшот остатков
// @Description Возвращает остатки на складе на определенную дату (для проверки остатков задним числом)
// @Tags inventory
// @Produce json
// @Security Bearer
// @Param warehouse_id query string true "ID склада"
// @Param date query string false "Дата в формате RFC3339"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /inventory/stock-snapshot [get]
func (h *InventoryHandler) GetStockSnapshot(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	warehouseIDStr := c.Query("warehouse_id")
	if warehouseIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "warehouse_id is required"})
		return
	}

	warehouseID, err := uuid.Parse(warehouseIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid warehouse_id"})
		return
	}

	var date *time.Time
	if dateStr := c.Query("date"); dateStr != "" {
		t, err := time.Parse(time.RFC3339, dateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format, expected RFC3339"})
			return
		}
		date = &t
	}

	stock, err := h.usecase.GetStockSnapshot(c.Request.Context(), warehouseID, date, estID)
	if err != nil {
		h.logger.Error("Failed to get stock snapshot", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stock})
}
