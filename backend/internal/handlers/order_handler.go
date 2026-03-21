package handlers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/usecases"
)

type OrderHandler struct {
	usecase *usecases.OrderUseCase
	logger  *zap.Logger
}

type CreateOrderRequest struct {
	TableID                  *uuid.UUID         `json:"table_id,omitempty"`
	TableNumber              *int               `json:"table_number,omitempty"`
	GuestsCount              *int               `json:"guests_count,omitempty"`
	ClientID                 *uuid.UUID         `json:"client_id,omitempty"`
	SelectedPromotionID      *uuid.UUID         `json:"selected_promotion_id,omitempty"`
	RedeemLoyaltyPoints      int                `json:"redeem_loyalty_points,omitempty" binding:"min=0"`
	ManualDiscountPercentage *float64           `json:"manual_discount_percentage,omitempty" binding:"omitempty,min=0,max=100"`
	Items                    []OrderItemRequest `json:"items" binding:"required,min=1"`
	TotalAmount              *float64           `json:"total_amount,omitempty" binding:"omitempty,min=0"`
}

type CalculateOrderRequest struct {
	ClientID                 *uuid.UUID         `json:"client_id,omitempty"`
	SelectedPromotionID      *uuid.UUID         `json:"selected_promotion_id,omitempty"`
	RedeemLoyaltyPoints      int                `json:"redeem_loyalty_points,omitempty" binding:"min=0"`
	ManualDiscountPercentage *float64           `json:"manual_discount_percentage,omitempty" binding:"omitempty,min=0,max=100"`
	Items                    []OrderItemRequest `json:"items" binding:"required,min=1"`
}

type PreviewPromotionsRequest struct {
	ClientID            *uuid.UUID         `json:"client_id,omitempty"`
	SelectedPromotionID *uuid.UUID         `json:"selected_promotion_id,omitempty"`
	Items               []OrderItemRequest `json:"items" binding:"required,min=1"`
}

type OrderItemRequest struct {
	ProductID   *uuid.UUID `json:"product_id,omitempty"`
	TechCardID  *uuid.UUID `json:"tech_card_id,omitempty"`
	Quantity    int        `json:"quantity" binding:"required,min=1"`
	GuestNumber *int       `json:"guest_number,omitempty"`
	ClientID    *uuid.UUID `json:"client_id,omitempty"` // Клиент для этой позиции (гостя)
}

type AddOrderItemRequest struct {
	ProductID   *uuid.UUID `json:"product_id,omitempty"`
	TechCardID  *uuid.UUID `json:"tech_card_id,omitempty"`
	Quantity    int        `json:"quantity" binding:"required,min=1"`
	GuestNumber *int       `json:"guest_number,omitempty"`
}

type UpdateOrderItemQuantityRequest struct {
	Quantity int `json:"quantity" binding:"required,min=1"`
}

type ProcessPaymentRequest struct {
	CashAmount float64 `json:"cash_amount" binding:"min=0"`
	CardAmount float64 `json:"card_amount" binding:"min=0"`
	ClientCash float64 `json:"client_cash" binding:"min=0"`
}

type CloseOrderWithoutPaymentRequest struct {
	Reason string `json:"reason" binding:"required"`
}

func NewOrderHandler(usecase *usecases.OrderUseCase, logger *zap.Logger) *OrderHandler {
	return &OrderHandler{
		usecase: usecase,
		logger:  logger,
	}
}

