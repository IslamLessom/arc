package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

// ===== LOYALTY PROGRAMS =====

type CreateLoyaltyProgramRequest struct {
	Name               string   `json:"name" binding:"required"`
	Description         *string  `json:"description,omitempty"`
	Type               string   `json:"type" binding:"required,oneof=points cashback tier"`
	PointsPerCurrency  *int      `json:"points_per_currency,omitempty" binding:"omitempty,min=1"`
	CashbackPercentage *float64  `json:"cashback_percentage,omitempty" binding:"omitempty,min=0,max=100"`
	MaxCashbackAmount *float64  `json:"max_cashback_amount,omitempty" binding:"omitempty,min=0"`
	PointMultiplier     float64  `json:"point_multiplier" binding:"required,min=0.1,max=10"`
}

type UpdateLoyaltyProgramRequest struct {
	Name               *string  `json:"name,omitempty"`
	Description         *string  `json:"description,omitempty"`
	Type               *string  `json:"type,omitempty" binding:"omitempty,oneof=points cashback tier"`
	PointsPerCurrency  *int     `json:"points_per_currency,omitempty" binding:"omitempty,min=1"`
	CashbackPercentage *float64  `json:"cashback_percentage,omitempty" binding:"omitempty,min=0,max=100"`
	MaxCashbackAmount *float64  `json:"max_cashback_amount,omitempty" binding:"omitempty,min=0"`
	PointMultiplier     *float64 `json:"point_multiplier,omitempty" binding:"omitempty,min=0.1,max=10"`
	Active             *bool    `json:"active,omitempty"`
}

