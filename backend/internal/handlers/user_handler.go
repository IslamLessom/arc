package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/usecases"
)

type UserHandler struct {
	usecase *usecases.UserUseCase
	logger  *zap.Logger
}

func NewUserHandler(usecase *usecases.UserUseCase, logger *zap.Logger) *UserHandler {
	return &UserHandler{
		usecase: usecase,
		logger:  logger,
	}
}

type CreateEmployeeRequest struct {
	Name  string `json:"name" binding:"required"`
	Email string `json:"email,omitempty" binding:"omitempty,email"`
	PIN   string `json:"pin" binding:"required,numeric,len=4"` // ПИН-код = код сотрудника для кассы
	Phone *string `json:"phone,omitempty"` // Добавлено поле для номера телефона
	RoleID string `json:"role_id" binding:"required,uuid"` // Должна быть роль сотрудника
}

type UpdateEmployeeRequest struct {
	Name  *string `json:"name,omitempty"`
	Email *string `json:"email,omitempty" binding:"omitempty,email"`
	PIN   *string `json:"pin,omitempty" binding:"omitempty,numeric,len=4"` // ПИН-код = код сотрудника для кассы
	Phone *string `json:"phone,omitempty"` // Добавлено поле для номера телефона
	RoleID *string `json:"role_id,omitempty" binding:"omitempty,uuid"` // Должна быть роль сотрудника
}

// CreateEmployee создает нового сотрудника
// @Summary Создать сотрудника
// @Description Создает нового сотрудника для текущего заведения
// @Tags users
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateEmployeeRequest true "Данные сотрудника"
// @Success 201 {object} models.User
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /users [post]
func (h *UserHandler) CreateEmployee(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var req CreateEmployeeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	roleID, err := uuid.Parse(req.RoleID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID роли"})
		return
	}

	user, err := h.usecase.CreateEmployee(c.Request.Context(), req.Name, req.Email, req.PIN, req.Phone, roleID, estID)
	if err != nil {
		h.logger.Error("Failed to create employee", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": user})
}

// GetEmployee возвращает сотрудника по ID
// @Summary Получить сотрудника
// @Description Возвращает сотрудника по ID для текущего заведения
// @Tags users
// @Produce json
// @Security Bearer
// @Param id path string true "ID сотрудника"
// @Success 200 {object} models.User
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /users/{id} [get]
func (h *UserHandler) GetEmployee(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID сотрудника"})
		return
	}

	user, err := h.usecase.GetEmployeeByID(c.Request.Context(), userID, estID)
	if err != nil {
		h.logger.Error("Failed to get employee", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
}

// ListEmployees возвращает список сотрудников
// @Summary Получить список сотрудников
// @Description Возвращает список всех сотрудников для текущего заведения
// @Tags users
// @Produce json
// @Security Bearer
// @Success 200 {array} models.User
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /users [get]
func (h *UserHandler) ListEmployees(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	employees, err := h.usecase.ListEmployeesByEstablishment(c.Request.Context(), estID)
	if err != nil {
		h.logger.Error("Failed to list employees", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": employees})
}

// UpdateEmployee обновляет данные сотрудника
// @Summary Обновить данные сотрудника
// @Description Обновляет данные сотрудника по ID для текущего заведения
// @Tags users
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID сотрудника"
// @Param request body UpdateEmployeeRequest true "Данные для обновления"
// @Success 200 {object} models.User
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /users/{id} [put]
func (h *UserHandler) UpdateEmployee(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID сотрудника"})
		return
	}

	var req UpdateEmployeeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := &models.User{ID: userID}
	if req.Name != nil { user.Name = *req.Name }
	if req.Email != nil { user.Email = req.Email }
	if req.PIN != nil { user.PIN = req.PIN }
	if req.Phone != nil { user.Phone = req.Phone } // Добавлено поле для номера телефона
	if req.RoleID != nil {
		newRoleID, err := uuid.Parse(*req.RoleID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID роли"})
			return
		}
		user.RoleID = newRoleID
	}

	updatedUser, err := h.usecase.UpdateEmployee(c.Request.Context(), user, estID)
	if err != nil {
		h.logger.Error("Failed to update employee", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": updatedUser})
}

// DeleteEmployee удаляет сотрудника
// @Summary Удалить сотрудника
// @Description Удаляет сотрудника по ID для текущего заведения (мягкое удаление)
// @Tags users
// @Produce json
// @Security Bearer
// @Param id path string true "ID сотрудника"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /users/{id} [delete]
func (h *UserHandler) DeleteEmployee(c *gin.Context) {
	estID, err := getEstablishmentID(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID сотрудника"})
		return
	}

	if err := h.usecase.DeleteEmployee(c.Request.Context(), userID, estID); err != nil {
		h.logger.Error("Failed to delete employee", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Сотрудник успешно удален"})
}
