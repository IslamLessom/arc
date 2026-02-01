package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/usecases"
)

type TableHandler struct {
	usecase *usecases.TableUseCase
	logger  *zap.Logger
}

func NewTableHandler(usecase *usecases.TableUseCase, logger *zap.Logger) *TableHandler {
	return &TableHandler{
		usecase: usecase,
		logger:  logger,
	}
}

type CreateTableRequest struct {
	Number    int     `json:"number" binding:"required,min=1"`
	Name      string  `json:"name"`
	Capacity  int     `json:"capacity" binding:"min=1"`
	PositionX float64 `json:"position_x"`
	PositionY float64 `json:"position_y"`
	Rotation  float64 `json:"rotation"`
	Width     float64 `json:"width"`
	Height    float64 `json:"height"`
	Shape     string  `json:"shape"`
}

type UpdateTableRequest struct {
	Number    *int     `json:"number" binding:"omitempty,min=1"`
	Name      *string  `json:"name"`
	Capacity  *int     `json:"capacity" binding:"omitempty,min=1"`
	PositionX *float64 `json:"position_x"`
	PositionY *float64 `json:"position_y"`
	Rotation  *float64 `json:"rotation"`
	Width     *float64 `json:"width"`
	Height    *float64 `json:"height"`
	Shape     *string  `json:"shape" binding:"omitempty,oneof=round square"`
	Status    *string  `json:"status" binding:"omitempty,oneof=available occupied reserved"`
	Active    *bool    `json:"active"`
}

// ListTables возвращает список столов для зала
// @Summary Получить список столов
// @Description Возвращает список всех столов для указанного зала
// @Tags tables
// @Produce json
// @Security Bearer
// @Param id path string true "ID зала"
// @Success 200 {array} models.Table
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /rooms/{id}/tables [get]
func (h *TableHandler) ListTables(c *gin.Context) {
	roomIDStr := c.Param("id")
	roomID, err := uuid.Parse(roomIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID зала"})
		return
	}

	tables, err := h.usecase.ListTablesByRoomID(c.Request.Context(), roomID)
	if err != nil {
		h.logger.Error("Failed to list tables", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить список столов"})
		return
	}

	c.JSON(http.StatusOK, tables)
}

// GetTable возвращает стол по ID
// @Summary Получить стол по ID
// @Description Возвращает информацию о столе по его ID
// @Tags tables
// @Produce json
// @Security Bearer
// @Param id path string true "ID зала"
// @Param table_id path string true "ID стола"
// @Success 200 {object} models.Table
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /rooms/{id}/tables/{table_id} [get]
func (h *TableHandler) GetTable(c *gin.Context) {
	roomIDStr := c.Param("id")
	roomID, err := uuid.Parse(roomIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID зала"})
		return
	}
	tableIDStr := c.Param("table_id")
	tableID, err := uuid.Parse(tableIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID стола"})
		return
	}

	table, err := h.usecase.GetTableByID(c.Request.Context(), tableID, roomID)
	if err != nil {
		h.logger.Error("Failed to get table", zap.Error(err))
		if errors.Is(err, errors.New("table not found")) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Стол не найден"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить стол"})
		return
	}

	c.JSON(http.StatusOK, table)
}

// CreateTable создает новый стол
// @Summary Создать новый стол
// @Description Создает новый стол для указанного зала
// @Tags tables
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID зала"
// @Param request body CreateTableRequest true "Данные для создания стола"
// @Success 201 {object} models.Table
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /rooms/{id}/tables [post]
func (h *TableHandler) CreateTable(c *gin.Context) {
	var req CreateTableRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	roomIDStr := c.Param("id")
	roomID, err := uuid.Parse(roomIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID зала"})
		return
	}

	table := &models.Table{
		RoomID:    roomID,
		Number:    req.Number,
		Name:      req.Name,
		Capacity:  req.Capacity,
		PositionX: req.PositionX,
		PositionY: req.PositionY,
		Rotation:  req.Rotation,
		Width:     req.Width,
		Height:    req.Height,
		Shape:     req.Shape,
		Status:    "available",
		Active:    true,
	}

	// Устанавливаем значения по умолчанию, если не указаны
	if table.Width == 0 {
		table.Width = 80
	}
	if table.Height == 0 {
		table.Height = 80
	}
	if table.Shape == "" {
		table.Shape = "round"
	}

	if err := h.usecase.CreateTable(c.Request.Context(), table); err != nil {
		h.logger.Error("Failed to create table", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать стол"})
		return
	}

	c.JSON(http.StatusCreated, table)
}

// UpdateTable обновляет существующий стол
// @Summary Обновить стол
// @Description Обновляет информацию о существующем столе по его ID
// @Tags tables
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID зала"
// @Param table_id path string true "ID стола"
// @Param request body UpdateTableRequest true "Данные для обновления стола"
// @Success 200 {object} models.Table
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /rooms/{id}/tables/{table_id} [put]
func (h *TableHandler) UpdateTable(c *gin.Context) {
	roomIDStr := c.Param("id")
	roomID, err := uuid.Parse(roomIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID зала"})
		return
	}
	tableIDStr := c.Param("table_id")
	tableID, err := uuid.Parse(tableIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID стола"})
		return
	}

	var req UpdateTableRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	table, err := h.usecase.GetTableByID(c.Request.Context(), tableID, roomID)
	if err != nil {
		h.logger.Error("Failed to get table for update", zap.Error(err))
		if errors.Is(err, errors.New("table not found")) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Стол не найден"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить стол для обновления"})
		return
	}

	if req.Number != nil {
		table.Number = *req.Number
	}
	if req.Name != nil {
		table.Name = *req.Name
	}
	if req.Capacity != nil {
		table.Capacity = *req.Capacity
	}
	if req.PositionX != nil {
		table.PositionX = *req.PositionX
	}
	if req.PositionY != nil {
		table.PositionY = *req.PositionY
	}
	if req.Rotation != nil {
		table.Rotation = *req.Rotation
	}
	if req.Width != nil {
		table.Width = *req.Width
	}
	if req.Height != nil {
		table.Height = *req.Height
	}
	if req.Shape != nil {
		table.Shape = *req.Shape
	}
	if req.Status != nil {
		table.Status = *req.Status
	}
	if req.Active != nil {
		table.Active = *req.Active
	}

	if err := h.usecase.UpdateTable(c.Request.Context(), table, roomID); err != nil {
		h.logger.Error("Failed to update table", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить стол"})
		return
	}

	c.JSON(http.StatusOK, table)
}

// DeleteTable удаляет стол
// @Summary Удалить стол
// @Description Удаляет стол по его ID
// @Tags tables
// @Produce json
// @Security Bearer
// @Param id path string true "ID зала"
// @Param table_id path string true "ID стола"
// @Success 204 "Стол успешно удален"
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /rooms/{id}/tables/{table_id} [delete]
func (h *TableHandler) DeleteTable(c *gin.Context) {
	roomIDStr := c.Param("id")
	roomID, err := uuid.Parse(roomIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID зала"})
		return
	}
	tableIDStr := c.Param("table_id")
	tableID, err := uuid.Parse(tableIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID стола"})
		return
	}

	if err := h.usecase.DeleteTable(c.Request.Context(), tableID, roomID); err != nil {
		h.logger.Error("Failed to delete table", zap.Error(err))
		if errors.Is(err, errors.New("table not found")) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Стол не найден"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось удалить стол"})
		return
	}

	c.Status(http.StatusNoContent)
}