// CreateLoyaltyProgram creates a new loyalty program
// @Summary Создать программу лояльности
// @Description Создает новую программу лояльности для текущего заведения
// @Tags marketing,loyalty
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateLoyaltyProgramRequest true "Данные программы"
// @Success 201 {object} models.LoyaltyProgram
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/loyalty-programs [post]
func (h *MarketingHandler) CreateLoyaltyProgram(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var req CreateLoyaltyProgramRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	program, err := h.usecase.CreateLoyaltyProgram(
		c.Request.Context(),
		req.Name,
		req.Description,
		req.Type,
		req.PointsPerCurrency,
		req.CashbackPercentage,
		req.MaxCashbackAmount,
		req.PointMultiplier,
		estID,
	)
	if err != nil {
		h.logger.Error("Failed to create loyalty program", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": program})
}

// GetLoyaltyProgram retrieves a loyalty program by ID
// @Summary Получить программу лояльности
// @Description Возвращает программу лояльности по ID
// @Tags marketing,loyalty
// @Produce json
// @Security Bearer
// @Param id path string true "ID программы"
// @Success 200 {object} models.LoyaltyProgram
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/loyalty-programs/{id} [get]
func (h *MarketingHandler) GetLoyaltyProgram(c *gin.Context) {
	programID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID программы"})
		return
	}

	program, err := h.usecase.GetLoyaltyProgram(c.Request.Context(), programID)
	if err != nil {
		h.logger.Error("Failed to get loyalty program", zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": program})
}

// ListLoyaltyPrograms returns all loyalty programs
// @Summary Получить список программ лояльности
// @Description Возвращает список всех программ лояльности для текущего заведения
// @Tags marketing,loyalty
// @Produce json
// @Security Bearer
// @Success 200 {array} models.LoyaltyProgram
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/loyalty-programs [get]
func (h *MarketingHandler) ListLoyaltyPrograms(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	programs, err := h.usecase.ListLoyaltyPrograms(c.Request.Context(), estID)
	if err != nil {
		h.logger.Error("Failed to list loyalty programs", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": programs})
}

// UpdateLoyaltyProgram updates a loyalty program
// @Summary Обновить программу лояльности
// @Description Обновляет данные существующей программы лояльности
// @Tags marketing,loyalty
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID программы"
// @Param request body UpdateLoyaltyProgramRequest true "Новые данные программы"
// @Success 200 {object} models.LoyaltyProgram
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/loyalty-programs/{id} [put]
func (h *MarketingHandler) UpdateLoyaltyProgram(c *gin.Context) {
	programID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID программы"})
		return
	}

	var req UpdateLoyaltyProgramRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var name string
	if req.Name != nil {
		name = *req.Name
	}
	var programType string
	if req.Type != nil {
		programType = *req.Type
	}
	var pointMultiplier float64
	if req.PointMultiplier != nil {
		pointMultiplier = *req.PointMultiplier
	}

	program, err := h.usecase.UpdateLoyaltyProgram(
		c.Request.Context(),
		programID,
		name,
		req.Description,
		programType,
		req.PointsPerCurrency,
		req.CashbackPercentage,
		req.MaxCashbackAmount,
		pointMultiplier,
		req.Active != nil && *req.Active,
	)
	if err != nil {
		h.logger.Error("Failed to update loyalty program", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": program})
}

// DeleteLoyaltyProgram deletes a loyalty program
// @Summary Удалить программу лояльности
// @Description Удаляет программу лояльности по ID
// @Tags marketing,loyalty
// @Produce json
// @Security Bearer
// @Param id path string true "ID программы"
// @Success 200 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/loyalty-programs/{id} [delete]
func (h *MarketingHandler) DeleteLoyaltyProgram(c *gin.Context) {
	programID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID программы"})
		return
	}

	if err := h.usecase.DeleteLoyaltyProgram(c.Request.Context(), programID); err != nil {
		h.logger.Error("Failed to delete loyalty program", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": "ok"})
}

// ===== PROMOTIONS =====

type CreatePromotionRequest struct {
	Name               string   `json:"name" binding:"required"`
	Description         *string  `json:"description,omitempty"`
	Type               string   `json:"type" binding:"required,oneof=discount buy_x_get_y bundle happy_hour"`
	DiscountPercentage  *float64  `json:"discount_percentage,omitempty" binding:"omitempty,min=0,max=100"`
	BuyQuantity        *int      `json:"buy_quantity,omitempty" binding:"omitempty,min=1"`
	GetQuantity         *int      `json:"get_quantity,omitempty" binding:"omitempty,min=1"`
	StartDate           string   `json:"start_date" binding:"required"`
	EndDate             string   `json:"end_date" binding:"required"`
}

type UpdatePromotionRequest struct {
	Name               *string  `json:"name,omitempty"`
	Description         *string  `json:"description,omitempty"`
	Type               *string  `json:"type,omitempty" binding:"omitempty,oneof=discount buy_x_get_y bundle happy_hour"`
	DiscountPercentage  *float64  `json:"discount_percentage,omitempty" binding:"omitempty,min=0,max=100"`
	BuyQuantity        *int      `json:"buy_quantity,omitempty" binding:"omitempty,min=1"`
	GetQuantity         *int      `json:"get_quantity,omitempty" binding:"omitempty,min=1"`
	StartDate           *string  `json:"start_date,omitempty"`
	EndDate             *string  `json:"end_date,omitempty"`
	Active             *bool    `json:"active,omitempty"`
}

// CreatePromotion creates a new promotion
// @Summary Создать акцию
// @Description Создает новую акцию для текущего заведения
// @Tags marketing,promotions
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreatePromotionRequest true "Данные акции"
// @Success 201 {object} models.Promotion
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/promotions [post]
func (h *MarketingHandler) CreatePromotion(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var req CreatePromotionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	promotion, err := h.usecase.CreatePromotion(
		c.Request.Context(),
		req.Name,
		req.Description,
		req.Type,
		req.DiscountPercentage,
		req.BuyQuantity,
		req.GetQuantity,
		req.StartDate,
		req.EndDate,
		estID,
	)
	if err != nil {
		h.logger.Error("Failed to create promotion", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": promotion})
}

// GetPromotion retrieves a promotion by ID
// @Summary Получить акцию
// @Description Возвращает акцию по ID
// @Tags marketing,promotions
// @Produce json
// @Security Bearer
// @Param id path string true "ID акции"
// @Success 200 {object} models.Promotion
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/promotions/{id} [get]
func (h *MarketingHandler) GetPromotion(c *gin.Context) {
	promotionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID акции"})
		return
	}

	promotion, err := h.usecase.GetPromotion(c.Request.Context(), promotionID)
	if err != nil {
		h.logger.Error("Failed to get promotion", zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": promotion})
}

// ListPromotions returns all promotions
// @Summary Получить список акций
// @Description Возвращает список всех акций для текущего заведения
// @Tags marketing,promotions
// @Produce json
// @Security Bearer
// @Success 200 {array} models.Promotion
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/promotions [get]
func (h *MarketingHandler) ListPromotions(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	promotions, err := h.usecase.ListPromotions(c.Request.Context(), estID)
	if err != nil {
		h.logger.Error("Failed to list promotions", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": promotions})
}

// UpdatePromotion updates a promotion
// @Summary Обновить акцию
// @Description Обновляет данные существующей акции
// @Tags marketing,promotions
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID акции"
// @Param request body UpdatePromotionRequest true "Новые данные акции"
// @Success 200 {object} models.Promotion
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/promotions/{id} [put]
func (h *MarketingHandler) UpdatePromotion(c *gin.Context) {
	promotionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID акции"})
		return
	}

	var req UpdatePromotionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var name string
	if req.Name != nil {
		name = *req.Name
	}
	var promotionType string
	if req.Type != nil {
		promotionType = *req.Type
	}
	var startDate string
	if req.StartDate != nil {
		startDate = *req.StartDate
	}
	var endDate string
	if req.EndDate != nil {
		endDate = *req.EndDate
	}

	promotion, err := h.usecase.UpdatePromotion(
		c.Request.Context(),
		promotionID,
		name,
		req.Description,
		promotionType,
		req.DiscountPercentage,
		req.BuyQuantity,
		req.GetQuantity,
		startDate,
		endDate,
		req.Active != nil && *req.Active,
	)
	if err != nil {
		h.logger.Error("Failed to update promotion", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": promotion})
}

// DeletePromotion deletes a promotion
// @Summary Удалить акцию
// @Description Удаляет акцию по ID
// @Tags marketing,promotions
// @Produce json
// @Security Bearer
// @Param id path string true "ID акции"
// @Success 200 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/promotions/{id} [delete]
func (h *MarketingHandler) DeletePromotion(c *gin.Context) {
	promotionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID акции"})
		return
	}

	if err := h.usecase.DeletePromotion(c.Request.Context(), promotionID); err != nil {
		h.logger.Error("Failed to delete promotion", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": "ok"})
}

// ===== EXCLUSIONS =====

type CreateExclusionRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description  *string `json:"description,omitempty"`
	Type        string  `json:"type" binding:"required,oneof=product category customer customer_group"`
	EntityID    *string `json:"entity_id,omitempty" binding:"omitempty,uuid"`
	EntityName  *string `json:"entity_name,omitempty"`
}

type UpdateExclusionRequest struct {
	Name        *string `json:"name,omitempty"`
	Description  *string `json:"description,omitempty"`
	Type        *string `json:"type,omitempty" binding:"omitempty,oneof=product category customer customer_group"`
	EntityID    *string `json:"entity_id,omitempty" binding:"omitempty,uuid"`
	EntityName  *string `json:"entity_name,omitempty"`
	Active       *bool   `json:"active,omitempty"`
}

// CreateExclusion creates a new exclusion
// @Summary Создать исключение
// @Description Создает новое исключение для текущего заведения
// @Tags marketing,exclusions
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateExclusionRequest true "Данные исключения"
// @Success 201 {object} models.Exclusion
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/exclusions [post]
func (h *MarketingHandler) CreateExclusion(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var req CreateExclusionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var entityID *uuid.UUID
	if req.EntityID != nil {
		parsedID, err := uuid.Parse(*req.EntityID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID сущности"})
			return
		}
		entityID = &parsedID
	}

	exclusion, err := h.usecase.CreateExclusion(
		c.Request.Context(),
		req.Name,
		req.Description,
		req.Type,
		entityID,
		req.EntityName,
		estID,
	)
	if err != nil {
		h.logger.Error("Failed to create exclusion", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": exclusion})
}

// GetExclusion retrieves an exclusion by ID
// @Summary Получить исключение
// @Description Возвращает исключение по ID
// @Tags marketing,exclusions
// @Produce json
// @Security Bearer
// @Param id path string true "ID исключения"
// @Success 200 {object} models.Exclusion
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/exclusions/{id} [get]
func (h *MarketingHandler) GetExclusion(c *gin.Context) {
	exclusionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID исключения"})
		return
	}

	exclusion, err := h.usecase.GetExclusion(c.Request.Context(), exclusionID)
	if err != nil {
		h.logger.Error("Failed to get exclusion", zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": exclusion})
}

// ListExclusions returns all exclusions
// @Summary Получить список исключений
// @Description Возвращает список всех исключений для текущего заведения
// @Tags marketing,exclusions
// @Produce json
// @Security Bearer
// @Success 200 {array} models.Exclusion
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/exclusions [get]
func (h *MarketingHandler) ListExclusions(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	exclusions, err := h.usecase.ListExclusions(c.Request.Context(), estID)
	if err != nil {
		h.logger.Error("Failed to list exclusions", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": exclusions})
}

// UpdateExclusion updates an exclusion
// @Summary Обновить исключение
// @Description Обновляет данные существующего исключения
// @Tags marketing,exclusions
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID исключения"
// @Param request body UpdateExclusionRequest true "Новые данные исключения"
// @Success 200 {object} models.Exclusion
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/exclusions/{id} [put]
func (h *MarketingHandler) UpdateExclusion(c *gin.Context) {
	exclusionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID исключения"})
		return
	}

	var req UpdateExclusionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var entityID *uuid.UUID
	if req.EntityID != nil {
		parsedID, err := uuid.Parse(*req.EntityID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID сущности"})
			return
		}
		entityID = &parsedID
	}

	var name string
	if req.Name != nil {
		name = *req.Name
	}
	var exclusionType string
	if req.Type != nil {
		exclusionType = *req.Type
	}

	exclusion, err := h.usecase.UpdateExclusion(
		c.Request.Context(),
		exclusionID,
		name,
		req.Description,
		exclusionType,
		entityID,
		req.EntityName,
		req.Active != nil && *req.Active,
	)
	if err != nil {
		h.logger.Error("Failed to update exclusion", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": exclusion})
}

// DeleteExclusion deletes an exclusion
// @Summary Удалить исключение
// @Description Удаляет исключение по ID
// @Tags marketing,exclusions
// @Produce json
// @Security Bearer
// @Param id path string true "ID исключения"
// @Success 200 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /marketing/exclusions/{id} [delete]
func (h *MarketingHandler) DeleteExclusion(c *gin.Context) {
	exclusionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID исключения"})
		return
	}

	if err := h.usecase.DeleteExclusion(c.Request.Context(), exclusionID); err != nil {
		h.logger.Error("Failed to delete exclusion", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": "ok"})
}
