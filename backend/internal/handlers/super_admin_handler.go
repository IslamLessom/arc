package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/usecases"
)

type SuperAdminHandler struct {
	subscriptionUC usecases.SubscriptionUseCase
	userUC         *usecases.UserUseCase
	logger         *zap.Logger
}

func NewSuperAdminHandler(
	subscriptionUC usecases.SubscriptionUseCase,
	userUC *usecases.UserUseCase,
	logger *zap.Logger,
) *SuperAdminHandler {
	return &SuperAdminHandler{
		subscriptionUC: subscriptionUC,
		userUC:         userUC,
		logger:         logger,
	}
}

// ListSubscriptions возвращает список всех подписок
// @Summary      Список всех подписок
// @Description  Возвращает список всех подписок с пагинацией (только для супер-админа)
// @Tags         SuperAdmin
// @Accept       json
// @Produce      json
// @Param        limit   query    int  false  "Лимит записей"  default(20)
// @Param        offset  query    int  false  "Смещение"       default(0)
// @Success      200     {object}  map[string]interface{}
// @Failure      400     {object}  map[string]interface{}
// @Failure      500     {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /super-admin/subscriptions [get]
func (h *SuperAdminHandler) ListSubscriptions(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	subscriptions, total, err := h.subscriptionUC.ListAllSubscriptions(c.Request.Context(), limit, offset)
	if err != nil {
		h.logger.Error("Failed to list subscriptions", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list subscriptions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"subscriptions": subscriptions,
		"total":         total,
		"limit":         limit,
		"offset":        offset,
	})
}

// GetSubscription возвращает подписку по ID
// @Summary      Получить подписку
// @Description  Возвращает подписку по ID (только для супер-админа)
// @Tags         SuperAdmin
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "ID подписки"
// @Success      200  {object}  models.Subscription
// @Failure      400  {object}  map[string]interface{}
// @Failure      404  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /super-admin/subscriptions/{id} [get]
func (h *SuperAdminHandler) GetSubscription(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription ID"})
		return
	}

	subscription, err := h.subscriptionUC.GetSubscriptionByID(c.Request.Context(), id)
	if err != nil {
		h.logger.Error("Failed to get subscription", zap.Error(err), zap.String("id", idStr))
		c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found"})
		return
	}

	c.JSON(http.StatusOK, subscription)
}

// ExtendSubscriptionRequest запрос на продление подписки
type ExtendSubscriptionRequest struct {
	Days int `json:"days" binding:"required,min=1"`
}

// ExtendSubscription продлевает подписку
// @Summary      Продлить подписку
// @Description  Продлевает подписку на указанное количество дней (только для супер-админа)
// @Tags         SuperAdmin
// @Accept       json
// @Produce      json
// @Param        id      path      string                    true  "ID подписки"
// @Param        request body      ExtendSubscriptionRequest true  "Количество дней"
// @Success      200     {object}  map[string]interface{}
// @Failure      400     {object}  map[string]interface{}
// @Failure      500     {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /super-admin/subscriptions/{id}/extend [post]
func (h *SuperAdminHandler) ExtendSubscription(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription ID"})
		return
	}

	var req ExtendSubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.subscriptionUC.ExtendSubscription(c.Request.Context(), id, req.Days); err != nil {
		h.logger.Error("Failed to extend subscription", zap.Error(err), zap.String("id", idStr))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Subscription extended successfully"})
}

// ChangeSubscriptionPlanRequest запрос на изменение плана
type ChangeSubscriptionPlanRequest struct {
	NewPlanID string `json:"new_plan_id" binding:"required,uuid"`
}

// ChangeSubscriptionPlan изменяет план подписки
// @Summary      Изменить план подписки
// @Description  Изменяет тарифный план подписки (только для супер-админа)
// @Tags         SuperAdmin
// @Accept       json
// @Produce      json
// @Param        id      path      string                         true  "ID подписки"
// @Param        request body      ChangeSubscriptionPlanRequest  true  "ID нового плана"
// @Success      200     {object}  map[string]interface{}
// @Failure      400     {object}  map[string]interface{}
// @Failure      500     {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /super-admin/subscriptions/{id}/change-plan [post]
func (h *SuperAdminHandler) ChangeSubscriptionPlan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription ID"})
		return
	}

	var req ChangeSubscriptionPlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newPlanID, err := uuid.Parse(req.NewPlanID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid plan ID"})
		return
	}

	if err := h.subscriptionUC.ChangeSubscriptionPlan(c.Request.Context(), id, newPlanID); err != nil {
		h.logger.Error("Failed to change subscription plan", zap.Error(err), zap.String("id", idStr))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Subscription plan changed successfully"})
}

