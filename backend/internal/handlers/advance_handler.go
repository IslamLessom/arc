package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/usecases"
)

type AdvanceHandler struct {
	usecase *usecases.AdvanceUseCase
	logger  *zap.Logger
}

func NewAdvanceHandler(usecase *usecases.AdvanceUseCase, logger *zap.Logger) *AdvanceHandler {
	return &AdvanceHandler{
		usecase: usecase,
		logger:  logger,
	}
}

type CreateAdvanceRequest struct {
	UserID      string  `json:"user_id" binding:"required"`
	Amount      float64 `json:"amount" binding:"required"`
	Description *string `json:"description,omitempty"`
}

// CreateAdvance создаёт новый аванс
// @Summary Создать аванс для сотрудника
// @Description Выдаёт аванс сотруднику
// @Tags advances
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateAdvanceRequest true "Данные аванса"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /advances [post]
func (h *AdvanceHandler) CreateAdvance(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var req CreateAdvanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
		return
	}

	if req.Amount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "amount must be positive"})
		return
	}

	advance, err := h.usecase.CreateAdvance(c.Request.Context(), userID, estID, req.Amount, req.Description)
	if err != nil {
		h.logger.Error("Failed to create advance", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create advance"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": advance})
}

// GetAdvanceByID получает аванс по ID
// @Summary Получить аванс по ID
// @Description Возвращает информацию об авансе
// @Tags advances
// @Produce json
// @Security Bearer
// @Param id path string true "ID аванса"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /advances/{id} [get]
func (h *AdvanceHandler) GetAdvanceByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	advance, err := h.usecase.GetAdvanceByID(c.Request.Context(), id)
	if err != nil {
		h.logger.Error("Failed to get advance", zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"error": "advance not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": advance})
}

// ListAdvances получает все авансы заведения
// @Summary Получить все авансы заведения
// @Description Возвращает список всех авансов заведения (фильтруется по заведению из токена)
// @Tags advances
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /advances [get]
func (h *AdvanceHandler) ListAdvances(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	advances, err := h.usecase.ListAdvancesByEstablishment(c.Request.Context(), estID)
	if err != nil {
		h.logger.Error("Failed to list advances", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list advances"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": advances})
}

// ListPendingAdvances получает необработанные авансы
// @Summary Получить необработанные авансы
// @Description Возвращает список авансов в статусе pending
// @Tags advances
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /advances/pending [get]
func (h *AdvanceHandler) ListPendingAdvances(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	advances, err := h.usecase.ListPendingAdvances(c.Request.Context(), estID)
	if err != nil {
		h.logger.Error("Failed to list pending advances", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list pending advances"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": advances})
}

// DeleteAdvance удаляет аванс
// @Summary Удалить аванс
// @Description Удаляет аванс (только если в статусе pending)
// @Tags advances
// @Produce json
// @Security Bearer
// @Param id path string true "ID аванса"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /advances/{id} [delete]
func (h *AdvanceHandler) DeleteAdvance(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.usecase.DeleteAdvance(c.Request.Context(), id); err != nil {
		h.logger.Error("Failed to delete advance", zap.Error(err))
		if err.Error() == "cannot delete advance with status applied" {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete advance"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "advance deleted successfully"})
}
