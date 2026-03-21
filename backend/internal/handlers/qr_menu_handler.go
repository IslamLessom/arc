package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/middleware"
	"github.com/yourusername/arc/backend/internal/usecases"
	"github.com/yourusername/arc/backend/pkg/auth"
)

type QRMenuHandler struct {
	usecase *usecases.QRMenuUseCase
	logger  *zap.Logger
}

func NewQRMenuHandler(usecase *usecases.QRMenuUseCase, logger *zap.Logger) *QRMenuHandler {
	return &QRMenuHandler{usecase: usecase, logger: logger}
}

// GetTableInfo godoc
// @Summary      Получить информацию о столике по QR-токену
// @Tags         qr-menu
// @Produce      json
// @Param        qr_token  path  string  true  "QR Token"
// @Success      200  {object}  usecases.QRMenuInfo
// @Failure      404  {object}  gin.H
// @Router       /qr/{qr_token} [get]
func (h *QRMenuHandler) GetTableInfo(c *gin.Context) {
	qrToken, err := uuid.Parse(c.Param("qr_token"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid QR token"})
		return
	}

	info, err := h.usecase.GetTableByQRToken(c.Request.Context(), qrToken)
	if err != nil {
		if errors.Is(err, usecases.ErrQRTokenNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "QR code not found"})
			return
		}
		h.logger.Error("GetTableInfo error", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}

	c.JSON(http.StatusOK, info)
}

// GetMenu godoc
// @Summary      Получить публичное меню по QR-токену
// @Tags         qr-menu
// @Produce      json
// @Param        qr_token  path  string  true  "QR Token"
// @Success      200  {array}   usecases.QRMenuCategory
// @Failure      404  {object}  gin.H
// @Router       /qr/{qr_token}/menu [get]
func (h *QRMenuHandler) GetMenu(c *gin.Context) {
	qrToken, err := uuid.Parse(c.Param("qr_token"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid QR token"})
		return
	}

	info, err := h.usecase.GetTableByQRToken(c.Request.Context(), qrToken)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "QR code not found"})
		return
	}

	menu, err := h.usecase.GetPublicMenu(c.Request.Context(), info.Establishment.ID)
	if err != nil {
		h.logger.Error("GetMenu error", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}

	c.JSON(http.StatusOK, menu)
}

// CreateSession godoc
// @Summary      Создать гостевую сессию (анонимную)
// @Tags         qr-menu
// @Accept       json
// @Produce      json
// @Param        qr_token  path  string                      true  "QR Token"
// @Param        body      body  createSessionRequest         true  "Данные сессии"
// @Success      201  {object}  usecases.GuestSessionResponse
// @Router       /qr/{qr_token}/session [post]
type createSessionRequest struct {
	GuestName string `json:"guest_name"`
}

