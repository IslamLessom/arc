package usecases

import (
	"context"
	"errors"
	"fmt"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

// Mock for ShiftRepository for ShiftUseCase tests
type MockShiftRepositoryForShiftUC struct {
	mock.Mock
}

func (m *MockShiftRepositoryForShiftUC) GetByID(ctx context.Context, id uuid.UUID) (*models.Shift, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*models.Shift), args.Error(1)
}

func (m *MockShiftRepositoryForShiftUC) GetActiveShiftByUserID(ctx context.Context, userID uuid.UUID) (*models.Shift, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).(*models.Shift), args.Error(1)
}

func (m *MockShiftRepositoryForShiftUC) ListByFilter(ctx context.Context, filter *repositories.ShiftFilter) ([]*models.Shift, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).([]*models.Shift), args.Error(1)
}

func (m *MockShiftRepositoryForShiftUC) Create(ctx context.Context, shift *models.Shift) error {
	args := m.Called(ctx, shift)
	return args.Error(0)
}

func (m *MockShiftRepositoryForShiftUC) Update(ctx context.Context, shift *models.Shift) error {
	args := m.Called(ctx, shift)
	return args.Error(0)
}

// Mock for UserRepository for ShiftUseCase tests
type MockUserRepositoryForShiftUC struct {
	mock.Mock
}

func (m *MockUserRepositoryForShiftUC) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*models.User), args.Error(1)
}

// Mock for TransactionRepository for ShiftUseCase tests
type MockTransactionRepositoryForShiftUC struct {
	mock.Mock
}

func (m *MockTransactionRepositoryForShiftUC) Create(ctx context.Context, transaction *models.Transaction) error {
	args := m.Called(ctx, transaction)
	return args.Error(0)
}

func TestShiftUseCase_GetShiftByID(t *testing.T) {
	mockShiftRepo := new(MockShiftRepositoryForShiftUC)()
	mockUserRepo := new(MockUserRepositoryForShiftUC)()
	mockTransactionRepo := new(MockTransactionRepositoryForShiftUC)()
	useCase := NewShiftUseCase(mockShiftRepo, mockUserRepo, mockTransactionRepo)
	ctx := context.Background()

	shiftID := uuid.New()
	expectedShift := &models.Shift{ID: shiftID, InitialCash: 100.0}

	// Test case 1: Successfully get shift by ID
	t.Run("Successfully get shift by ID", func(t *testing.T) {
		mockShiftRepo.On("GetByID", ctx, shiftID).Return(expectedShift, nil).Once()

		shift, err := useCase.GetShiftByID(ctx, shiftID)

		assert.NoError(t, err)
		assert.NotNil(t, shift)
		assert.Equal(t, shiftID, shift.ID)
		mockShiftRepo.AssertExpectations(t)
	})

	// Test case 2: Shift not found
	t.Run("Shift not found", func(t *testing.T) {
		mockShiftRepo.On("GetByID", ctx, shiftID).Return(&models.Shift{}, errors.New("not found")).Once()

		shift, err := useCase.GetShiftByID(ctx, shiftID)

		assert.Error(t, err)
		assert.Nil(t, shift)
		assert.Contains(t, err.Error(), "not found")
		mockShiftRepo.AssertExpectations(t)
	})
}

func TestShiftUseCase_GetCurrentActiveShift(t *testing.T) {
	mockShiftRepo := new(MockShiftRepositoryForShiftUC)()
	mockUserRepo := new(MockUserRepositoryForShiftUC)()
	mockTransactionRepo := new(MockTransactionRepositoryForShiftUC)()
	useCase := NewShiftUseCase(mockShiftRepo, mockUserRepo, mockTransactionRepo)
	ctx := context.Background()

	userID := uuid.New()
	shiftID := uuid.New()
	expectedShift := &models.Shift{ID: shiftID, UserID: userID, StartTime: time.Now(), EndTime: nil}

	// Test case 1: Successfully get current active shift
	t.Run("Successfully get current active shift", func(t *testing.T) {
		mockShiftRepo.On("GetActiveShiftByUserID", ctx, userID).Return(expectedShift, nil).Once()

		shift, err := useCase.GetCurrentActiveShift(ctx, userID)

		assert.NoError(t, err)
		assert.NotNil(t, shift)
		assert.Equal(t, shiftID, shift.ID)
		mockShiftRepo.AssertExpectations(t)
	})

	// Test case 2: No active shift found
	t.Run("No active shift found", func(t *testing.T) {
		mockShiftRepo.On("GetActiveShiftByUserID", ctx, userID).Return(&models.Shift{}, errors.New("not found")).Once()

		shift, err := useCase.GetCurrentActiveShift(ctx, userID)

		assert.Error(t, err)
		assert.Nil(t, shift)
		assert.Contains(t, err.Error(), "not found")
		mockShiftRepo.AssertExpectations(t)
	})
}

