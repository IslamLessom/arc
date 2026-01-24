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

// EstablishmentResponse представляет структуру заведения в ответе API
// @Description Структура заведения со всеми полями, включая настройки и связанные таблицы
type EstablishmentResponse struct {
	// ID уникальный идентификатор заведения (UUID)
	ID string `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	// OwnerID идентификатор владельца заведения
	OwnerID string `json:"owner_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	// Name название заведения
	Name string `json:"name" example:"Кафе Москва"`
	// Address адрес заведения
	Address string `json:"address" example:"ул. Тверская, д. 1"`
	// Phone телефон заведения
	Phone string `json:"phone" example:"+79991234567"`
	// Email email заведения
	Email string `json:"email" example:"info@cafe-moscow.ru"`
	// HasSeatingPlaces есть ли сидячие места
	HasSeatingPlaces bool `json:"has_seating_places" example:"true"`
	// TableCount количество столов (если есть сидячие места)
	TableCount *int `json:"table_count,omitempty" example:"10"`
	// Type тип заведения: restaurant, cafe, fast_food, bar, pizzeria, bakery, coffee_shop, takeaway, delivery, other
	Type string `json:"type" example:"cafe"`
	// HasDelivery есть ли доставка
	HasDelivery bool `json:"has_delivery" example:"false"`
	// HasTakeaway есть ли на вынос
	HasTakeaway bool `json:"has_takeaway" example:"true"`
	// HasReservations принимаются ли бронирования
	HasReservations bool `json:"has_reservations" example:"false"`
	// Tables массив столов заведения (если есть сидячие места)
	Tables []TableResponse `json:"tables,omitempty"`
	// Active активность заведения
	Active bool `json:"active" example:"true"`
	// CreatedAt дата создания
	CreatedAt string `json:"created_at" example:"2024-01-18T10:00:00Z"`
	// UpdatedAt дата последнего обновления
	UpdatedAt string `json:"updated_at" example:"2024-01-18T10:00:00Z"`
}

// TableResponse представляет структуру стола в ответе API
// @Description Структура стола с координатами и статусом
type TableResponse struct {
	// ID уникальный идентификатор стола (UUID)
	ID string `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	// EstablishmentID идентификатор заведения
	EstablishmentID string `json:"establishment_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	// Number номер стола (уникален в рамках заведения)
	Number int `json:"number" example:"1"`
	// Name название стола (опционально)
	Name string `json:"name" example:"Стол у окна"`
	// Capacity вместимость стола (количество мест)
	Capacity int `json:"capacity" example:"4"`
	// PositionX X координата на схеме зала
	PositionX float64 `json:"position_x" example:"100.5"`
	// PositionY Y координата на схеме зала
	PositionY float64 `json:"position_y" example:"200.5"`
	// Rotation поворот стола в градусах (0-360)
	Rotation float64 `json:"rotation" example:"0"`
	// Status статус стола: available, occupied, reserved
	Status string `json:"status" example:"available"`
	// Active активность стола
	Active bool `json:"active" example:"true"`
	// CreatedAt дата создания
	CreatedAt string `json:"created_at" example:"2024-01-18T10:00:00Z"`
	// UpdatedAt дата последнего обновления
	UpdatedAt string `json:"updated_at" example:"2024-01-18T10:00:00Z"`
}

type UpdateEstablishmentRequest struct {
	Name              *string `json:"name,omitempty"`
	Address           *string `json:"address,omitempty"`
	Phone             *string `json:"phone,omitempty"`
	Email             *string `json:"email,omitempty"`
	HasSeatingPlaces   *bool   `json:"has_seating_places,omitempty"`
	TableCount       *int    `json:"table_count,omitempty"`
	Type              *string `json:"type,omitempty"`
	HasDelivery      *bool   `json:"has_delivery,omitempty"`
	HasTakeaway      *bool   `json:"has_takeaway,omitempty"`
	HasReservations  *bool   `json:"has_reservations,omitempty"`
	Active            *bool   `json:"active,omitempty"`
}

// GetEstablishmentSettings возвращает настройки заведения
// @Summary Получить настройки заведения
// @Description Возвращает настройки заведения текущего пользователя
// @Tags establishments
// @Produce json
// @Security Bearer
// @Success 200 {object} EstablishmentSettingsResponse
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /establishments/me/settings [get]
func (h *EstablishmentHandler) GetEstablishmentSettings(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	establishment, err := h.usecase.GetByID(c.Request.Context(), estID)
	if err != nil {
		h.logger.Error("Failed to get establishment settings", zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"error": "Establishment settings not found"})
		return
	}

	response := EstablishmentSettingsResponse{
		HasSeatingPlaces: establishment.HasSeatingPlaces,
		TableCount:       establishment.TableCount,
		Type:             establishment.Type,
		HasDelivery:      establishment.HasDelivery,
		HasTakeaway:      establishment.HasTakeaway,
		HasReservations:  establishment.HasReservations,
	}

	c.JSON(http.StatusOK, response)
}

// List возвращает заведение пользователя (создаётся при onboarding). 0 или 1 элемент.
// @Summary Получить список заведений
// @Description Возвращает заведения пользователя (обычно 0 или 1 элемент). Возвращает массив заведений с полями: id, owner_id, name, address, phone, email, has_seating_places, table_count, type, tables, active, created_at, updated_at
// @Tags establishments
// @Produce json
// @Security Bearer
// @Success 200 {array} EstablishmentResponse "Ответ обернут в объект: {\"data\": [заведения]}. Каждое заведение содержит: id, owner_id, name, address, phone, email, has_seating_places, table_count, type, tables, active, created_at, updated_at"
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
// @Description Возвращает заведение по ID (доступ только к своему заведению). Возвращает объект с полями: id, owner_id, name, address, phone, email, has_seating_places, table_count, type, tables (массив столов), active, created_at, updated_at
// @Tags establishments
// @Produce json
// @Security Bearer
// @Param id path string true "ID заведения"
// @Success 200 {object} EstablishmentResponse "Ответ обернут в объект: {\"data\": {заведение}}. Поля заведения: id, owner_id, name, address, phone, email, has_seating_places, table_count, type, tables (массив), active, created_at, updated_at"
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
// @Description Обновляет заведение (доступ только к своему заведению). Возвращает обновленное заведение с полями: id, owner_id, name, address, phone, email, has_seating_places, table_count, type, tables, active, created_at, updated_at
// @Tags establishments
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID заведения"
// @Param request body UpdateEstablishmentRequest true "Данные для обновления. Все поля опциональны"
// @Success 200 {object} EstablishmentResponse "Ответ обернут в объект: {\"data\": {заведение}}. Поля заведения: id, owner_id, name, address, phone, email, has_seating_places, table_count, type, tables, active, created_at, updated_at"
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
	if req.HasDelivery != nil {
		e.HasDelivery = *req.HasDelivery
	}
	if req.HasTakeaway != nil {
		e.HasTakeaway = *req.HasTakeaway
	}
	if req.HasReservations != nil {
		e.HasReservations = *req.HasReservations
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