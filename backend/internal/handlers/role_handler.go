package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/usecases"
)

type RoleHandler struct {
	usecase *usecases.RoleUseCase
	logger  *zap.Logger
}

func NewRoleHandler(usecase *usecases.RoleUseCase, logger *zap.Logger) *RoleHandler {
	return &RoleHandler{
		usecase: usecase,
		logger:  logger,
	}
}

type CreateRoleRequest struct {
	Name        string `json:"name" binding:"required"`
	Permissions string `json:"permissions" binding:"required"` // JSON string of permissions
}

type UpdateRoleRequest struct {
	Name        *string `json:"name,omitempty"`
	Permissions *string `json:"permissions,omitempty"` // JSON string of permissions
}

// CreateRole создает новую роль
// @Summary Создать роль
// @Description Создает новую роль
// @Tags roles
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body CreateRoleRequest true "Данные роли"
// @Success 201 {object} models.Role
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /roles [post]
func (h *RoleHandler) CreateRole(c *gin.Context) {
	var req CreateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	role, err := h.usecase.CreateRole(c.Request.Context(), req.Name, req.Permissions)
	if err != nil {
		h.logger.Error("Failed to create role", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, role)
}

// GetRole возвращает роль по ID
// @Summary Получить роль
// @Description Возвращает роль по ID
// @Tags roles
// @Produce json
// @Security Bearer
// @Param id path string true "ID роли"
// @Success 200 {object} models.Role
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /roles/{id} [get]
func (h *RoleHandler) GetRole(c *gin.Context) {
	roleID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID роли"})
		return
	}

	role, err := h.usecase.GetRoleByID(c.Request.Context(), roleID)
	if err != nil {
		h.logger.Error("Failed to get role", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, role)
}

// ListRoles возвращает список всех ролей
// @Summary Получить список ролей
// @Description Возвращает список всех доступных ролей
// @Tags roles
// @Produce json
// @Security Bearer
// @Success 200 {array} models.Role
// @Failure 500 {object} map[string]string
// @Router /roles [get]
func (h *RoleHandler) ListRoles(c *gin.Context) {
	roles, err := h.usecase.ListRoles(c.Request.Context())
	if err != nil {
		h.logger.Error("Failed to list roles", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить список ролей"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": roles})
}

// UpdateRole обновляет данные роли
// @Summary Обновить роль
// @Description Обновляет данные роли по ID
// @Tags roles
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "ID роли"
// @Param request body UpdateRoleRequest true "Данные для обновления"
// @Success 200 {object} models.Role
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /roles/{id} [put]
func (h *RoleHandler) UpdateRole(c *gin.Context) {
	roleID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID роли"})
		return
	}

	var req UpdateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	role := &models.Role{ID: roleID}
	if req.Name != nil { role.Name = *req.Name }
	if req.Permissions != nil { role.Permissions = *req.Permissions }

	updatedRole, err := h.usecase.UpdateRole(c.Request.Context(), role)
	if err != nil {
		h.logger.Error("Failed to update role", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedRole)
}

// DeleteRole удаляет роль
// @Summary Удалить роль
// @Description Удаляет роль по ID (мягкое удаление)
// @Tags roles
// @Produce json
// @Security Bearer
// @Param id path string true "ID роли"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /roles/{id} [delete]
func (h *RoleHandler) DeleteRole(c *gin.Context) {
	roleID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID роли"})
		return
	}

	if err := h.usecase.DeleteRole(c.Request.Context(), roleID); err != nil {
		h.logger.Error("Failed to delete role", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Роль успешно удалена"})
}