func TestShiftUseCase_EndShift(t *testing.T) {
	mockShiftRepo := new(MockShiftRepositoryForShiftUC)()
	mockUserRepo := new(MockUserRepositoryForShiftUC)()
	mockTransactionRepo := new(MockTransactionRepositoryForShiftUC)()
	useCase := NewShiftUseCase(mockShiftRepo, mockUserRepo, mockTransactionRepo)
	ctx := context.Background()

	shiftID := uuid.New()
	establishmentID := uuid.New()
	startTime := time.Now().Add(-time.Hour)
	initialCash := 500.0

	// Helper to create a basic shift
	createTestShift := func(endTime *time.Time) *models.Shift {
		return &models.Shift{ID: shiftID, EstablishmentID: establishmentID, StartTime: startTime, EndTime: endTime, InitialCash: initialCash}
	}

	// Test case 1: Successfully end shift with cash movement
	t.Run("Successfully end shift with cash movement", func(t *testing.T) {
		shift := createTestShift(nil)
		finalCash := 700.0
		comment := "Shift ended successfully"

		mockShiftRepo.On("GetByID", ctx, shiftID).Return(shift, nil).Once()
		mockShiftRepo.On("Update", ctx, mock.AnythingOfType("*models.Shift")).Return(nil).Once()
		mockTransactionRepo.On("Create", ctx, mock.AnythingOfType("*models.Transaction")).Return(nil).Once() // Incassation transaction

		updatedShift, err := useCase.EndShift(ctx, shiftID, finalCash, &comment)

		assert.NoError(t, err)
		assert.NotNil(t, updatedShift)
		assert.NotNil(t, updatedShift.EndTime)
		assert.Equal(t, finalCash, *updatedShift.FinalCash)
		assert.Equal(t, comment, *updatedShift.Comment)
		mockShiftRepo.AssertExpectations(t)
		mockTransactionRepo.AssertExpectations(t)
	})

	// Test case 2: Shift already ended
	t.Run("Shift already ended", func(t *testing.T) {
		now := time.Now()
		shift := createTestShift(&now)

		mockShiftRepo.On("GetByID", ctx, shiftID).Return(shift, nil).Once()
		mockShiftRepo.AssertNotCalled(t, "Update")
		mockTransactionRepo.AssertNotCalled(t, "Create")

		updatedShift, err := useCase.EndShift(ctx, shiftID, 0.0, nil)

		assert.Error(t, err)
		assert.Nil(t, updatedShift)
		assert.Contains(t, err.Error(), "shift already ended")
		mockShiftRepo.AssertExpectations(t)
	})

	// Test case 3: Shift not found
	t.Run("Shift not found", func(t *testing.T) {
		mockShiftRepo.On("GetByID", ctx, shiftID).Return(&models.Shift{}, errors.New("not found")).Once()

		updatedShift, err := useCase.EndShift(ctx, shiftID, 0.0, nil)

		assert.Error(t, err)
		assert.Nil(t, updatedShift)
		assert.Contains(t, err.Error(), "not found")
		mockShiftRepo.AssertExpectations(t)
	})

	// Test case 4: Update repository error
	t.Run("Update repository error", func(t *testing.T) {
		shift := createTestShift(nil)
		mockShiftRepo.On("GetByID", ctx, shiftID).Return(shift, nil).Once()
		mockShiftRepo.On("Update", ctx, mock.AnythingOfType("*models.Shift")).Return(errors.New("db error")).Once()

		updatedShift, err := useCase.EndShift(ctx, shiftID, 0.0, nil)

		assert.Error(t, err)
		assert.Nil(t, updatedShift)
		assert.Contains(t, err.Error(), "db error")
		mockShiftRepo.AssertExpectations(t)
	})

	// Test case 5: Transaction creation error
	t.Run("Transaction creation error", func(t *testing.T) {
		shift := createTestShift(nil)
		finalCash := 700.0
		comment := "Shift ended successfully"

		mockShiftRepo.On("GetByID", ctx, shiftID).Return(shift, nil).Once()
		mockShiftRepo.On("Update", ctx, mock.AnythingOfType("*models.Shift")).Return(nil).Once()
		mockTransactionRepo.On("Create", ctx, mock.AnythingOfType("*models.Transaction")).Return(errors.New("transaction db error")).Once()

		updatedShift, err := useCase.EndShift(ctx, shiftID, finalCash, &comment)

		assert.Error(t, err)
		assert.Nil(t, updatedShift)
		assert.Contains(t, err.Error(), "transaction db error")
		mockShiftRepo.AssertExpectations(t)
		mockTransactionRepo.AssertExpectations(t)
	})
}
