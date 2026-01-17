package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/usecases"
)

type EstablishmentHandler struct {
	usecase *usecases.EstablishmentUseCase
	logger  *zap.Logger
}

func NewEstablishmentHandler(usecase *usecases.EstablishmentUseCase, logger *zap.Logger) *EstablishmentHandler {
	return &EstablishmentHandler{
		usecase: usecase,
		logger:  logger,
	}
}

type UpdateEstablishmentRequest struct {
	Name              *string `json:"name,omitempty"`
	Address           *string `json:"address,omitempty"`
	Phone             *string `json:"phone,omitempty"`
	Email             *string `json:"email,omitempty"`
	HasSeatingPlaces   *bool   `json:"has_seating_places,omitempty"`
	TableCount       *int    `json:"table_count,omitempty"`
	Type              *string `json:"type,omitempty"`
	Active            *bool   `json:"active,omitempty"`
}

// List возвращает заведение пользователя (создаётся при onboarding). 0 или 1 элемент.
// @Summary Получить список заведений
// @Description Возвращает заведения пользователя (обычно 0 или 1 элемент)
// @Tags establishments
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /establishments [get]
func (h *EstablishmentHandler) List(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	list, err := h.usecase.ListByEstablishment(c.Request.Context(), estID)
	if err != nil {
		h.logger.Error("Failed to list establishments", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list establishments"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// Get возвращает заведение по ID. Доступ только к своему заведению.
// @Summary Получить заведение по ID
// @Description Возвращает заведение по ID (доступ только к своему заведению)
// @Tags establishments
// @Produce json
// @Security Bearer
// @Param id path string true "ID заведения"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /establishments/{id} [get]
func (h *EstablishmentHandler) Get(c *gin.Context) {
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
	if id != estID {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied to this establishment"})
		return
	}
	e, err := h.usecase.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "establishment not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": e})
}

// Create не используется: заведение создаётся при прохождении onboarding.
// @Summary Создать заведение (не используется)
// @Description Заведение создаётся при прохождении onboarding, этот endpoint не используется
// @Tags establishments
// @Accept json
// @Produce json
// @Security Bearer
// @Failure 400 {object} map[string]string
// @Router /establishments [post]
func (h *EstablishmentHandler) Create(c *gin.Context) {
	c.JSON(http.StatusBadRequest, gin.H{"error": "Establishment is created during onboarding. Use POST /auth/onboarding/submit"})
}

// Update обновляет заведение. Только своё.
// @Summary Обновить заведение
// @Description Обновляет заведение (доступ только к своему заведению)
// @Tags establishments
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID заведения"
// @Param request body UpdateEstablishmentRequest true "Данные для обновления"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /establishments/{id} [put]
func (h *EstablishmentHandler) Update(c *gin.Context) {
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
	if id != estID {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied to this establishment"})
		return
	}
	e, err := h.usecase.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "establishment not found"})
		return
	}
	var req UpdateEstablishmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Name != nil {
		e.Name = *req.Name
	}
	if req.Address != nil {
		e.Address = *req.Address
	}
	if req.Phone != nil {
		e.Phone = *req.Phone
	}
	if req.Email != nil {
		e.Email = *req.Email
	}
	if req.HasSeatingPlaces != nil {
		e.HasSeatingPlaces = *req.HasSeatingPlaces
	}
	if req.TableCount != nil {
		e.TableCount = req.TableCount
	}
	if req.Type != nil {
		e.Type = *req.Type
	}
	if req.Active != nil {
		e.Active = *req.Active
	}
	if err := h.usecase.Update(c.Request.Context(), e); err != nil {
		h.logger.Error("Failed to update establishment", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update establishment"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": e})
}

// Delete не разрешён.
// @Summary Удалить заведение (не разрешено)
// @Description Удаление заведения не разрешено
// @Tags establishments
// @Produce json
// @Security Bearer
// @Param id path string true "ID заведения"
// @Failure 400 {object} map[string]string
// @Router /establishments/{id} [delete]
func (h *EstablishmentHandler) Delete(c *gin.Context) {
	c.JSON(http.StatusBadRequest, gin.H{"error": "Deletion of establishment is not allowed"})
}