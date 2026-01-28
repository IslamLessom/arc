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

type WarehouseHandler struct {
	usecase *usecases.WarehouseUseCase
	logger  *zap.Logger
}

func NewWarehouseHandler(usecase *usecases.WarehouseUseCase, logger *zap.Logger) *WarehouseHandler {
	return &WarehouseHandler{
		usecase: usecase,
		logger:  logger,
	}
}

// ——— Warehouses CRUD ———

type CreateWarehouseRequest struct {
	Name    string `json:"name" binding:"required"`
	Address string `json:"address"`
}

type UpdateWarehouseRequest struct {
	Name    *string `json:"name,omitempty"`
	Address *string `json:"address,omitempty"`
	Active  *bool   `json:"active,omitempty"`
}

// ListWarehouses возвращает список складов
// @Summary Получить список складов
// @Description Возвращает список складов заведения
// @Tags warehouse
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /warehouses [get]
func (h *WarehouseHandler) ListWarehouses(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	list, err := h.usecase.ListWarehouses(c.Request.Context(), estID)
	if err != nil {
		h.logger.Error("Failed to list warehouses", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list warehouses"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// GetWarehouse возвращает склад по ID
// @Summary Получить склад по ID
// @Description Возвращает склад по ID
// @Tags warehouse
// @Produce json
// @Security Bearer
// @Param id path string true "ID склада"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /warehouses/{id} [get]
func (h *WarehouseHandler) GetWarehouse(c *gin.Context) {
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
	w, err := h.usecase.GetWarehouse(c.Request.Context(), id, estID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "warehouse not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": w})
}

// CreateWarehouse создает новый склад
// @Summary Создать склад
// @Description Создает новый склад
// @Tags warehouse
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateWarehouseRequest true "Данные склада"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /warehouses [post]
func (h *WarehouseHandler) CreateWarehouse(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	var req CreateWarehouseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	w := &models.Warehouse{Name: req.Name, Address: req.Address, Active: true}
	if err := h.usecase.CreateWarehouse(c.Request.Context(), w, estID); err != nil {
		h.logger.Error("Failed to create warehouse", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create warehouse"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": w})
}

// UpdateWarehouse обновляет склад
// @Summary Обновить склад
// @Description Обновляет данные склада
// @Tags warehouse
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID склада"
// @Param request body UpdateWarehouseRequest true "Данные для обновления"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /warehouses/{id} [put]
func (h *WarehouseHandler) UpdateWarehouse(c *gin.Context) {
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
	w, err := h.usecase.GetWarehouse(c.Request.Context(), id, estID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "warehouse not found"})
		return
	}
	var req UpdateWarehouseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Name != nil {
		w.Name = *req.Name
	}
	if req.Address != nil {
		w.Address = *req.Address
	}
	if req.Active != nil {
		w.Active = *req.Active
	}
	if err := h.usecase.UpdateWarehouse(c.Request.Context(), w, estID); err != nil {
		h.logger.Error("Failed to update warehouse", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update warehouse"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": w})
}