// List возвращает список заказов
// @Summary Получить список заказов
// @Description Возвращает список заказов
// @Tags orders
// @Produce json
// @Security Bearer
// @Param start_date query string false "Начальная дата"
// @Param end_date query string false "Конечная дата"
// @Param status query string false "Статус заказа"
// @Success 200 {object} map[string]interface{}
// @Router /orders [get]
func (h *OrderHandler) List(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	status := c.Query("status")

	orders, err := h.usecase.ListOrders(c.Request.Context(), estID, startDate, endDate, status)
	if err != nil {
		h.logger.Error("Failed to list orders", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить список заказов"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

// ListActiveOrdersByEstablishment возвращает список активных заказов для заведения
// @Summary Получить список активных заказов
// @Description Возвращает список активных заказов (статусы: draft, confirmed, preparing, ready) для текущего заведения
// @Tags orders
// @Produce json
// @Security Bearer
// @Success 200 {array} models.Order
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /orders/active [get]
func (h *OrderHandler) ListActiveOrdersByEstablishment(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	orders, err := h.usecase.GetActiveOrdersByEstablishment(c.Request.Context(), estID)
	if err != nil {
		h.logger.Error("Failed to get active orders", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить список активных заказов"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

// Get возвращает заказ по ID
// @Summary Получить заказ по ID
// @Description Возвращает заказ по ID
// @Tags orders
// @Produce json
// @Security Bearer
// @Param id path string true "ID заказа"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /orders/{id} [get]
func (h *OrderHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("order_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID заказа"})
		return
	}

	estID, err := getEstablishmentID(c)
	if err != nil {
		h.logger.Error("Failed to get establishment from context", zap.Error(err))
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	h.logger.Debug("Getting order", zap.String("order_id", id.String()), zap.String("establishment_id", estID.String()))

	order, err := h.usecase.GetOrder(c.Request.Context(), id, estID)
	if err != nil {
		h.logger.Error("Failed to get order",
			zap.String("order_id", id.String()),
			zap.String("establishment_id", estID.String()),
			zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"error": "Заказ не найден"})
		return
	}

	c.JSON(http.StatusOK, order)
}

// Calculate выполняет серверный расчет стоимости заказа без создания заказа
// @Summary Рассчитать заказ
// @Description Выполняет серверный расчет скидок/лояльности и возвращает breakdown
// @Tags orders
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CalculateOrderRequest true "Данные для расчета"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /orders/calculate [post]
func (h *OrderHandler) Calculate(c *gin.Context) {
	var req CalculateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	orderItems := make([]models.OrderItem, len(req.Items))
	for i, itemReq := range req.Items {
		orderItems[i] = models.OrderItem{
			ProductID:   itemReq.ProductID,
			TechCardID:  itemReq.TechCardID,
			Quantity:    itemReq.Quantity,
			GuestNumber: itemReq.GuestNumber,
			ClientID:    itemReq.ClientID,
		}
	}

	calculation, err := h.usecase.CalculateOrder(c.Request.Context(), estID, orderItems, usecases.OrderPricingOptions{
		ClientID:                 req.ClientID,
		SelectedPromotionID:      req.SelectedPromotionID,
		RedeemLoyaltyPoints:      req.RedeemLoyaltyPoints,
		ManualDiscountPercentage: req.ManualDiscountPercentage,
	})
	if err != nil {
		h.logger.Error("Failed to calculate order", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": calculation})
}

// PreviewPromotions returns item-level promotion eligibility and active promotions
// @Summary Предпросмотр акций по товарам
// @Description Возвращает eligible/promotions и причину неучастия для каждой позиции
// @Tags orders
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body PreviewPromotionsRequest true "Данные для предпросмотра"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /orders/promotions/preview [post]
func (h *OrderHandler) PreviewPromotions(c *gin.Context) {
	var req PreviewPromotionsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	orderItems := make([]models.OrderItem, len(req.Items))
	for i, itemReq := range req.Items {
		orderItems[i] = models.OrderItem{
			ProductID:   itemReq.ProductID,
			TechCardID:  itemReq.TechCardID,
			Quantity:    itemReq.Quantity,
			GuestNumber: itemReq.GuestNumber,
			ClientID:    itemReq.ClientID,
		}
	}

	preview, err := h.usecase.PreviewPromotionsByItems(c.Request.Context(), estID, orderItems, usecases.OrderPricingOptions{
		ClientID:            req.ClientID,
		SelectedPromotionID: req.SelectedPromotionID,
	})
	if err != nil {
		h.logger.Error("Failed to preview promotions", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": preview})
}

// Create создает новый заказ
// @Summary Создать заказ
// @Description Создает новый заказ
// @Tags orders
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body object true "Данные заказа"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /orders [post]
func (h *OrderHandler) Create(c *gin.Context) {
	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	orderItems := make([]models.OrderItem, len(req.Items))
	for i, itemReq := range req.Items {
		orderItems[i] = models.OrderItem{
			ProductID:   itemReq.ProductID,
			TechCardID:  itemReq.TechCardID,
			Quantity:    itemReq.Quantity,
			GuestNumber: itemReq.GuestNumber,
			ClientID:    itemReq.ClientID,
		}
	}

	// Получаем userID из Gin context и добавляем в context.Context
	ctx := c.Request.Context()
	if userIDStr, exists := c.Get("user_id"); exists {
		if userIDString, ok := userIDStr.(string); ok {
			// Парсим UUID
			if userID, err := uuid.Parse(userIDString); err == nil {
				ctx = context.WithValue(ctx, "userID", userID)
			}
		}
	}

	var order *models.Order
	if req.TotalAmount != nil {
		order, err = h.usecase.CreateOrder(
			ctx,
			estID,
			req.TableID,
			req.ClientID,
			orderItems,
			req.SelectedPromotionID,
			req.RedeemLoyaltyPoints,
			req.ManualDiscountPercentage,
			*req.TotalAmount,
		)
	} else {
		order, err = h.usecase.CreateOrder(
			ctx,
			estID,
			req.TableID,
			req.ClientID,
			orderItems,
			req.SelectedPromotionID,
			req.RedeemLoyaltyPoints,
			req.ManualDiscountPercentage,
		)
	}
	if err != nil {
		h.logger.Error("Failed to create order", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать заказ"})
		return
	}

	// Обновляем guests_count если предоставлено
	if req.GuestsCount != nil && *req.GuestsCount > 0 && order != nil {
		// Это только для информационных целей, основной расчет в usecase
		guestsCount := *req.GuestsCount
		h.logger.Info("Order created with guests count", zap.Int("guests_count", guestsCount))
	}

	c.JSON(http.StatusCreated, order)
}

// Update обновляет заказ
// @Summary Обновить заказ
// @Description Обновляет данные заказа
// @Tags orders
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID заказа"
// @Param request body object true "Данные для обновления"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /orders/{id} [put]
func (h *OrderHandler) Update(c *gin.Context) {
	orderIDStr := c.Param("order_id")
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID заказа"})
		return
	}

	var req models.Order
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := h.usecase.UpdateOrder(c.Request.Context(), orderID, req)
	if err != nil {
		h.logger.Error("Failed to update order", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order"})
		return
	}

	c.JSON(http.StatusOK, order)
}

// AddOrderItem добавляет позицию в существующий заказ
// @Summary Добавить позицию в заказ
// @Description Добавляет новую позицию в существующий заказ
// @Tags orders
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID заказа"
// @Param request body AddOrderItemRequest true "Данные позиции заказа"
// @Success 200 {object} models.Order
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /orders/{id}/items [post]
func (h *OrderHandler) AddOrderItem(c *gin.Context) {
	orderIDStr := c.Param("order_id")
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID заказа"})
		return
	}

	var req AddOrderItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	orderItem := models.OrderItem{
		ProductID:   req.ProductID,
		TechCardID:  req.TechCardID,
		Quantity:    req.Quantity,
		GuestNumber: req.GuestNumber,
	}

	order, err := h.usecase.AddOrderItem(c.Request.Context(), orderID, orderItem)
	if err != nil {
		h.logger.Error("Failed to add order item", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось добавить позицию в заказ"})
		return
	}

	c.JSON(http.StatusOK, order)
}

// UpdateOrderItemQuantity обновляет количество позиции в заказе
// @Summary Обновить количество позиции в заказе
// @Description Обновляет количество указанной позиции в заказе
// @Tags orders
// @Accept json
// @Produce json
// @Security Bearer
// @Param order_id path string true "ID заказа"
// @Param item_id path string true "ID позиции заказа"
// @Param request body UpdateOrderItemQuantityRequest true "Новое количество"
// @Success 200 {object} models.Order
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /orders/{order_id}/items/{item_id} [put]
func (h *OrderHandler) UpdateOrderItemQuantity(c *gin.Context) {
	orderIDStr := c.Param("order_id")
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID заказа"})
		return
	}

	itemIDStr := c.Param("item_id")
	itemID, err := uuid.Parse(itemIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID позиции заказа"})
		return
	}

	var req UpdateOrderItemQuantityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := h.usecase.UpdateOrderItemQuantity(c.Request.Context(), orderID, itemID, req.Quantity)
	if err != nil {
		h.logger.Error("Failed to update order item quantity", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить количество позиции в заказе"})
		return
	}

	c.JSON(http.StatusOK, order)
}

// ProcessOrderPayment обрабатывает оплату заказа
// @Summary Обработать оплату заказа
// @Description Обрабатывает оплату заказа наличными, картой или комбинированно, рассчитывает сдачу.
// @Tags orders
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID заказа"
// @Param request body ProcessPaymentRequest true "Данные для оплаты"
// @Success 200 {object} models.Order
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /orders/{id}/pay [post]
func (h *OrderHandler) ProcessOrderPayment(c *gin.Context) {
	orderIDStr := c.Param("order_id")
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID заказа"})
		return
	}

	var req ProcessPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := h.usecase.ProcessOrderPayment(c.Request.Context(), orderID, req.CashAmount, req.CardAmount, req.ClientCash)
	if err != nil {
		h.logger.Error("Failed to process order payment", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обработать платеж по заказу"})
		return
	}

	c.JSON(http.StatusOK, order)
}

// CloseOrderWithoutPayment закрывает заказ без оплаты
// @Summary Закрыть заказ без оплаты
// @Description Закрывает заказ без получения оплаты, с указанием причины.
// @Tags orders
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID заказа"
// @Param request body CloseOrderWithoutPaymentRequest true "Причина закрытия без оплаты"
// @Success 200 {object} models.Order
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /orders/{id}/close-without-payment [post]
func (h *OrderHandler) CloseOrderWithoutPayment(c *gin.Context) {
	orderIDStr := c.Param("order_id")
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID заказа"})
		return
	}

	var req CloseOrderWithoutPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := h.usecase.CloseOrderWithoutPayment(c.Request.Context(), orderID, req.Reason)
	if err != nil {
		h.logger.Error("Failed to close order without payment", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось закрыть заказ без оплаты"})
		return
	}

	c.JSON(http.StatusOK, order)
}
