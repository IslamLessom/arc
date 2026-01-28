package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
	"github.com/yourusername/arc/backend/internal/usecases"
)

// getEstablishmentID берёт establishment_id из контекста (устанавливается RequireEstablishment)
func getEstablishmentID(c *gin.Context) (uuid.UUID, error) {
	v, exists := c.Get("establishment_id")
	if !exists || v == nil {
		return uuid.Nil, errors.New("establishment_id not in context")
	}
	if id, ok := v.(uuid.UUID); ok {
		return id, nil
	}
	return uuid.Nil, errors.New("invalid establishment_id type")
}

type MenuHandler struct {
	usecase *usecases.MenuUseCase
	logger  *zap.Logger
}

func NewMenuHandler(usecase *usecases.MenuUseCase, logger *zap.Logger) *MenuHandler {
	return &MenuHandler{
		usecase: usecase,
		logger:  logger,
	}
}

type CreateProductRequest struct {
	Name              string  `json:"name" binding:"required"`
	CategoryID        string  `json:"category_id" binding:"required,uuid"`        // UUID как строка
	WorkshopID        *string `json:"workshop_id,omitempty" binding:"omitempty,uuid"` // UUID как строка
	Description       string  `json:"description"`
	CoverImage        string  `json:"cover_image"`
	IsWeighted        bool    `json:"is_weighted"`
	ExcludeFromDiscounts bool `json:"exclude_from_discounts"`
	HasModifications  bool    `json:"has_modifications"`
	Barcode           string  `json:"barcode"`
	CostPrice         float64 `json:"cost_price"`
	Markup            float64 `json:"markup"`
	Price             float64 `json:"price,omitempty"` // Можно задать напрямую, иначе вычисляется
	WarehouseID       string  `json:"warehouse_id" binding:"required,uuid"` // UUID склада для создания остатков
}

type UpdateProductRequest struct {
	Name              string  `json:"name"`
	CategoryID        *string `json:"category_id,omitempty" binding:"omitempty,uuid"`
	WorkshopID        *string `json:"workshop_id,omitempty" binding:"omitempty,uuid"`
	Description       string  `json:"description"`
	CoverImage        *string `json:"cover_image,omitempty"`
	IsWeighted        bool    `json:"is_weighted"`
	ExcludeFromDiscounts bool `json:"exclude_from_discounts"`
	HasModifications  bool    `json:"has_modifications"`
	Barcode           string  `json:"barcode"`
	CostPrice         float64 `json:"cost_price"`
	Markup            float64 `json:"markup"`
	Price             float64 `json:"price,omitempty"`
	Active            *bool   `json:"active,omitempty"`
}

// GetProducts возвращает список товаров с фильтрацией
// @Summary Получить список товаров
// @Description Возвращает список товаров с возможностью фильтрации по категории, цеху, поиску и активности
// @Tags menu
// @Produce json
// @Security Bearer
// @Param category_id query string false "ID категории"
// @Param workshop_id query string false "ID цеха"
// @Param search query string false "Поиск по названию"
// @Param active query bool false "Фильтр по активности"
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/products [get]
func (h *MenuHandler) GetProducts(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	filter := &repositories.ProductFilter{EstablishmentID: &estID}
	if categoryID := c.Query("category_id"); categoryID != "" {
		if id, err := uuid.Parse(categoryID); err == nil {
			filter.CategoryID = &id
		}
	}
	if workshopID := c.Query("workshop_id"); workshopID != "" {
		if id, err := uuid.Parse(workshopID); err == nil {
			filter.WorkshopID = &id
		}
	}
	if search := c.Query("search"); search != "" {
		filter.Search = &search
	}
	if active := c.Query("active"); active != "" {
		activeBool := active == "true"
		filter.Active = &activeBool
	}

	products, err := h.usecase.GetProducts(c.Request.Context(), filter)
	if err != nil {
		h.logger.Error("Failed to get products", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get products"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": products})
}

// ListProductsByCategory возвращает список товаров по заданной категории
// @Summary Получить список товаров по категории
// @Description Возвращает список товаров, принадлежащих указанной категории.
// @Tags menu
// @Produce json
// @Security Bearer
// @Param category_id path string true "ID категории"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/categories/{category_id}/products [get]
func (h *MenuHandler) ListProductsByCategory(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	categoryIDStr := c.Param("category_id")
	categoryID, err := uuid.Parse(categoryIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID категории"})
		return
	}

	filter := &repositories.ProductFilter{EstablishmentID: &estID, CategoryID: &categoryID}
	products, err := h.usecase.GetProducts(c.Request.Context(), filter)
	if err != nil {
		h.logger.Error("Failed to get products by category", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить товары по категории"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": products})
}

