package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/usecases"
)

// Mock for ShiftUseCase for ShiftHandler tests
type MockShiftUseCaseForHandler struct {
	mock.Mock
}

func (m *MockShiftUseCaseForHandler) GetShiftByID(ctx context.Context, id uuid.UUID) (*models.Shift, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*models.Shift), args.Error(1)
}

func (m *MockShiftUseCaseForHandler) GetCurrentActiveShift(ctx context.Context, userID uuid.UUID) (*models.Shift, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).(*models.Shift), args.Error(1)
}

func (m *MockShiftUseCaseForHandler) EndShift(ctx context.Context, shiftID uuid.UUID, finalCash float64, comment *string) (*models.Shift, error) {
	args := m.Called(ctx, shiftID, finalCash, comment)
	return args.Get(0).(*models.Shift), args.Error(1)
}

func TestShiftHandler_GetCurrentActiveShift(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockShiftUseCase := new(MockShiftUseCaseForHandler)()
	logger, _ := zap.NewDevelopment()
	handler := NewShiftHandler(mockShiftUseCase, logger)

	router := gin.Default()
	router.GET("/shifts/me/active", func(c *gin.Context) {
		// Mock the user_id in the context, as it would be set by auth middleware
		userID := uuid.New()
		c.Set("user_id", userID.String())
		handler.GetCurrentActiveShift(c)
	})

	userID := uuid.New()
	shiftID := uuid.New()

	// Test case 1: Successfully get current active shift
	t.Run("Successfully get current active shift", func(t *testing.T) {
		expectedShift := &models.Shift{ID: shiftID, UserID: userID, StartTime: time.Now(), EndTime: nil}
		mockShiftUseCase.On("GetCurrentActiveShift", mock.Anything, userID).Return(expectedShift, nil).Once()

		req, _ := http.NewRequest(http.MethodGet, "/shifts/me/active", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		var responseShift models.Shift
		err := json.Unmarshal(rec.Body.Bytes(), &responseShift)
		assert.NoError(t, err)
		assert.Equal(t, expectedShift.ID, responseShift.ID)
		mockShiftUseCase.AssertExpectations(t)
	})

	// Test case 2: No active shift found
	t.Run("No active shift found", func(t *testing.T) {
		mockShiftUseCase.On("GetCurrentActiveShift", mock.Anything, userID).Return(&models.Shift{}, errors.New("not found")).Once()

		req, _ := http.NewRequest(http.MethodGet, "/shifts/me/active", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusNotFound, rec.Code)
		var response map[string]string
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Активная смена не найдена", response["error"])
		mockShiftUseCase.AssertExpectations(t)
	})

	// Test case 3: Internal server error from usecase
	t.Run("Internal server error from usecase", func(t *testing.T) {
		mockShiftUseCase.On("GetCurrentActiveShift", mock.Anything, userID).Return(&models.Shift{}, errors.New("internal error")).Once()

		req, _ := http.NewRequest(http.MethodGet, "/shifts/me/active", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusNotFound, rec.Code)
		var response map[string]string
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Активная смена не найдена", response["error"])
		mockShiftUseCase.AssertExpectations(t)
	})

	// Test case 4: User not authorized (missing user_id in context)
	t.Run("User not authorized (missing user_id in context)", func(t *testing.T) {
		routerWithoutUserID := gin.Default()
		routerWithoutUserID.GET("/shifts/me/active", handler.GetCurrentActiveShift)

		req, _ := http.NewRequest(http.MethodGet, "/shifts/me/active", nil)
		rec := httptest.NewRecorder()
		routerWithoutUserID.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusUnauthorized, rec.Code)
		var response map[string]string
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Пользователь не авторизован", response["error"])
		mockShiftUseCase.AssertNotCalled(t, "GetCurrentActiveShift")
	})
}