func (h *QRMenuHandler) CreateSession(c *gin.Context) {
	qrToken, err := uuid.Parse(c.Param("qr_token"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid QR token"})
		return
	}

	var req createSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.usecase.CreateAnonymousSession(c.Request.Context(), qrToken, req.GuestName)
	if err != nil {
		if errors.Is(err, usecases.ErrQRTokenNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "QR code not found"})
			return
		}
		if errors.Is(err, usecases.ErrGuestNameRequired) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "guest name is required"})
			return
		}
		h.logger.Error("CreateSession error", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

// RegisterGuest godoc
// @Summary      Зарегистрировать гостя (телефон + пароль)
// @Tags         qr-menu
// @Accept       json
// @Produce      json
// @Param        qr_token  path  string                      true  "QR Token"
// @Param        body      body  registerGuestRequest         true  "Данные регистрации"
// @Success      201  {object}  usecases.GuestSessionResponse
// @Router       /qr/{qr_token}/register [post]
type registerGuestRequest struct {
	GuestName string `json:"guest_name" binding:"required"`
	Phone     string `json:"phone" binding:"required"`
	Password  string `json:"password" binding:"required,min=6"`
}

func (h *QRMenuHandler) RegisterGuest(c *gin.Context) {
	qrToken, err := uuid.Parse(c.Param("qr_token"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid QR token"})
		return
	}

	var req registerGuestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.usecase.RegisterGuest(c.Request.Context(), qrToken, usecases.GuestCreateRequest{
		GuestName:   req.GuestName,
		Phone:       req.Phone,
		Password:    req.Password,
		IsAnonymous: false,
	})
	if err != nil {
		switch {
		case errors.Is(err, usecases.ErrQRTokenNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "QR code not found"})
		case errors.Is(err, usecases.ErrGuestPhoneRegistered):
			c.JSON(http.StatusConflict, gin.H{"error": "phone number already registered"})
		default:
			h.logger.Error("RegisterGuest error", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		}
		return
	}

	c.JSON(http.StatusCreated, resp)
}

// LoginGuest godoc
// @Summary      Войти как зарегистрированный гость
// @Tags         qr-menu
// @Accept       json
// @Produce      json
// @Param        qr_token  path  string              true  "QR Token"
// @Param        body      body  loginGuestRequest   true  "Телефон и пароль"
// @Success      200  {object}  usecases.GuestSessionResponse
// @Router       /qr/{qr_token}/login [post]
type loginGuestRequest struct {
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *QRMenuHandler) LoginGuest(c *gin.Context) {
	qrToken, err := uuid.Parse(c.Param("qr_token"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid QR token"})
		return
	}

	var req loginGuestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.usecase.LoginGuest(c.Request.Context(), qrToken, req.Phone, req.Password)
	if err != nil {
		switch {
		case errors.Is(err, usecases.ErrQRTokenNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "QR code not found"})
		case errors.Is(err, usecases.ErrGuestInvalidPassword):
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid phone or password"})
		default:
			h.logger.Error("LoginGuest error", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		}
		return
	}

	c.JSON(http.StatusOK, resp)
}

// CreateOrder godoc
// @Summary      Создать заказ от гостя через QR-меню
// @Tags         qr-menu
// @Accept       json
// @Produce      json
// @Security     GuestBearerAuth
// @Param        qr_token  path  string                          true  "QR Token"
// @Param        body      body  usecases.CreateQROrderRequest   true  "Позиции заказа"
// @Success      201  {object}  models.Order
// @Router       /qr/{qr_token}/orders [post]
func (h *QRMenuHandler) CreateOrder(c *gin.Context) {
	claimsRaw, exists := c.Get(middleware.GuestClaimsKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "guest session required"})
		return
	}
	claims := claimsRaw.(*auth.GuestClaims)

	var req usecases.CreateQROrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := h.usecase.CreateQROrder(c.Request.Context(), claims, req)
	if err != nil {
		if errors.Is(err, usecases.ErrQROrderItemsRequired) ||
			errors.Is(err, usecases.ErrQROrderInvalidItem) ||
			errors.Is(err, usecases.ErrQROrderNoValidItems) {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		h.logger.Error("CreateOrder error", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, order)
}

// GetMyOrders godoc
// @Summary      Получить мои заказы (текущая гостевая сессия)
// @Tags         qr-menu
// @Produce      json
// @Security     GuestBearerAuth
// @Param        qr_token  path  string  true  "QR Token"
// @Success      200  {array}  models.Order
// @Router       /qr/{qr_token}/orders [get]
func (h *QRMenuHandler) GetMyOrders(c *gin.Context) {
	claimsRaw, exists := c.Get(middleware.GuestClaimsKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "guest session required"})
		return
	}
	claims := claimsRaw.(*auth.GuestClaims)

	orders, err := h.usecase.GetGuestOrders(c.Request.Context(), claims.SessionID, claims.EstablishmentID)
	if err != nil {
		h.logger.Error("GetMyOrders error", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

// GenerateQRToken godoc
// @Summary      Сгенерировать/обновить QR-токен для столика (admin)
// @Tags         qr-menu
// @Produce      json
// @Security     BearerAuth
// @Param        id        path  string  true  "Room ID"
// @Param        table_id  path  string  true  "Table ID"
// @Success      200  {object}  gin.H
// @Router       /rooms/{id}/tables/{table_id}/qr/generate [post]
func (h *QRMenuHandler) GenerateQRToken(c *gin.Context) {
	tableID, err := uuid.Parse(c.Param("table_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid table id"})
		return
	}

	newToken, err := h.usecase.GenerateTableQRToken(c.Request.Context(), tableID)
	if err != nil {
		h.logger.Error("GenerateQRToken error", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"qr_token": newToken})
}