// GetProduct возвращает товар по ID
// @Summary Получить товар по ID
// @Description Возвращает товар по ID
// @Tags menu
// @Produce json
// @Security Bearer
// @Param id path string true "ID товара"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/products/{id} [get]
func (h *MenuHandler) GetProduct(c *gin.Context) {
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

	product, err := h.usecase.GetProductByID(c.Request.Context(), id, estID)
	if err != nil {
		h.logger.Error("Failed to get product", zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": product})
}

// CreateProduct создает новый товар
// @Summary Создать товар
// @Description Создает новый товар и автоматически создает остатки на складе. Поле cover_image принимает URL изображения, полученный через POST /api/v1/upload/image или POST /api/v1/upload/image/base64
// @Tags menu
// @Accept json
// @Produce json
// @Security Bearer
// @Param product body CreateProductRequest true "Данные товара" SchemaExample({"name": "Пицца Маргарита", "category_id": "uuid", "description": "Классическая пицца", "cover_image": "http://localhost:9000/arc-images/images/uuid.jpg", "is_weighted": false, "cost_price": 150.0, "markup": 50.0, "warehouse_id": "uuid"})
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/products [post]
func (h *MenuHandler) CreateProduct(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	categoryID, err := uuid.Parse(req.CategoryID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category_id"})
		return
	}

	var workshopID *uuid.UUID
	if req.WorkshopID != nil {
		parsed, err := uuid.Parse(*req.WorkshopID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid workshop_id"})
			return
		}
		workshopID = &parsed
	}

	warehouseID, err := uuid.Parse(req.WarehouseID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid warehouse_id"})
		return
	}

	product := &models.Product{
		Name:                req.Name,
		CategoryID:          categoryID,
		WorkshopID:          workshopID,
		Description:         req.Description,
		CoverImage:          req.CoverImage,
		IsWeighted:          req.IsWeighted,
		ExcludeFromDiscounts: req.ExcludeFromDiscounts,
		HasModifications:    req.HasModifications,
		Barcode:             req.Barcode,
		CostPrice:           req.CostPrice,
		Markup:              req.Markup,
		Active:              true,
	}

	// Если цена задана напрямую, используем её, иначе будет вычислена в use case
	if req.Price > 0 {
		product.Price = req.Price
	}

	if err := h.usecase.CreateProduct(c.Request.Context(), product, warehouseID, estID); err != nil {
		h.logger.Error("Failed to create product", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create product"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": product})
}

// UpdateProduct обновляет товар
// @Summary Обновить товар
// @Description Обновляет данные товара. Поле cover_image принимает URL изображения, полученный через POST /api/v1/upload/image или POST /api/v1/upload/image/base64
// @Tags menu
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID товара"
// @Param product body UpdateProductRequest true "Данные для обновления"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/products/{id} [put]
func (h *MenuHandler) UpdateProduct(c *gin.Context) {
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

	var req UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product, err := h.usecase.GetProductByID(c.Request.Context(), id, estID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}

	// Обновляем поля
	if req.Name != "" {
		product.Name = req.Name
	}
	if req.CategoryID != nil {
		categoryID, err := uuid.Parse(*req.CategoryID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category_id"})
			return
		}
		product.CategoryID = categoryID
	}
	if req.WorkshopID != nil {
		workshopID, err := uuid.Parse(*req.WorkshopID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid workshop_id"})
			return
		}
		product.WorkshopID = &workshopID
	}
	product.Description = req.Description
	if req.CoverImage != nil {
		product.CoverImage = *req.CoverImage
	}
	product.IsWeighted = req.IsWeighted
	product.ExcludeFromDiscounts = req.ExcludeFromDiscounts
	product.HasModifications = req.HasModifications
	product.Barcode = req.Barcode
	product.CostPrice = req.CostPrice
	product.Markup = req.Markup
	if req.Price > 0 {
		product.Price = req.Price
	}
	if req.Active != nil {
		product.Active = *req.Active
	}

	if err := h.usecase.UpdateProduct(c.Request.Context(), product); err != nil {
		h.logger.Error("Failed to update product", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": product})
}

// DeleteProduct удаляет товар
// @Summary Удалить товар
// @Description Удаляет товар по ID
// @Tags menu
// @Produce json
// @Security Bearer
// @Param id path string true "ID товара"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/products/{id} [delete]
func (h *MenuHandler) DeleteProduct(c *gin.Context) {
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

	if err := h.usecase.DeleteProduct(c.Request.Context(), id, estID); err != nil {
		h.logger.Error("Failed to delete product", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "product deleted"})
}

type CreateTechCardRequest struct {
	Name              string                        `json:"name" binding:"required"`
	CategoryID        string                        `json:"category_id" binding:"required,uuid"`
	WorkshopID        *string                       `json:"workshop_id,omitempty" binding:"omitempty,uuid"`
	Description       string                        `json:"description"`
	CoverImage        string                        `json:"cover_image"`
	IsWeighted        bool                          `json:"is_weighted"`
	ExcludeFromDiscounts bool                       `json:"exclude_from_discounts"`
	CostPrice         float64                       `json:"cost_price"`
	Markup            float64                       `json:"markup"`
	Price             float64                       `json:"price,omitempty"`
	WarehouseID       *string                       `json:"warehouse_id,omitempty" binding:"omitempty,uuid"` // Для расчета себестоимости
	Ingredients       []TechCardIngredientRequest   `json:"ingredients,omitempty"`
	ModifierSets      []ModifierSetRequest          `json:"modifier_sets,omitempty"`
}

type TechCardIngredientRequest struct {
	IngredientID string  `json:"ingredient_id" binding:"required,uuid"`
	Quantity     float64 `json:"quantity" binding:"required"`
	Unit         string  `json:"unit" binding:"required"` // кг, л, шт и т.д.
}

type ModifierSetRequest struct {
	Name          string                 `json:"name" binding:"required"`
	SelectionType string                 `json:"selection_type" binding:"required,oneof=single multiple"` // "single" или "multiple"
	MinSelection  int                    `json:"min_selection"` // Минимальное количество выбора (для multiple)
	MaxSelection  int                    `json:"max_selection"` // Максимальное количество выбора (для multiple, 0 = без ограничений)
	Options       []ModifierOptionRequest `json:"options,omitempty"`
}

type ModifierOptionRequest struct {
	Name  string  `json:"name" binding:"required"`
	Price float64 `json:"price"`
}

type UpdateTechCardRequest struct {
	Name              string                        `json:"name"`
	CategoryID        *string                       `json:"category_id,omitempty" binding:"omitempty,uuid"`
	WorkshopID        *string                       `json:"workshop_id,omitempty" binding:"omitempty,uuid"`
	Description       string                        `json:"description"`
	CoverImage        *string                       `json:"cover_image,omitempty"`
	IsWeighted        bool                          `json:"is_weighted"`
	ExcludeFromDiscounts bool                       `json:"exclude_from_discounts"`
	CostPrice         float64                       `json:"cost_price"`
	Markup            float64                       `json:"markup"`
	Price             float64                       `json:"price,omitempty"`
	Active            *bool                         `json:"active,omitempty"`
	WarehouseID       *string                       `json:"warehouse_id,omitempty" binding:"omitempty,uuid"` // Для расчета себестоимости
	Ingredients       []TechCardIngredientRequest   `json:"ingredients,omitempty"`
	ModifierSets      []ModifierSetRequest          `json:"modifier_sets,omitempty"`
}

// GetTechCards возвращает список тех-карт
// @Summary Получить список тех-карт
// @Description Возвращает список тех-карт с фильтрацией
// @Tags menu
// @Produce json
// @Security Bearer
// @Param category_id query string false "ID категории"
// @Param workshop_id query string false "ID цеха"
// @Param search query string false "Поиск по названию"
// @Param active query bool false "Фильтр по активности"
// @Success 200 {object} map[string]interface{}
// @Router /menu/tech-cards [get]
func (h *MenuHandler) GetTechCards(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	filter := &repositories.TechCardFilter{EstablishmentID: &estID}
	if categoryID := c.Query("category_id"); categoryID != "" {
		if id, err := uuid.Parse(categoryID); err == nil {
			filter.CategoryID = &id
		}
	}
	if workshopID := c.Query("workshop_id"); workshopID != "" {
		if id, err := uuid.Parse(workshopID); err == nil {
			filter.WorkshopID = &id
		}
	}
	if search := c.Query("search"); search != "" {
		filter.Search = &search
	}
	if active := c.Query("active"); active != "" {
		activeBool := active == "true"
		filter.Active = &activeBool
	}

	techCards, err := h.usecase.GetTechCards(c.Request.Context(), filter)
	if err != nil {
		h.logger.Error("Failed to get tech cards", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get tech cards"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": techCards})
}

// ListTechCardsByCategory возвращает список тех-карт по заданной категории
// @Summary Получить список тех-карт по категории
// @Description Возвращает список тех-карт, принадлежащих указанной категории.
// @Tags menu
// @Produce json
// @Security Bearer
// @Param category_id path string true "ID категории"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/categories/{category_id}/tech-cards [get]
func (h *MenuHandler) ListTechCardsByCategory(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	categoryIDStr := c.Param("category_id")
	categoryID, err := uuid.Parse(categoryIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID категории"})
		return
	}

	filter := &repositories.TechCardFilter{EstablishmentID: &estID, CategoryID: &categoryID}
	techCards, err := h.usecase.GetTechCards(c.Request.Context(), filter)
	if err != nil {
		h.logger.Error("Failed to get tech cards by category", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить тех-карты по категории"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": techCards})
}

// GetTechCard возвращает тех-карту по ID
// @Summary Получить тех-карту по ID
// @Description Возвращает тех-карту по ID
// @Tags menu
// @Produce json
// @Security Bearer
// @Param id path string true "ID тех-карты"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/tech-cards/{id} [get]
func (h *MenuHandler) GetTechCard(c *gin.Context) {
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

	techCard, err := h.usecase.GetTechCardByID(c.Request.Context(), id, estID)
	if err != nil {
		h.logger.Error("Failed to get tech card", zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"error": "tech card not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": techCard})
}

// CreateTechCard создает новую тех-карту
// @Summary Создать тех-карту
// @Description Создает новую тех-карту. Поле cover_image принимает URL изображения, полученный через POST /api/v1/upload/image или POST /api/v1/upload/image/base64
// @Tags menu
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateTechCardRequest true "Данные тех-карты" SchemaExample({"name": "Тех-карта пиццы", "category_id": "uuid", "description": "Рецепт пиццы", "cover_image": "http://localhost:9000/arc-images/images/uuid.jpg", "is_weighted": false, "cost_price": 120.0, "markup": 40.0})
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/tech-cards [post]
func (h *MenuHandler) CreateTechCard(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var req CreateTechCardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	categoryID, err := uuid.Parse(req.CategoryID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category_id"})
		return
	}

	var workshopID *uuid.UUID
	if req.WorkshopID != nil {
		parsed, err := uuid.Parse(*req.WorkshopID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid workshop_id"})
			return
		}
		workshopID = &parsed
	}

	techCard := &models.TechCard{
		Name:                req.Name,
		CategoryID:          categoryID,
		WorkshopID:          workshopID,
		Description:         req.Description,
		CoverImage:          req.CoverImage,
		IsWeighted:          req.IsWeighted,
		ExcludeFromDiscounts: req.ExcludeFromDiscounts,
		CostPrice:           req.CostPrice,
		Markup:              req.Markup,
		Active:              true,
	}

	// Если цена задана напрямую, используем её, иначе будет вычислена в use case
	if req.Price > 0 {
		techCard.Price = req.Price
	}

	// Добавляем ингредиенты
	for _, ingReq := range req.Ingredients {
		ingredientID, err := uuid.Parse(ingReq.IngredientID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ingredient_id"})
			return
		}
		techCard.Ingredients = append(techCard.Ingredients, models.TechCardIngredient{
			IngredientID: ingredientID,
			Quantity:     ingReq.Quantity,
			Unit:         ingReq.Unit,
		})
	}

	// Добавляем наборы модификаторов
	for _, modSetReq := range req.ModifierSets {
		modifierSet := models.ModifierSet{
			Name:          modSetReq.Name,
			SelectionType: modSetReq.SelectionType,
			MinSelection:  modSetReq.MinSelection,
			MaxSelection:  modSetReq.MaxSelection,
		}
		// Добавляем опции модификаторов
		for _, optReq := range modSetReq.Options {
			modifierSet.Options = append(modifierSet.Options, models.ModifierOption{
				Name:  optReq.Name,
				Price: optReq.Price,
			})
		}
		techCard.ModifierSets = append(techCard.ModifierSets, modifierSet)
	}

	var warehouseID uuid.UUID
	if req.WarehouseID != nil {
		parsed, err := uuid.Parse(*req.WarehouseID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid warehouse_id"})
			return
		}
		warehouseID = parsed
	}

	if err := h.usecase.CreateTechCard(c.Request.Context(), techCard, warehouseID, estID); err != nil {
		h.logger.Error("Failed to create tech card", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create tech card"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": techCard})
}

// UpdateTechCard обновляет тех-карту
// @Summary Обновить тех-карту
// @Description Обновляет данные тех-карты. Поле cover_image принимает URL изображения, полученный через POST /api/v1/upload/image или POST /api/v1/upload/image/base64
// @Tags menu
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID тех-карты"
// @Param request body UpdateTechCardRequest true "Данные для обновления"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/tech-cards/{id} [put]
func (h *MenuHandler) UpdateTechCard(c *gin.Context) {
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

	var req UpdateTechCardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	techCard, err := h.usecase.GetTechCardByID(c.Request.Context(), id, estID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "tech card not found"})
		return
	}

	// Обновляем поля
	if req.Name != "" {
		techCard.Name = req.Name
	}
	if req.CategoryID != nil {
		categoryID, err := uuid.Parse(*req.CategoryID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category_id"})
			return
		}
		techCard.CategoryID = categoryID
	}
	if req.WorkshopID != nil {
		workshopID, err := uuid.Parse(*req.WorkshopID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid workshop_id"})
			return
		}
		techCard.WorkshopID = &workshopID
	}
	techCard.Description = req.Description
	if req.CoverImage != nil {
		techCard.CoverImage = *req.CoverImage
	}
	techCard.IsWeighted = req.IsWeighted
	techCard.ExcludeFromDiscounts = req.ExcludeFromDiscounts
	techCard.CostPrice = req.CostPrice
	techCard.Markup = req.Markup
	if req.Price > 0 {
		techCard.Price = req.Price
	}
	if req.Active != nil {
		techCard.Active = *req.Active
	}

	// Обновляем ингредиенты (заменяем полностью)
	if req.Ingredients != nil {
		techCard.Ingredients = []models.TechCardIngredient{}
		for _, ingReq := range req.Ingredients {
			ingredientID, err := uuid.Parse(ingReq.IngredientID)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ingredient_id"})
				return
			}
			techCard.Ingredients = append(techCard.Ingredients, models.TechCardIngredient{
				IngredientID: ingredientID,
				Quantity:     ingReq.Quantity,
				Unit:         ingReq.Unit,
			})
		}
	}

	// Обновляем наборы модификаторов (заменяем полностью)
	if req.ModifierSets != nil {
		techCard.ModifierSets = []models.ModifierSet{}
		for _, modSetReq := range req.ModifierSets {
			modifierSet := models.ModifierSet{
				Name:          modSetReq.Name,
				SelectionType: modSetReq.SelectionType,
				MinSelection:  modSetReq.MinSelection,
				MaxSelection:  modSetReq.MaxSelection,
			}
			// Добавляем опции модификаторов
			for _, optReq := range modSetReq.Options {
				modifierSet.Options = append(modifierSet.Options, models.ModifierOption{
					Name:  optReq.Name,
					Price: optReq.Price,
				})
			}
			techCard.ModifierSets = append(techCard.ModifierSets, modifierSet)
		}
	}

	var warehouseID uuid.UUID
	if req.WarehouseID != nil {
		parsed, err := uuid.Parse(*req.WarehouseID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid warehouse_id"})
			return
		}
		warehouseID = parsed
	}

	if err := h.usecase.UpdateTechCard(c.Request.Context(), techCard, warehouseID, estID); err != nil {
		h.logger.Error("Failed to update tech card", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update tech card"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": techCard})
}

// DeleteTechCard удаляет тех-карту
// @Summary Удалить тех-карту
// @Description Удаляет тех-карту по ID
// @Tags menu
// @Produce json
// @Security Bearer
// @Param id path string true "ID тех-карты"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/tech-cards/{id} [delete]
func (h *MenuHandler) DeleteTechCard(c *gin.Context) {
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

	if err := h.usecase.DeleteTechCard(c.Request.Context(), id, estID); err != nil {
		h.logger.Error("Failed to delete tech card", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete tech card"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "tech card deleted"})
}

type CreateIngredientRequest struct {
	Name          string  `json:"name" binding:"required"`
	CategoryID    string  `json:"category_id" binding:"required,uuid"`
	Unit          string  `json:"unit" binding:"required,oneof=шт л кг"`
	Barcode       string  `json:"barcode"`
	LossCleaning  float64 `json:"loss_cleaning"`
	LossBoiling   float64 `json:"loss_boiling"`
	LossFrying    float64 `json:"loss_frying"`
	LossStewing   float64 `json:"loss_stewing"`
	LossBaking    float64 `json:"loss_baking"`
	// Складской учет (опционально)
	WarehouseID   *string `json:"warehouse_id,omitempty" binding:"omitempty,uuid"`
	Quantity      float64 `json:"quantity"` // Количество в наличии
	PricePerUnit  float64 `json:"price_per_unit"` // Цена за единицу измерения
}

type UpdateIngredientRequest struct {
	Name          string  `json:"name"`
	CategoryID    *string `json:"category_id,omitempty" binding:"omitempty,uuid"`
	Unit          string  `json:"unit" binding:"omitempty,oneof=шт л кг"`
	Barcode       string  `json:"barcode"`
	LossCleaning  float64 `json:"loss_cleaning"`
	LossBoiling   float64 `json:"loss_boiling"`
	LossFrying    float64 `json:"loss_frying"`
	LossStewing   float64 `json:"loss_stewing"`
	LossBaking    float64 `json:"loss_baking"`
	Active        *bool   `json:"active,omitempty"`
}

func (h *MenuHandler) GetIngredients(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	filter := &repositories.IngredientFilter{EstablishmentID: &estID}
	if categoryID := c.Query("category_id"); categoryID != "" {
		if id, err := uuid.Parse(categoryID); err == nil {
			filter.CategoryID = &id
		}
	}
	if unit := c.Query("unit"); unit != "" {
		filter.Unit = &unit
	}
	if search := c.Query("search"); search != "" {
		filter.Search = &search
	}
	if active := c.Query("active"); active != "" {
		activeBool := active == "true"
		filter.Active = &activeBool
	}

	ingredients, err := h.usecase.GetIngredients(c.Request.Context(), filter)
	if err != nil {
		h.logger.Error("Failed to get ingredients", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get ingredients"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": ingredients})
}

// GetIngredient возвращает ингредиент по ID
// @Summary Получить ингредиент по ID
// @Description Возвращает ингредиент по ID
// @Tags menu
// @Produce json
// @Security Bearer
// @Param id path string true "ID ингредиента"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/ingredients/{id} [get]
func (h *MenuHandler) GetIngredient(c *gin.Context) {
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

	ingredient, err := h.usecase.GetIngredientByID(c.Request.Context(), id, estID)
	if err != nil {
		h.logger.Error("Failed to get ingredient", zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"error": "ingredient not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": ingredient})
}

// CreateIngredient создает новый ингредиент
// @Summary Создать ингредиент
// @Description Создает новый ингредиент и автоматически создает остатки на складе
// @Tags menu
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateIngredientRequest true "Данные ингредиента"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/ingredients [post]
func (h *MenuHandler) CreateIngredient(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var req CreateIngredientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	categoryID, err := uuid.Parse(req.CategoryID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category_id"})
		return
	}

	ingredient := &models.Ingredient{
		Name:         req.Name,
		CategoryID:   categoryID,
		Unit:         req.Unit,
		Barcode:      req.Barcode,
		LossCleaning: req.LossCleaning,
		LossBoiling:  req.LossBoiling,
		LossFrying:   req.LossFrying,
		LossStewing:  req.LossStewing,
		LossBaking:   req.LossBaking,
		Active:       true,
	}

	var warehouseID uuid.UUID
	if req.WarehouseID != nil {
		warehouseID, err = uuid.Parse(*req.WarehouseID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid warehouse_id"})
			return
		}
	}

	if err := h.usecase.CreateIngredient(c.Request.Context(), ingredient, warehouseID, req.Quantity, req.PricePerUnit, estID); err != nil {
		h.logger.Error("Failed to create ingredient", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": ingredient})
}

// UpdateIngredient обновляет ингредиент
// @Summary Обновить ингредиент
// @Description Обновляет данные ингредиента
// @Tags menu
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID ингредиента"
// @Param request body UpdateIngredientRequest true "Данные для обновления"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/ingredients/{id} [put]
func (h *MenuHandler) UpdateIngredient(c *gin.Context) {
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

	var req UpdateIngredientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ingredient, err := h.usecase.GetIngredientByID(c.Request.Context(), id, estID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ingredient not found"})
		return
	}

	if req.Name != "" {
		ingredient.Name = req.Name
	}
	if req.CategoryID != nil {
		categoryID, err := uuid.Parse(*req.CategoryID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category_id"})
			return
		}
		ingredient.CategoryID = categoryID
	}
	if req.Unit != "" {
		ingredient.Unit = req.Unit
	}
	ingredient.Barcode = req.Barcode
	ingredient.LossCleaning = req.LossCleaning
	ingredient.LossBoiling = req.LossBoiling
	ingredient.LossFrying = req.LossFrying
	ingredient.LossStewing = req.LossStewing
	ingredient.LossBaking = req.LossBaking
	if req.Active != nil {
		ingredient.Active = *req.Active
	}

	if err := h.usecase.UpdateIngredient(c.Request.Context(), ingredient); err != nil {
		h.logger.Error("Failed to update ingredient", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": ingredient})
}

// DeleteIngredient удаляет ингредиент
// @Summary Удалить ингредиент
// @Description Удаляет ингредиент по ID
// @Tags menu
// @Produce json
// @Security Bearer
// @Param id path string true "ID ингредиента"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/ingredients/{id} [delete]
func (h *MenuHandler) DeleteIngredient(c *gin.Context) {
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

	if err := h.usecase.DeleteIngredient(c.Request.Context(), id, estID); err != nil {
		h.logger.Error("Failed to delete ingredient", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete ingredient"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ingredient deleted"})
}

// ——— Categories (для товаров и тех-карт) ———

type CreateCategoryRequest struct {
	Name string `json:"name" binding:"required"`
	Type string `json:"type" binding:"required,oneof=product tech_card semi_finished"`
}

type UpdateCategoryRequest struct {
	Name *string `json:"name,omitempty"`
	Type *string `json:"type,omitempty" binding:"omitempty,oneof=product tech_card semi_finished"`
}

// GetCategories возвращает список категорий товаров
// @Summary Получить список категорий
// @Description Возвращает список категорий для товаров и тех-карт
// @Tags menu
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{}
// @Router /menu/categories [get]
func (h *MenuHandler) GetCategories(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	filter := &repositories.CategoryFilter{EstablishmentID: &estID}
	if t := c.Query("type"); t != "" {
		filter.Type = &t
	}
	if s := c.Query("search"); s != "" {
		filter.Search = &s
	}
	list, err := h.usecase.GetCategories(c.Request.Context(), filter)
	if err != nil {
		h.logger.Error("Failed to get categories", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get categories"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// GetCategory возвращает категорию по ID
// @Summary Получить категорию по ID
// @Description Возвращает категорию по ID
// @Tags menu
// @Produce json
// @Security Bearer
// @Param id path string true "ID категории"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/categories/{id} [get]
func (h *MenuHandler) GetCategory(c *gin.Context) {
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
	cat, err := h.usecase.GetCategoryByID(c.Request.Context(), id, estID)
	if err != nil {
		h.logger.Error("Failed to get category", zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"error": "category not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": cat})
}

// CreateCategory создает новую категорию
// @Summary Создать категорию
// @Description Создает новую категорию для товаров и тех-карт
// @Tags menu
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateCategoryRequest true "Данные категории"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/categories [post]
func (h *MenuHandler) CreateCategory(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	var req CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cat := &models.Category{Name: req.Name, Type: req.Type}
	if err := h.usecase.CreateCategory(c.Request.Context(), cat, estID); err != nil {
		h.logger.Error("Failed to create category", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create category"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": cat})
}

// UpdateCategory обновляет категорию
// @Summary Обновить категорию
// @Description Обновляет данные категории
// @Tags menu
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID категории"
// @Param request body UpdateCategoryRequest true "Данные для обновления"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/categories/{id} [put]
func (h *MenuHandler) UpdateCategory(c *gin.Context) {
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
	cat, err := h.usecase.GetCategoryByID(c.Request.Context(), id, estID)
	if err != nil {
		h.logger.Error("Failed to get category", zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"error": "category not found"})
		return
	}
	var req UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Name != nil {
		cat.Name = *req.Name
	}
	if req.Type != nil {
		cat.Type = *req.Type
	}
	if err := h.usecase.UpdateCategory(c.Request.Context(), cat, estID); err != nil {
		h.logger.Error("Failed to update category", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update category"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": cat})
}

// DeleteCategory удаляет категорию
// @Summary Удалить категорию
// @Description Удаляет категорию по ID
// @Tags menu
// @Produce json
// @Security Bearer
// @Param id path string true "ID категории"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/categories/{id} [delete]
func (h *MenuHandler) DeleteCategory(c *gin.Context) {
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
	if err := h.usecase.DeleteCategory(c.Request.Context(), id, estID); err != nil {
		h.logger.Error("Failed to delete category", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete category"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "category deleted"})
}

// ——— IngredientCategories ———

type CreateIngredientCategoryRequest struct {
	Name string `json:"name" binding:"required"`
}

type UpdateIngredientCategoryRequest struct {
	Name *string `json:"name,omitempty"`
}

// GetIngredientCategories возвращает список категорий ингредиентов
// @Summary Получить список категорий ингредиентов
// @Description Возвращает список категорий ингредиентов с информацией о количестве ингредиентов и остатках на складах
// @Tags menu
// @Produce json
// @Security Bearer
// @Param search query string false "Поиск по названию"
// @Success 200 {object} map[string]interface{}
// @Router /menu/ingredient-categories [get]
func (h *MenuHandler) GetIngredientCategories(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	filter := &repositories.IngredientCategoryFilter{EstablishmentID: &estID}
	if s := c.Query("search"); s != "" {
		filter.Search = &s
	}
	list, err := h.usecase.GetIngredientCategoriesWithStats(c.Request.Context(), filter)
	if err != nil {
		h.logger.Error("Failed to get ingredient categories", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get ingredient categories"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// GetIngredientCategory возвращает категорию ингредиентов по ID
// @Summary Получить категорию ингредиентов по ID
// @Description Возвращает категорию ингредиентов по ID с информацией о количестве ингредиентов и остатках на складах
// @Tags menu
// @Produce json
// @Security Bearer
// @Param id path string true "ID категории"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/ingredient-categories/{id} [get]
func (h *MenuHandler) GetIngredientCategory(c *gin.Context) {
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
	cat, err := h.usecase.GetIngredientCategoryWithStatsByID(c.Request.Context(), id, estID)
	if err != nil {
		h.logger.Error("Failed to get ingredient category", zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"error": "ingredient category not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": cat})
}

// CreateIngredientCategory создает новую категорию ингредиентов
// @Summary Создать категорию ингредиентов
// @Description Создает новую категорию ингредиентов
// @Tags menu
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateIngredientCategoryRequest true "Данные категории"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/ingredient-categories [post]
func (h *MenuHandler) CreateIngredientCategory(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}
	var req CreateIngredientCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cat := &models.IngredientCategory{Name: req.Name}
	if err := h.usecase.CreateIngredientCategory(c.Request.Context(), cat, estID); err != nil {
		h.logger.Error("Failed to create ingredient category", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create ingredient category"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": cat})
}

// UpdateIngredientCategory обновляет категорию ингредиентов
// @Summary Обновить категорию ингредиентов
// @Description Обновляет данные категории ингредиентов
// @Tags menu
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID категории"
// @Param request body UpdateIngredientCategoryRequest true "Данные для обновления"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/ingredient-categories/{id} [put]
func (h *MenuHandler) UpdateIngredientCategory(c *gin.Context) {
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
	cat, err := h.usecase.GetIngredientCategoryByID(c.Request.Context(), id, estID)
	if err != nil {
		h.logger.Error("Failed to get ingredient category", zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"error": "ingredient category not found"})
		return
	}
	var req UpdateIngredientCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Name != nil {
		cat.Name = *req.Name
	}
	if err := h.usecase.UpdateIngredientCategory(c.Request.Context(), cat, estID); err != nil {
		h.logger.Error("Failed to update ingredient category", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update ingredient category"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": cat})
}

// DeleteIngredientCategory удаляет категорию ингредиентов
// @Summary Удалить категорию ингредиентов
// @Description Удаляет категорию ингредиентов по ID
// @Tags menu
// @Produce json
// @Security Bearer
// @Param id path string true "ID категории"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/ingredient-categories/{id} [delete]
func (h *MenuHandler) DeleteIngredientCategory(c *gin.Context) {
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
	if err := h.usecase.DeleteIngredientCategory(c.Request.Context(), id, estID); err != nil {
		h.logger.Error("Failed to delete ingredient category", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete ingredient category"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "ingredient category deleted"})
}

// GetSemiFinished — полуфабрикаты (тех-карты как промежуточный продукт)
func (h *MenuHandler) GetSemiFinished(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	filter := &repositories.SemiFinishedFilter{EstablishmentID: &estID}
	if categoryID := c.Query("category_id"); categoryID != "" {
		if id, err := uuid.Parse(categoryID); err == nil {
			filter.CategoryID = &id
		}
	}
	if workshopID := c.Query("workshop_id"); workshopID != "" {
		if id, err := uuid.Parse(workshopID); err == nil {
			filter.WorkshopID = &id
		}
	}
	if search := c.Query("search"); search != "" {
		filter.Search = &search
	}
	if active := c.Query("active"); active != "" {
		activeBool := active == "true"
		filter.Active = &activeBool
	}

	semiFinished, err := h.usecase.GetSemiFinishedProducts(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": semiFinished})
}

type CreateSemiFinishedRequest struct {
	Name            string                         `json:"name" binding:"required"`
	WorkshopID      *string                        `json:"workshop_id,omitempty" binding:"omitempty,uuid"`
	Description     string                         `json:"description"`
	CookingProcess  string                         `json:"cooking_process"`
	CoverImage      string                         `json:"cover_image"`
	Unit            string                         `json:"unit" binding:"required"` // kg, gram, liter, ml, piece
	Quantity        float64                        `json:"quantity"`
	Ingredients     []CreateSemiFinishedIngredient `json:"ingredients"`
}

type CreateSemiFinishedIngredient struct {
	IngredientID      string  `json:"ingredient_id" binding:"required,uuid"`
	PreparationMethod *string `json:"preparation_method"`
	Gross             float64 `json:"gross" binding:"required"`
	Net               float64 `json:"net" binding:"required"`
	Unit              string  `json:"unit" binding:"required"` // г, мл, шт
}

// CreateSemiFinished создает полуфабрикат
func (h *MenuHandler) CreateSemiFinished(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var req CreateSemiFinishedRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var workshopID *uuid.UUID
	if req.WorkshopID != nil {
		parsed, err := uuid.Parse(*req.WorkshopID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid workshop_id"})
			return
		}
		workshopID = &parsed
	}

	// Конвертируем unit из frontend format в backend format
	var unit string
	switch req.Unit {
	case "кг":
		unit = "kg"
	case "г":
		unit = "gram"
	case "л":
		unit = "liter"
	case "мл":
		unit = "ml"
	case "шт":
		unit = "piece"
	default:
		unit = req.Unit
	}

	semiFinished := &models.SemiFinishedProduct{
		EstablishmentID: estID,
		Name:            req.Name,
		WorkshopID:      workshopID,
		Description:     req.Description,
		CookingProcess:  req.CookingProcess,
		CoverImage:      req.CoverImage,
		Unit:            unit,
		Quantity:        req.Quantity,
		Active:          true,
	}

	// Добавляем ингредиенты
	for _, ingReq := range req.Ingredients {
		ingredientID, err := uuid.Parse(ingReq.IngredientID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ingredient_id"})
			return
		}

		semiFinished.Ingredients = append(semiFinished.Ingredients, models.SemiFinishedIngredient{
			IngredientID:      ingredientID,
			PreparationMethod: ingReq.PreparationMethod,
			Gross:             ingReq.Gross,
			Net:               ingReq.Net,
			Unit:              ingReq.Unit,
		})
	}

	// Получаем склад по умолчанию для заведения (берем первый доступный)
	warehouses, err := h.usecase.GetWarehouses(c.Request.Context(), estID)
	if err != nil || len(warehouses) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get warehouse"})
		return
	}
	warehouseID := warehouses[0].ID


	if err := h.usecase.CreateSemiFinished(c.Request.Context(), semiFinished, warehouseID, estID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": semiFinished})
}