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

type RoomHandler struct {
	usecase *usecases.RoomUseCase
	logger  *zap.Logger
}

func NewRoomHandler(usecase *usecases.RoomUseCase, logger *zap.Logger) *RoomHandler {
	return &RoomHandler{
		usecase: usecase,
		logger:  logger,
	}
}

type CreateRoomRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	Floor       *int   `json:"floor"`
}

type UpdateRoomRequest struct {
	Name        *string `json:"name" binding:"omitempty,min=1"`
	Description *string `json:"description"`
	Floor       *int    `json:"floor" binding:"omitempty,min=1"`
	Active      *bool   `json:"active"`
}

// ListRooms возвращает список залов для заведения
// @Summary Получить список залов
// @Description Возвращает список всех залов для указанного заведения
// @Tags rooms
// @Produce json
// @Security Bearer
// @Param id path string true "ID заведения"
// @Success 200 {array} models.Room
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /establishments/{id}/rooms [get]
func (h *RoomHandler) ListRooms(c *gin.Context) {
	establishmentIDStr := c.Param("id")
	establishmentID, err := uuid.Parse(establishmentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID заведения"})
		return
	}

	rooms, err := h.usecase.ListRoomsByEstablishmentID(c.Request.Context(), establishmentID)
	if err != nil {
		h.logger.Error("Failed to list rooms", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить список залов"})
		return
	}

	c.JSON(http.StatusOK, rooms)
}

// GetRoom возвращает зал по ID
// @Summary Получить зал по ID
// @Description Возвращает информацию о зале по его ID
// @Tags rooms
// @Produce json
// @Security Bearer
// @Param id path string true "ID заведения"
// @Param room_id path string true "ID зала"
// @Success 200 {object} models.Room
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /establishments/{id}/rooms/{room_id} [get]
func (h *RoomHandler) GetRoom(c *gin.Context) {
	establishmentIDStr := c.Param("id")
	establishmentID, err := uuid.Parse(establishmentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID заведения"})
		return
	}
	roomIDStr := c.Param("room_id")
	roomID, err := uuid.Parse(roomIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID зала"})
		return
	}

	room, err := h.usecase.GetRoomByID(c.Request.Context(), roomID, establishmentID)
	if err != nil {
		h.logger.Error("Failed to get room", zap.Error(err))
		if errors.Is(err, errors.New("room not found")) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Зал не найден"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить зал"})
		return
	}

	c.JSON(http.StatusOK, room)
}

// CreateRoom создает новый зал
// @Summary Создать новый зал
// @Description Создает новый зал для указанного заведения
// @Tags rooms
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID заведения"
// @Param request body CreateRoomRequest true "Данные для создания зала"
// @Success 201 {object} models.Room
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /establishments/{id}/rooms [post]
func (h *RoomHandler) CreateRoom(c *gin.Context) {
	var req CreateRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	establishmentIDStr := c.Param("id")
	establishmentID, err := uuid.Parse(establishmentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID заведения"})
		return
	}

	room := &models.Room{
		EstablishmentID: establishmentID,
		Name:            req.Name,
		Description:     req.Description,
		Active:          true,
	}

	if req.Floor != nil {
		room.Floor = *req.Floor
	} else {
		room.Floor = 1
	}

	if err := h.usecase.CreateRoom(c.Request.Context(), room); err != nil {
		h.logger.Error("Failed to create room", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать зал"})
		return
	}

	c.JSON(http.StatusCreated, room)
}

// UpdateRoom обновляет существующий зал
// @Summary Обновить зал
// @Description Обновляет информацию о существующем зале по его ID
// @Tags rooms
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID заведения"
// @Param room_id path string true "ID зала"
// @Param request body UpdateRoomRequest true "Данные для обновления зала"
// @Success 200 {object} models.Room
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /establishments/{id}/rooms/{room_id} [put]
func (h *RoomHandler) UpdateRoom(c *gin.Context) {
	establishmentIDStr := c.Param("id")
	establishmentID, err := uuid.Parse(establishmentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID заведения"})
		return
	}
	roomIDStr := c.Param("room_id")
	roomID, err := uuid.Parse(roomIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID зала"})
		return
	}

	var req UpdateRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	room, err := h.usecase.GetRoomByID(c.Request.Context(), roomID, establishmentID)
	if err != nil {
		h.logger.Error("Failed to get room for update", zap.Error(err))
		if errors.Is(err, errors.New("room not found")) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Зал не найден"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить зал для обновления"})
		return
	}

	if req.Name != nil {
		room.Name = *req.Name
	}
	if req.Description != nil {
		room.Description = *req.Description
	}
	if req.Floor != nil {
		room.Floor = *req.Floor
	}
	if req.Active != nil {
		room.Active = *req.Active
	}

	if err := h.usecase.UpdateRoom(c.Request.Context(), room, establishmentID); err != nil {
		h.logger.Error("Failed to update room", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить зал"})
		return
	}

	c.JSON(http.StatusOK, room)
}

// DeleteRoom удаляет зал
// @Summary Удалить зал
// @Description Удаляет зал по его ID
// @Tags rooms
// @Produce json
// @Security Bearer
// @Param id path string true "ID заведения"
// @Param room_id path string true "ID зала"
// @Success 204 "Зал успешно удален"
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /establishments/{id}/rooms/{room_id} [delete]
func (h *RoomHandler) DeleteRoom(c *gin.Context) {
	establishmentIDStr := c.Param("id")
	establishmentID, err := uuid.Parse(establishmentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID заведения"})
		return
	}
	roomIDStr := c.Param("room_id")
	roomID, err := uuid.Parse(roomIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID зала"})
		return
	}

	if err := h.usecase.DeleteRoom(c.Request.Context(), roomID, establishmentID); err != nil {
		h.logger.Error("Failed to delete room", zap.Error(err))
		if errors.Is(err, errors.New("room not found")) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Зал не найден"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось удалить зал"})
		return
	}

	c.Status(http.StatusNoContent)
}
