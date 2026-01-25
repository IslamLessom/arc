package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/usecases"
)

type WorkshopHandler struct {
	usecase *usecases.WorkshopUseCase
	logger  *zap.Logger
}

func NewWorkshopHandler(usecase *usecases.WorkshopUseCase, logger *zap.Logger) *WorkshopHandler {
	return &WorkshopHandler{
		usecase: usecase,
		logger:  logger,
	}
}

type CreateWorkshopRequest struct {
	Name string `json:"name" binding:"required"`
}

type UpdateWorkshopRequest struct {
	Name   *string `json:"name,omitempty"`
	Active *bool   `json:"active,omitempty"`
}

// ListWorkshops возвращает список цехов
// @Summary Получить список цехов
// @Description Возвращает список цехов заведения
// @Tags workshop
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /workshops [get]
func (h *WorkshopHandler) ListWorkshops(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	list, err := h.usecase.ListWorkshops(c.Request.Context(), estID)
	if err != nil {
		h.logger.Error("Failed to list workshops", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list workshops"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// GetWorkshop возвращает цех по ID
// @Summary Получить цех по ID
// @Description Возвращает цех по ID
// @Tags workshop
// @Produce json
// @Security Bearer
// @Param id path string true "ID цеха"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /workshops/{id} [get]
func (h *WorkshopHandler) GetWorkshop(c *gin.Context) {
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
	w, err := h.usecase.GetWorkshop(c.Request.Context(), id, estID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "workshop not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": w})
}

// CreateWorkshop создает новый цех
// @Summary Создать цех
// @Description Создает новый цех
// @Tags workshop
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateWorkshopRequest true "Данные цеха"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /workshops [post]
func (h *WorkshopHandler) CreateWorkshop(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	var req CreateWorkshopRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	w := &models.Workshop{Name: req.Name, Active: true}
	if err := h.usecase.CreateWorkshop(c.Request.Context(), w, estID); err != nil {
		h.logger.Error("Failed to create workshop", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create workshop"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": w})
}

// UpdateWorkshop обновляет цех
// @Summary Обновить цех
// @Description Обновляет данные цеха
// @Tags workshop
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID цеха"
// @Param request body UpdateWorkshopRequest true "Данные для обновления"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /workshops/{id} [put]
func (h *WorkshopHandler) UpdateWorkshop(c *gin.Context) {
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
	w, err := h.usecase.GetWorkshop(c.Request.Context(), id, estID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "workshop not found"})
		return
	}
	var req UpdateWorkshopRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Name != nil {
		w.Name = *req.Name
	}
	if req.Active != nil {
		w.Active = *req.Active
	}
	if err := h.usecase.UpdateWorkshop(c.Request.Context(), w, estID); err != nil {
		h.logger.Error("Failed to update workshop", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update workshop"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": w})
}

// DeleteWorkshop удаляет цех
// @Summary Удалить цех
// @Description Удаляет цех по ID
// @Tags workshop
// @Produce json
// @Security Bearer
// @Param id path string true "ID цеха"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /workshops/{id} [delete]
func (h *WorkshopHandler) DeleteWorkshop(c *gin.Context) {
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
	if err := h.usecase.DeleteWorkshop(c.Request.Context(), id, estID); err != nil {
		h.logger.Error("Failed to delete workshop", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete workshop"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "workshop deleted"})
}