// DeleteWarehouse удаляет склад
// @Summary Удалить склад
// @Description Удаляет склад по ID
// @Tags warehouse
// @Produce json
// @Security Bearer
// @Param id path string true "ID склада"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /warehouses/{id} [delete]
func (h *WarehouseHandler) DeleteWarehouse(c *gin.Context) {
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
	if err := h.usecase.DeleteWarehouse(c.Request.Context(), id, estID); err != nil {
		h.logger.Error("Failed to delete warehouse", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete warehouse"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "warehouse deleted"})
}

// ——— Stock ———

// GetStock возвращает остатки на складе
// @Summary Получить остатки на складе
// @Description Возвращает остатки на складе с возможностью фильтрации
// @Tags warehouse
// @Produce json
// @Security Bearer
// @Param warehouse_id query string false "ID склада"
// @Param search query string false "Поиск"
// @Param type query string false "Тип (ingredient или product)"
// @Param category_id query string false "ID категории"
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /warehouse/stock [get]
func (h *WarehouseHandler) GetStock(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	filter := &repositories.StockFilter{}
	if s := c.Query("warehouse_id"); s != "" {
		if id, e := uuid.Parse(s); e == nil {
			filter.WarehouseID = &id
		}
	}
	if search := c.Query("search"); search != "" {
		filter.Search = &search
	}
	if itemType := c.Query("type"); itemType != "" {
		filter.Type = &itemType // "ingredient" или "product"
	}
	if categoryID := c.Query("category_id"); categoryID != "" {
		if id, e := uuid.Parse(categoryID); e == nil {
			filter.CategoryID = &id
		}
	}

	list, err := h.usecase.GetStock(c.Request.Context(), estID, filter)
	if err != nil {
		h.logger.Error("Failed to get stock", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get stock"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// UpdateStockLimit обновляет минимальный остаток
// @Summary Обновить минимальный остаток
// @Description Обновляет минимальный остаток для позиции на складе
// @Tags warehouse
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID остатка"
// @Param request body object true "Данные для обновления" SchemaExample({"limit": 10})
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /warehouse/stock/{id}/limit [put]
func (h *WarehouseHandler) UpdateStockLimit(c *gin.Context) {
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

	var req struct {
		Limit float64 `json:"limit" binding:"required,gte=0"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.usecase.UpdateStockLimit(c.Request.Context(), id, req.Limit, estID); err != nil {
		h.logger.Error("Failed to update stock limit", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "stock limit updated"})
}

// ——— Supply ———

type SupplyItemRequest struct {
	IngredientID *string  `json:"ingredient_id,omitempty" binding:"omitempty,uuid"`
	ProductID    *string  `json:"product_id,omitempty" binding:"omitempty,uuid"`
	Quantity     float64  `json:"quantity" binding:"required,gt=0"`
	Unit         string   `json:"unit" binding:"required"`
	PricePerUnit float64  `json:"price_per_unit"` // Цена за единицу измерения
	TotalAmount  float64  `json:"total_amount"`   // Общая сумма позиции
}

type CreateSupplyRequest struct {
	WarehouseID     string              `json:"warehouse_id" binding:"required,uuid"`     // Склад
	SupplierID      string              `json:"supplier_id" binding:"required,uuid"`      // Поставщик
	DeliveryDateTime string             `json:"delivery_date_time" binding:"required"`    // Дата и время поставки (RFC3339)
	Status          string              `json:"status"`                                    // pending, completed
	Comment         string              `json:"comment"`                                   // Комментарий
	Items           []SupplyItemRequest `json:"items" binding:"required,min=1"`
	// Поля для счета и оплаты
	InvoiceNumber   string  `json:"invoice_number"`                           // Номер счета от поставщика
	InvoiceDate     string  `json:"invoice_date"`                             // Дата счета (RFC3339)
	TotalAmount     float64 `json:"total_amount"`                             // Общая сумма по счету
	PaymentStatus   string  `json:"payment_status"`                           // none, pending, partial, paid
	PaymentDate     string  `json:"payment_date"`                             // Дата оплаты (RFC3339)
	PaymentAmount   float64 `json:"payment_amount"`                           // Сумма оплаты
	AccountID       string  `json:"account_id"`                               // Счет для оплаты (опционально, для создания транзакции)
}

type UpdateSupplyRequest struct {
	WarehouseID     *string              `json:"warehouse_id,omitempty" binding:"omitempty,uuid"`
	SupplierID      *string              `json:"supplier_id,omitempty" binding:"omitempty,uuid"`
	DeliveryDateTime *string             `json:"delivery_date_time,omitempty"`
	Status          *string              `json:"status,omitempty"`
	Comment         *string              `json:"comment,omitempty"`
	Items           []SupplyItemRequest  `json:"items,omitempty" binding:"omitempty,min=1"`
	// Поля для счета и оплаты
	InvoiceNumber   *string  `json:"invoice_number,omitempty"`
	InvoiceDate     *string  `json:"invoice_date,omitempty"`
	TotalAmount     *float64 `json:"total_amount,omitempty"`
	PaymentStatus   *string  `json:"payment_status,omitempty"`
	PaymentDate     *string  `json:"payment_date,omitempty"`
	PaymentAmount   *float64 `json:"payment_amount,omitempty"`
	AccountID       *string  `json:"account_id,omitempty" binding:"omitempty,uuid"`
}

// CreateSupply создает новую поставку
// @Summary Создать поставку
// @Description Создает новую поставку на склад
// @Tags warehouse
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateSupplyRequest true "Данные поставки"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /warehouse/supplies [post]
func (h *WarehouseHandler) CreateSupply(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	var req CreateSupplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	whID, _ := uuid.Parse(req.WarehouseID)
	supID, _ := uuid.Parse(req.SupplierID)
	status := req.Status
	if status == "" {
		status = "completed"
	}

	// Парсим дату и время поставки
	deliveryDateTime, err := time.Parse(time.RFC3339, req.DeliveryDateTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid delivery_date_time format, expected RFC3339"})
		return
	}

	items := make([]models.SupplyItem, 0, len(req.Items))
	for _, it := range req.Items {
		var ingID, prodID *uuid.UUID
		if it.IngredientID != nil && *it.IngredientID != "" {
			if id, e := uuid.Parse(*it.IngredientID); e == nil {
				ingID = &id
			}
		}
		if it.ProductID != nil && *it.ProductID != "" {
			if id, e := uuid.Parse(*it.ProductID); e == nil {
				prodID = &id
			}
		}
		if ingID == nil && prodID == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "each item must have ingredient_id or product_id"})
			return
		}
		// Если передан только total_amount, вычисляем price_per_unit
		// Если передан только price_per_unit, вычисляем total_amount
		pricePerUnit := it.PricePerUnit
		totalAmount := it.TotalAmount
		if pricePerUnit == 0 && totalAmount > 0 && it.Quantity > 0 {
			pricePerUnit = totalAmount / it.Quantity
		} else if totalAmount == 0 && pricePerUnit > 0 && it.Quantity > 0 {
			totalAmount = pricePerUnit * it.Quantity
		}

		item := models.SupplyItem{
			ID:            uuid.New(), // Явно генерируем UUID
			IngredientID: ingID,
			ProductID:   prodID,
			Quantity:    it.Quantity,
			Unit:        it.Unit,
			PricePerUnit: pricePerUnit,
			TotalAmount:  totalAmount,
		}
		items = append(items, item)
	}

	// Парсим опциональные даты
	var invoiceDate, paymentDate *time.Time
	if req.InvoiceDate != "" {
		if t, err := time.Parse(time.RFC3339, req.InvoiceDate); err == nil {
			invoiceDate = &t
		}
	}
	if req.PaymentDate != "" {
		if t, err := time.Parse(time.RFC3339, req.PaymentDate); err == nil {
			paymentDate = &t
		}
	}

	var accountID *uuid.UUID
	if req.AccountID != "" {
		if id, err := uuid.Parse(req.AccountID); err == nil {
			accountID = &id
		}
	}

	paymentStatus := req.PaymentStatus
	if paymentStatus == "" {
		paymentStatus = "none"
	}

	supply := &models.Supply{
		WarehouseID:     whID,
		SupplierID:      supID,
		DeliveryDateTime: deliveryDateTime,
		Status:          status,
		Comment:         req.Comment,
		Items:           items,
		InvoiceNumber:   req.InvoiceNumber,
		InvoiceDate:     invoiceDate,
		TotalAmount:     req.TotalAmount,
		PaymentStatus:   paymentStatus,
		PaymentDate:     paymentDate,
		PaymentAmount:   req.PaymentAmount,
		AccountID:       accountID,
	}
	if err := h.usecase.CreateSupply(c.Request.Context(), supply, estID); err != nil {
		h.logger.Error("Failed to create supply", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": supply})
}

// UpdateSupply обновляет поставку
// @Summary Обновить поставку
// @Description Обновляет данные поставки
// @Tags warehouse
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID поставки"
// @Param request body UpdateSupplyRequest true "Данные для обновления"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /warehouse/supplies/{id} [put]
func (h *WarehouseHandler) UpdateSupply(c *gin.Context) {
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

	// Получаем существующую поставку
	existingSupply, err := h.usecase.GetSupply(c.Request.Context(), id, estID)
	if err != nil || existingSupply == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "supply not found"})
		return
	}

	var req UpdateSupplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Обновляем поля поставки
	if req.WarehouseID != nil {
		existingSupply.WarehouseID, _ = uuid.Parse(*req.WarehouseID)
	}
	if req.SupplierID != nil {
		existingSupply.SupplierID, _ = uuid.Parse(*req.SupplierID)
	}
	if req.DeliveryDateTime != nil {
		deliveryDateTime, err := time.Parse(time.RFC3339, *req.DeliveryDateTime)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid delivery_date_time format, expected RFC3339"})
			return
		}
		existingSupply.DeliveryDateTime = deliveryDateTime
	}
	if req.Status != nil {
		existingSupply.Status = *req.Status
	}
	if req.Comment != nil {
		existingSupply.Comment = *req.Comment
	}
	if req.InvoiceNumber != nil {
		existingSupply.InvoiceNumber = *req.InvoiceNumber
	}
	if req.InvoiceDate != nil {
		if t, err := time.Parse(time.RFC3339, *req.InvoiceDate); err == nil {
			existingSupply.InvoiceDate = &t
		}
	}
	if req.TotalAmount != nil {
		existingSupply.TotalAmount = *req.TotalAmount
	}
	if req.PaymentStatus != nil {
		existingSupply.PaymentStatus = *req.PaymentStatus
	}
	if req.PaymentDate != nil {
		if t, err := time.Parse(time.RFC3339, *req.PaymentDate); err == nil {
			existingSupply.PaymentDate = &t
		}
	}
	if req.PaymentAmount != nil {
		existingSupply.PaymentAmount = *req.PaymentAmount
	}
	if req.AccountID != nil && *req.AccountID != "" {
		if id, err := uuid.Parse(*req.AccountID); err == nil {
			existingSupply.AccountID = &id
		}
	}

	// Обновляем items если они переданы
	if req.Items != nil {
		items := make([]models.SupplyItem, 0, len(req.Items))
		for _, it := range req.Items {
			var ingID, prodID *uuid.UUID
			if it.IngredientID != nil && *it.IngredientID != "" {
				if id, e := uuid.Parse(*it.IngredientID); e == nil {
					ingID = &id
				}
			}
			if it.ProductID != nil && *it.ProductID != "" {
				if id, e := uuid.Parse(*it.ProductID); e == nil {
					prodID = &id
				}
			}
			if ingID == nil && prodID == nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "each item must have ingredient_id or product_id"})
				return
			}

			pricePerUnit := it.PricePerUnit
			totalAmount := it.TotalAmount
			if pricePerUnit == 0 && totalAmount > 0 && it.Quantity > 0 {
				pricePerUnit = totalAmount / it.Quantity
			} else if totalAmount == 0 && pricePerUnit > 0 && it.Quantity > 0 {
				totalAmount = pricePerUnit * it.Quantity
			}

			item := models.SupplyItem{
				ID:            uuid.New(),
				IngredientID: ingID,
				ProductID:   prodID,
				Quantity:    it.Quantity,
				Unit:        it.Unit,
				PricePerUnit: pricePerUnit,
				TotalAmount:  totalAmount,
			}
			items = append(items, item)
		}
		existingSupply.Items = items
	}

	if err := h.usecase.UpdateSupply(c.Request.Context(), existingSupply, estID); err != nil {
		h.logger.Error("Failed to update supply", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": existingSupply})
}

// ——— WriteOff ———

// WriteOffItemRequest представляет позицию списания
type WriteOffItemRequest struct {
	IngredientID *string `json:"ingredient_id,omitempty" binding:"omitempty,uuid" example:"550e8400-e29b-41d4-a716-446655440001"` // ID ингредиента (обязательно, если не указан product_id)
	ProductID    *string `json:"product_id,omitempty" binding:"omitempty,uuid" example:"550e8400-e29b-41d4-a716-446655440002"`        // ID товара (обязательно, если не указан ingredient_id)
	Quantity     float64 `json:"quantity" binding:"required,gt=0" example:"10"`                                                    // Количество для списания
	Unit         string  `json:"unit" binding:"required" example:"кг"`                                                              // Единица измерения
	Details      string  `json:"details" example:"Детали списания"`                                                                  // Детали списания
}

// CreateWriteOffRequest представляет запрос на создание списания
type CreateWriteOffRequest struct {
	WarehouseID      string               `json:"warehouse_id" binding:"required,uuid" example:"550e8400-e29b-41d4-a716-446655440000"` // ID склада
	WriteOffDateTime string               `json:"write_off_date_time" binding:"required" example:"2026-01-18T17:18:00Z"`              // Дата и время списания в формате RFC3339
	Reason           string               `json:"reason" example:"Без причины"`                                                      // Причина списания
	Comment          string               `json:"comment" example:"Комментарий к списанию"`                                          // Комментарий
	Items            []WriteOffItemRequest `json:"items" binding:"required,min=1"`                                                    // Список позиций для списания (минимум 1)
}

// CreateWriteOff создает списание со склада
// @Summary Создать списание
// @Description Создает списание товаров/ингредиентов со склада. При создании списания автоматически уменьшаются остатки на складе. Каждая позиция списания должна иметь либо ingredient_id, либо product_id.
// @Tags warehouse
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateWriteOffRequest true "Данные списания" SchemaExample({"warehouse_id": "550e8400-e29b-41d4-a716-446655440000", "write_off_date_time": "2026-01-18T17:18:00Z", "reason": "Без причины", "comment": "Комментарий к списанию", "items": [{"ingredient_id": "550e8400-e29b-41d4-a716-446655440001", "quantity": 10, "unit": "кг", "details": "Детали списания"}]})
// @Success 201 {object} map[string]interface{} "Созданное списание"
// @Failure 400 {object} map[string]string "Ошибка валидации данных"
// @Failure 403 {object} map[string]string "Доступ запрещен"
// @Failure 500 {object} map[string]string "Внутренняя ошибка сервера"
// @Router /warehouse/write-offs [post]
func (h *WarehouseHandler) CreateWriteOff(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	var req CreateWriteOffRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	whID, _ := uuid.Parse(req.WarehouseID)

	// Парсим дату и время списания
	writeOffDateTime, err := time.Parse(time.RFC3339, req.WriteOffDateTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid write_off_date_time format, expected RFC3339"})
		return
	}

	items := make([]models.WriteOffItem, 0, len(req.Items))
	for _, it := range req.Items {
		var ingID, prodID *uuid.UUID
		if it.IngredientID != nil && *it.IngredientID != "" {
			if id, e := uuid.Parse(*it.IngredientID); e == nil {
				ingID = &id
			}
		}
		if it.ProductID != nil && *it.ProductID != "" {
			if id, e := uuid.Parse(*it.ProductID); e == nil {
				prodID = &id
			}
		}
		if ingID == nil && prodID == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "each item must have ingredient_id or product_id"})
			return
		}
		item := models.WriteOffItem{
			ID:           uuid.New(), // Явно генерируем UUID
			IngredientID: ingID,
			ProductID:   prodID,
			Quantity:    it.Quantity,
			Unit:        it.Unit,
			Details:     it.Details,
		}
		items = append(items, item)
	}

	wo := &models.WriteOff{
		WarehouseID:     whID,
		WriteOffDateTime: writeOffDateTime,
		Reason:          req.Reason,
		Comment:         req.Comment,
		Items:           items,
	}
	if err := h.usecase.CreateWriteOff(c.Request.Context(), wo, estID); err != nil {
		h.logger.Error("Failed to create write-off", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": wo})
}

// ListWriteOffs возвращает список списаний
// @Summary Получить список списаний
// @Description Возвращает список списаний с возможностью фильтрации по складу
// @Tags warehouse
// @Produce json
// @Security Bearer
// @Param warehouse_id query string false "ID склада"
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /warehouse/write-offs [get]
func (h *WarehouseHandler) ListWriteOffs(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var warehouseID *uuid.UUID
	if s := c.Query("warehouse_id"); s != "" {
		if id, e := uuid.Parse(s); e == nil {
			warehouseID = &id
		}
	}

	list, err := h.usecase.GetWriteOffs(c.Request.Context(), estID, warehouseID)
	if err != nil {
		h.logger.Error("Failed to list write-offs", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list write-offs"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// GetWriteOff возвращает списание по ID
// @Summary Получить списание по ID
// @Description Возвращает списание по ID
// @Tags warehouse
// @Produce json
// @Security Bearer
// @Param id path string true "ID списания"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /warehouse/write-offs/{id} [get]
func (h *WarehouseHandler) GetWriteOff(c *gin.Context) {
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
	wo, err := h.usecase.GetWriteOff(c.Request.Context(), id, estID)
	if err != nil {
		h.logger.Error("Failed to get write-off", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get write-off"})
		return
	}
	if wo == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "write-off not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": wo})
}

// ListSupplies возвращает список всех поставок
// @Summary Получить список поставок
// @Description Возвращает список всех поставок заведения, опционально фильтруя по складу
// @Tags warehouse
// @Produce json
// @Security Bearer
// @Param warehouse_id query string false "ID склада"
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /warehouse/supplies [get]
func (h *WarehouseHandler) ListSupplies(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var warehouseID *uuid.UUID
	if whID := c.Query("warehouse_id"); whID != "" {
		if id, e := uuid.Parse(whID); e == nil {
			warehouseID = &id
		}
	}

	supplies, err := h.usecase.GetSupplies(c.Request.Context(), estID, warehouseID)
	if err != nil {
		h.logger.Error("Failed to list supplies", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": supplies})
}

// GetSupply возвращает поставку по ID
// @Summary Получить поставку по ID
// @Description Возвращает поставку по ID
// @Tags warehouse
// @Produce json
// @Security Bearer
// @Param id path string true "ID поставки"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /warehouse/supplies/{id} [get]
func (h *WarehouseHandler) GetSupply(c *gin.Context) {
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
	supply, err := h.usecase.GetSupply(c.Request.Context(), id, estID)
	if err != nil {
		h.logger.Error("Failed to get supply", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get supply"})
		return
	}
	if supply == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "supply not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": supply})
}

// GetSuppliesByItem возвращает поставки по ингредиенту или товару
// @Summary Получить поставки по позиции
// @Description Возвращает список поставок по ингредиенту или товару
// @Tags warehouse
// @Produce json
// @Security Bearer
// @Param ingredient_id query string false "ID ингредиента"
// @Param product_id query string false "ID товара"
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /warehouse/supplies/by-item [get]
func (h *WarehouseHandler) GetSuppliesByItem(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var ingredientID, productID *uuid.UUID
	if ingID := c.Query("ingredient_id"); ingID != "" {
		if id, e := uuid.Parse(ingID); e == nil {
			ingredientID = &id
		}
	}
	if prodID := c.Query("product_id"); prodID != "" {
		if id, e := uuid.Parse(prodID); e == nil {
			productID = &id
		}
	}

	supplies, err := h.usecase.GetSuppliesByIngredientOrProduct(c.Request.Context(), estID, ingredientID, productID)
	if err != nil {
		h.logger.Error("Failed to get supplies by item", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": supplies})
}

// GetMovements возвращает движения по складу
// @Summary Получить движения по складу
// @Description Возвращает историю движений по складу
// @Tags warehouse
// @Produce json
// @Security Bearer
// @Param warehouse_id query string false "ID склада"
// @Param start_date query string false "Начальная дата"
// @Param end_date query string false "Конечная дата"
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /warehouse/movements [get]
func (h *WarehouseHandler) GetMovements(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	var warehouseID *uuid.UUID
	if s := c.Query("warehouse_id"); s != "" {
		if id, e := uuid.Parse(s); e == nil {
			warehouseID = &id
		}
	}
	list, err := h.usecase.GetMovements(c.Request.Context(), estID, warehouseID)
	if err != nil {
		h.logger.Error("Failed to get movements", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get movements"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// ——— Suppliers ———

type CreateSupplierRequest struct {
	Name           string `json:"name" binding:"required"`           // Имя
	TaxpayerNumber string `json:"taxpayer_number"`                   // Номер налогоплательщика
	Phone          string `json:"phone"`                             // Телефон
	Address        string `json:"address"`                           // Адрес
	Comment        string `json:"comment"`                           // Комментарий
	Contact        string `json:"contact"`                           // Контактное лицо (опционально)
	Email          string `json:"email"`                             // Email (опционально)
}

type UpdateSupplierRequest struct {
	Name           *string `json:"name,omitempty"`
	TaxpayerNumber *string `json:"taxpayer_number,omitempty"`
	Phone          *string `json:"phone,omitempty"`
	Address        *string `json:"address,omitempty"`
	Comment        *string `json:"comment,omitempty"`
	Contact        *string `json:"contact,omitempty"`
	Email          *string `json:"email,omitempty"`
	Active         *bool   `json:"active,omitempty"`
}

// ListSuppliers возвращает список поставщиков
// @Summary Получить список поставщиков
// @Description Возвращает список поставщиков заведения
// @Tags warehouse
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /warehouse/suppliers [get]
func (h *WarehouseHandler) ListSuppliers(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	filter := &repositories.SupplierFilter{EstablishmentID: &estID}
	if s := c.Query("search"); s != "" {
		filter.Search = &s
	}
	if a := c.Query("active"); a != "" {
		active := a == "true"
		filter.Active = &active
	}
	list, err := h.usecase.ListSuppliers(c.Request.Context(), filter)
	if err != nil {
		h.logger.Error("Failed to list suppliers", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list suppliers"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// GetSupplier возвращает поставщика по ID
// @Summary Получить поставщика по ID
// @Description Возвращает поставщика по ID
// @Tags warehouse
// @Produce json
// @Security Bearer
// @Param id path string true "ID поставщика"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /warehouse/suppliers/{id} [get]
func (h *WarehouseHandler) GetSupplier(c *gin.Context) {
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
	s, err := h.usecase.GetSupplier(c.Request.Context(), id, estID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "supplier not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": s})
}

// CreateSupplier создает нового поставщика
// @Summary Создать поставщика
// @Description Создает нового поставщика
// @Tags warehouse
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateSupplierRequest true "Данные поставщика"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /warehouse/suppliers [post]
func (h *WarehouseHandler) CreateSupplier(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	var req CreateSupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	s := &models.Supplier{
		Name:           req.Name,
		TaxpayerNumber: req.TaxpayerNumber,
		Phone:          req.Phone,
		Address:        req.Address,
		Comment:        req.Comment,
		Contact:        req.Contact,
		Email:          req.Email,
		Active:         true,
	}
	if err := h.usecase.CreateSupplier(c.Request.Context(), s, estID); err != nil {
		h.logger.Error("Failed to create supplier", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create supplier"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": s})
}

// UpdateSupplier обновляет поставщика
// @Summary Обновить поставщика
// @Description Обновляет данные поставщика
// @Tags warehouse
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID поставщика"
// @Param request body UpdateSupplierRequest true "Данные для обновления"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /warehouse/suppliers/{id} [put]
func (h *WarehouseHandler) UpdateSupplier(c *gin.Context) {
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
	s, err := h.usecase.GetSupplier(c.Request.Context(), id, estID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "supplier not found"})
		return
	}
	var req UpdateSupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Name != nil {
		s.Name = *req.Name
	}
	if req.TaxpayerNumber != nil {
		s.TaxpayerNumber = *req.TaxpayerNumber
	}
	if req.Phone != nil {
		s.Phone = *req.Phone
	}
	if req.Address != nil {
		s.Address = *req.Address
	}
	if req.Comment != nil {
		s.Comment = *req.Comment
	}
	if req.Contact != nil {
		s.Contact = *req.Contact
	}
	if req.Email != nil {
		s.Email = *req.Email
	}
	if req.Active != nil {
		s.Active = *req.Active
	}
	if err := h.usecase.UpdateSupplier(c.Request.Context(), s, estID); err != nil {
		h.logger.Error("Failed to update supplier", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update supplier"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": s})
}

// DeleteSupplier удаляет поставщика
// @Summary Удалить поставщика
// @Description Удаляет поставщика по ID
// @Tags warehouse
// @Produce json
// @Security Bearer
// @Param id path string true "ID поставщика"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /warehouse/suppliers/{id} [delete]
func (h *WarehouseHandler) DeleteSupplier(c *gin.Context) {
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
	if err := h.usecase.DeleteSupplier(c.Request.Context(), id, estID); err != nil {
		h.logger.Error("Failed to delete supplier", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete supplier"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "supplier deleted"})
}