// DeactivateSubscription деактивирует подписку
// @Summary      Деактивировать подписку
// @Description  Деактивирует подписку (только для супер-админа)
// @Tags         SuperAdmin
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "ID подписки"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /super-admin/subscriptions/{id}/deactivate [post]
func (h *SuperAdminHandler) DeactivateSubscription(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription ID"})
		return
	}

	if err := h.subscriptionUC.DeactivateSubscription(c.Request.Context(), id); err != nil {
		h.logger.Error("Failed to deactivate subscription", zap.Error(err), zap.String("id", idStr))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Subscription deactivated successfully"})
}

// ActivateSubscription активирует подписку
// @Summary      Активировать подписку
// @Description  Активирует подписку (только для супер-админа)
// @Tags         SuperAdmin
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "ID подписки"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /super-admin/subscriptions/{id}/activate [post]
func (h *SuperAdminHandler) ActivateSubscription(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription ID"})
		return
	}

	if err := h.subscriptionUC.ActivateSubscription(c.Request.Context(), id); err != nil {
		h.logger.Error("Failed to activate subscription", zap.Error(err), zap.String("id", idStr))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Subscription activated successfully"})
}

// ListPlans возвращает список всех тарифных планов
// @Summary      Список тарифных планов
// @Description  Возвращает список всех тарифных планов (только для супер-админа)
// @Tags         SuperAdmin
// @Accept       json
// @Produce      json
// @Success      200  {array}   models.SubscriptionPlan
// @Failure      500  {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /super-admin/plans [get]
func (h *SuperAdminHandler) ListPlans(c *gin.Context) {
	plans, err := h.subscriptionUC.ListAllPlans(c.Request.Context())
	if err != nil {
		h.logger.Error("Failed to list plans", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list plans"})
		return
	}

	c.JSON(http.StatusOK, plans)
}

// CreatePlanRequest запрос на создание плана
type CreatePlanRequest struct {
	Name     string  `json:"name" binding:"required"`
	Duration int     `json:"duration" binding:"required,min=1"`
	Price    float64 `json:"price" binding:"min=0"`
	Features string  `json:"features"`
}

// CreatePlan создает новый тарифный план
// @Summary      Создать тарифный план
// @Description  Создает новый тарифный план (только для супер-админа)
// @Tags         SuperAdmin
// @Accept       json
// @Produce      json
// @Param        request body      CreatePlanRequest  true  "Данные плана"
// @Success      201     {object}  models.SubscriptionPlan
// @Failure      400     {object}  map[string]interface{}
// @Failure      500     {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /super-admin/plans [post]
func (h *SuperAdminHandler) CreatePlan(c *gin.Context) {
	var req CreatePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	plan, err := h.subscriptionUC.CreatePlan(c.Request.Context(), req.Name, req.Duration, req.Price, req.Features)
	if err != nil {
		h.logger.Error("Failed to create plan", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, plan)
}

// UpdatePlanRequest запрос на обновление плана
type UpdatePlanRequest struct {
	Name     string  `json:"name" binding:"required"`
	Duration int     `json:"duration" binding:"required,min=1"`
	Price    float64 `json:"price" binding:"min=0"`
	Features string  `json:"features"`
	Active   bool    `json:"active"`
}

// UpdatePlan обновляет тарифный план
// @Summary      Обновить тарифный план
// @Description  Обновляет тарифный план (только для супер-админа)
// @Tags         SuperAdmin
// @Accept       json
// @Produce      json
// @Param        id      path      string             true  "ID плана"
// @Param        request body      UpdatePlanRequest  true  "Данные плана"
// @Success      200     {object}  map[string]interface{}
// @Failure      400     {object}  map[string]interface{}
// @Failure      500     {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /super-admin/plans/{id} [put]
func (h *SuperAdminHandler) UpdatePlan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid plan ID"})
		return
	}

	var req UpdatePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.subscriptionUC.UpdatePlan(c.Request.Context(), id, req.Name, req.Duration, req.Price, req.Features, req.Active); err != nil {
		h.logger.Error("Failed to update plan", zap.Error(err), zap.String("id", idStr))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Plan updated successfully"})
}

// DeletePlan удаляет тарифный план
// @Summary      Удалить тарифный план
// @Description  Удаляет тарифный план (только для супер-админа)
// @Tags         SuperAdmin
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "ID плана"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Security     BearerAuth
// @Router       /super-admin/plans/{id} [delete]
func (h *SuperAdminHandler) DeletePlan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid plan ID"})
		return
	}

	if err := h.subscriptionUC.DeletePlan(c.Request.Context(), id); err != nil {
		h.logger.Error("Failed to delete plan", zap.Error(err), zap.String("id", idStr))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Plan deleted successfully"})
}
