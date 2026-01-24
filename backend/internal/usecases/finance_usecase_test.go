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

// Mock for TransactionRepository
type MockTransactionRepositoryForFinance struct {
	mock.Mock
}

func (m *MockTransactionRepositoryForFinance) Create(ctx context.Context, transaction *models.Transaction) error {
	args := m.Called(ctx, transaction)
	return args.Error(0)
}

func (m *MockTransactionRepositoryForFinance) GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Transaction, error) {
	args := m.Called(ctx, id, establishmentID)
	return args.Get(0).(*models.Transaction), args.Error(1)
}

func (m *MockTransactionRepositoryForFinance) List(ctx context.Context, filter *repositories.TransactionFilter) ([]*models.Transaction, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).([]*models.Transaction), args.Error(1)
}

func (m *MockTransactionRepositoryForFinance) Update(ctx context.Context, transaction *models.Transaction) error {
	args := m.Called(ctx, transaction)
	return args.Error(0)
}

func (m *MockTransactionRepositoryForFinance) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

// Mock for AccountRepository
type MockAccountRepositoryForFinance struct {
	mock.Mock
}

func (m *MockAccountRepositoryForFinance) GetByID(ctx context.Context, id uuid.UUID, establishmentID *uuid.UUID) (*models.Account, error) {
	args := m.Called(ctx, id, establishmentID)
	return args.Get(0).(*models.Account), args.Error(1)
}

func (m *MockAccountRepositoryForFinance) UpdateBalance(ctx context.Context, accountID uuid.UUID, newBalance float64) error {
	args := m.Called(ctx, accountID, newBalance)
	return args.Error(0)
}

// Mock for ShiftRepository
type MockShiftRepositoryForFinance struct {
	mock.Mock
}

func (m *MockShiftRepositoryForFinance) GetByID(ctx context.Context, id uuid.UUID) (*models.Shift, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*models.Shift), args.Error(1)
}

func (m *MockShiftRepositoryForFinance) GetActiveShiftByUserID(ctx context.Context, userID uuid.UUID) (*models.Shift, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).(*models.Shift), args.Error(1)
}

func (m *MockShiftRepositoryForFinance) ListByFilter(ctx context.Context, filter *repositories.ShiftFilter) ([]*models.Shift, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).([]*models.Shift), args.Error(1)
}

func (m *MockShiftRepositoryForFinance) Create(ctx context.Context, shift *models.Shift) error {
	args := m.Called(ctx, shift)
	return args.Error(0)
}

func (m *MockShiftRepositoryForFinance) Update(ctx context.Context, shift *models.Shift) error {
	args := m.Called(ctx, shift)
	return args.Error(0)
}

func TestFinanceUseCase_CreateTransaction(t *testing.T) {
	mockTransactionRepo := new(MockTransactionRepositoryForFinance)()
	mockAccountRepo := new(MockAccountRepositoryForFinance)()
	mockShiftRepo := new(MockShiftRepositoryForFinance)()
	useCase := NewFinanceUseCase(mockTransactionRepo, mockAccountRepo, mockShiftRepo)
	ctx := context.Background()

	establishmentID := uuid.New()
	accountID := uuid.New()

	// Helper to create a basic account
	createTestAccount := func(balance float64) *models.Account {
		return &models.Account{ID: accountID, EstablishmentID: establishmentID, CurrentBalance: balance}
	}

	// Test case 1: Successfully create income transaction
	t.Run("Successfully create income transaction", func(t *testing.T) {
		account := createTestAccount(100.0)
		transaction := &models.Transaction{AccountID: accountID, Type: "income", Amount: 50.0, Category: "Sales"}

		mockAccountRepo.On("GetByID", ctx, accountID, &establishmentID).Return(account, nil).Once()
		mockTransactionRepo.On("Create", ctx, transaction).Return(nil).Once()
		mockAccountRepo.On("UpdateBalance", ctx, accountID, 150.0).Return(nil).Once()

		err := useCase.CreateTransaction(ctx, transaction, establishmentID)

		assert.NoError(t, err)
		mockAccountRepo.AssertExpectations(t)
		mockTransactionRepo.AssertExpectations(t)
	})

	// Test case 2: Successfully create expense transaction
	t.Run("Successfully create expense transaction", func(t *testing.T) {
		account := createTestAccount(200.0)
		transaction := &models.Transaction{AccountID: accountID, Type: "expense", Amount: 75.0, Category: "Rent"}

		mockAccountRepo.On("GetByID", ctx, accountID, &establishmentID).Return(account, nil).Once()
		mockTransactionRepo.On("Create", ctx, transaction).Return(nil).Once()
		mockAccountRepo.On("UpdateBalance", ctx, accountID, 125.0).Return(nil).Once()

		err := useCase.CreateTransaction(ctx, transaction, establishmentID)

		assert.NoError(t, err)
		mockAccountRepo.AssertExpectations(t)
		mockTransactionRepo.AssertExpectations(t)
	})

	// Test case 3: Account not found
	t.Run("Account not found", func(t *testing.T) {
		transaction := &models.Transaction{AccountID: uuid.New(), Type: "income", Amount: 10.0}

		mockAccountRepo.On("GetByID", ctx, mock.Anything, &establishmentID).Return(&models.Account{}, errors.New("not found")).Once()

		err := useCase.CreateTransaction(ctx, transaction, establishmentID)

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "account not found")
		mockAccountRepo.AssertExpectations(t)
	})

	// Test case 4: Insufficient balance for expense
	t.Run("Insufficient balance for expense", func(t *testing.T) {
		account := createTestAccount(50.0)
		transaction := &models.Transaction{AccountID: accountID, Type: "expense", Amount: 100.0}

		mockAccountRepo.On("GetByID", ctx, accountID, &establishmentID).Return(account, nil).Once()
		mockTransactionRepo.AssertNotCalled(t, "Create")
		mockAccountRepo.AssertNotCalled(t, "UpdateBalance")

		err := useCase.CreateTransaction(ctx, transaction, establishmentID)

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "insufficient balance")
		mockAccountRepo.AssertExpectations(t)
	})

	// Test case 5: Transaction repository error
	t.Run("Transaction repository error", func(t *testing.T) {
		account := createTestAccount(100.0)
		transaction := &models.Transaction{AccountID: accountID, Type: "income", Amount: 50.0}

		mockAccountRepo.On("GetByID", ctx, accountID, &establishmentID).Return(account, nil).Once()
		mockTransactionRepo.On("Create", ctx, transaction).Return(errors.New("db error")).Once()

		err := useCase.CreateTransaction(ctx, transaction, establishmentID)

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "db error")
		mockAccountRepo.AssertExpectations(t)
		mockTransactionRepo.AssertExpectations(t)
	})
}

func TestFinanceUseCase_GetTransaction(t *testing.T) {
	mockTransactionRepo := new(MockTransactionRepositoryForFinance)()
	mockAccountRepo := new(MockAccountRepositoryForFinance)()
	mockShiftRepo := new(MockShiftRepositoryForFinance)()
	useCase := NewFinanceUseCase(mockTransactionRepo, mockAccountRepo, mockShiftRepo)
	ctx := context.Background()

	establishmentID := uuid.New()
	transactionID := uuid.New()
	expectedTransaction := &models.Transaction{ID: transactionID, EstablishmentID: establishmentID, Amount: 100.0}

	// Test case 1: Successfully get transaction
	t.Run("Successfully get transaction", func(t *testing.T) {
		mockTransactionRepo.On("GetByID", ctx, transactionID, &establishmentID).Return(expectedTransaction, nil).Once()

		transaction, err := useCase.GetTransaction(ctx, transactionID, establishmentID)

		assert.NoError(t, err)
		assert.NotNil(t, transaction)
		assert.Equal(t, transactionID, transaction.ID)
		mockTransactionRepo.AssertExpectations(t)
	})

	// Test case 2: Transaction not found
	t.Run("Transaction not found", func(t *testing.T) {
		mockTransactionRepo.On("GetByID", ctx, transactionID, &establishmentID).Return(&models.Transaction{}, errors.New("not found")).Once()

		transaction, err := useCase.GetTransaction(ctx, transactionID, establishmentID)

		assert.Error(t, err)
		assert.Nil(t, transaction)
		mockTransactionRepo.AssertExpectations(t)
	})
}

func TestFinanceUseCase_ListTransactions(t *testing.T) {
	mockTransactionRepo := new(MockTransactionRepositoryForFinance)()
	mockAccountRepo := new(MockAccountRepositoryForFinance)()
	mockShiftRepo := new(MockShiftRepositoryForFinance)()
	useCase := NewFinanceUseCase(mockTransactionRepo, mockAccountRepo, mockShiftRepo)
	ctx := context.Background()

	establishmentID := uuid.New()
	expectedTransactions := []*models.Transaction{
		{ID: uuid.New(), EstablishmentID: establishmentID, Amount: 100.0},
		{ID: uuid.New(), EstablishmentID: establishmentID, Amount: 50.0},
	}

	// Test case 1: Successfully list transactions with filter
	t.Run("Successfully list transactions with filter", func(t *testing.T) {
		filter := &repositories.TransactionFilter{EstablishmentID: &establishmentID, Category: stringPtr("Sales")}
		mockTransactionRepo.On("List", ctx, filter).Return(expectedTransactions, nil).Once()

		transactions, err := useCase.ListTransactions(ctx, establishmentID, filter)

		assert.NoError(t, err)
		assert.NotNil(t, transactions)
		assert.Len(t, transactions, 2)
		mockTransactionRepo.AssertExpectations(t)
	})

	// Test case 2: No transactions found
	t.Run("No transactions found", func(t *testing.T) {
		filter := &repositories.TransactionFilter{EstablishmentID: &establishmentID, Category: stringPtr("Other")}
		mockTransactionRepo.On("List", ctx, filter).Return([]*models.Transaction{}, nil).Once()

		transactions, err := useCase.ListTransactions(ctx, establishmentID, filter)

		assert.NoError(t, err)
		assert.NotNil(t, transactions)
		assert.Len(t, transactions, 0)
		mockTransactionRepo.AssertExpectations(t)
	})
}

func TestFinanceUseCase_UpdateTransaction(t *testing.T) {
	mockTransactionRepo := new(MockTransactionRepositoryForFinance)()
	mockAccountRepo := new(MockAccountRepositoryForFinance)()
	mockShiftRepo := new(MockShiftRepositoryForFinance)()
	useCase := NewFinanceUseCase(mockTransactionRepo, mockAccountRepo, mockShiftRepo)
	ctx := context.Background()

	establishmentID := uuid.New()
	transactionID := uuid.New()
	oldAccountID := uuid.New()
	newAccountID := uuid.New()

	// Helper to create basic accounts
	createOldAccount := func(balance float64) *models.Account {
		return &models.Account{ID: oldAccountID, EstablishmentID: establishmentID, CurrentBalance: balance}
	}
	createNewAccount := func(balance float64) *models.Account {
		return &models.Account{ID: newAccountID, EstablishmentID: establishmentID, CurrentBalance: balance}
	}

	// Test case 1: Successfully update income transaction, account not changed
	t.Run("Successfully update income transaction, account not changed", func(t *testing.T) {
		oldTransaction := &models.Transaction{ID: transactionID, AccountID: oldAccountID, Type: "income", Amount: 100.0, EstablishmentID: establishmentID}
		updatedTransaction := &models.Transaction{ID: transactionID, AccountID: oldAccountID, Type: "income", Amount: 120.0, EstablishmentID: establishmentID}
		oldAccount := createOldAccount(500.0)

		mockTransactionRepo.On("GetByID", ctx, transactionID, &establishmentID).Return(oldTransaction, nil).Once()
		mockAccountRepo.On("GetByID", ctx, oldAccountID, mock.Anything).Return(oldAccount, nil).Times(2) // Old and new account fetch
		mockAccountRepo.On("UpdateBalance", ctx, oldAccountID, 400.0).Return(nil).Once() // Revert old balance
		mockAccountRepo.On("UpdateBalance", ctx, oldAccountID, 520.0).Return(nil).Once() // Apply new balance
		mockTransactionRepo.On("Update", ctx, updatedTransaction).Return(nil).Once()

		err := useCase.UpdateTransaction(ctx, updatedTransaction, establishmentID)

		assert.NoError(t, err)
		mockTransactionRepo.AssertExpectations(t)
		mockAccountRepo.AssertExpectations(t)
	})

	// Test case 2: Successfully update expense transaction, account changed
	t.Run("Successfully update expense transaction, account changed", func(t *testing.T) {
		oldTransaction := &models.Transaction{ID: transactionID, AccountID: oldAccountID, Type: "expense", Amount: 80.0, EstablishmentID: establishmentID}
		updatedTransaction := &models.Transaction{ID: transactionID, AccountID: newAccountID, Type: "expense", Amount: 90.0, EstablishmentID: establishmentID}
		oldAccount := createOldAccount(300.0)
		newAccount := createNewAccount(200.0)

		mockTransactionRepo.On("GetByID", ctx, transactionID, &establishmentID).Return(oldTransaction, nil).Once()
		mockAccountRepo.On("GetByID", ctx, newAccountID, &establishmentID).Return(newAccount, nil).Once()
		mockAccountRepo.On("GetByID", ctx, oldAccountID, mock.Anything).Return(oldAccount, nil).Once()
		mockAccountRepo.On("UpdateBalance", ctx, oldAccountID, 380.0).Return(nil).Once()
		mockAccountRepo.On("GetByID", ctx, newAccountID, mock.Anything).Return(newAccount, nil).Once()
		mockAccountRepo.On("UpdateBalance", ctx, newAccountID, 110.0).Return(nil).Once() // 200 - 90 = 110
		mockTransactionRepo.On("Update", ctx, updatedTransaction).Return(nil).Once()

		err := useCase.UpdateTransaction(ctx, updatedTransaction, establishmentID)

		assert.NoError(t, err)
		mockTransactionRepo.AssertExpectations(t)
		mockAccountRepo.AssertExpectations(t)
	})

	// Test case 3: Transaction not found
	t.Run("Transaction not found", func(t *testing.T) {
		updatedTransaction := &models.Transaction{ID: transactionID, Amount: 10.0}
		mockTransactionRepo.On("GetByID", ctx, transactionID, &establishmentID).Return(&models.Transaction{}, errors.New("not found")).Once()

		err := useCase.UpdateTransaction(ctx, updatedTransaction, establishmentID)

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "transaction not found")
		mockTransactionRepo.AssertExpectations(t)
	})
}

func TestFinanceUseCase_DeleteTransaction(t *testing.T) {
	mockTransactionRepo := new(MockTransactionRepositoryForFinance)()
	mockAccountRepo := new(MockAccountRepositoryForFinance)()
	mockShiftRepo := new(MockShiftRepositoryForFinance)()
	useCase := NewFinanceUseCase(mockTransactionRepo, mockAccountRepo, mockShiftRepo)
	ctx := context.Background()

	establishmentID := uuid.New()
	transactionID := uuid.New()
	accountID := uuid.New()

	// Helper to create a basic account
	createTestAccount := func(balance float64) *models.Account {
		return &models.Account{ID: accountID, EstablishmentID: establishmentID, CurrentBalance: balance}
	}

	// Test case 1: Successfully delete income transaction
	t.Run("Successfully delete income transaction", func(t *testing.T) {
		transaction := &models.Transaction{ID: transactionID, AccountID: accountID, Type: "income", Amount: 100.0, EstablishmentID: establishmentID}
		account := createTestAccount(500.0)

		mockTransactionRepo.On("GetByID", ctx, transactionID, &establishmentID).Return(transaction, nil).Once()
		mockAccountRepo.On("GetByID", ctx, accountID, mock.Anything).Return(account, nil).Once()
		mockAccountRepo.On("UpdateBalance", ctx, accountID, 400.0).Return(nil).Once() // 500 - 100 = 400
		mockTransactionRepo.On("Delete", ctx, transactionID).Return(nil).Once()

		err := useCase.DeleteTransaction(ctx, transactionID, establishmentID)

		assert.NoError(t, err)
		mockTransactionRepo.AssertExpectations(t)
		mockAccountRepo.AssertExpectations(t)
	})

	// Test case 2: Successfully delete expense transaction
	t.Run("Successfully delete expense transaction", func(t *testing.T) {
		transaction := &models.Transaction{ID: transactionID, AccountID: accountID, Type: "expense", Amount: 50.0, EstablishmentID: establishmentID}
		account := createTestAccount(300.0)

		mockTransactionRepo.On("GetByID", ctx, transactionID, &establishmentID).Return(transaction, nil).Once()
		mockAccountRepo.On("GetByID", ctx, accountID, mock.Anything).Return(account, nil).Once()
		mockAccountRepo.On("UpdateBalance", ctx, accountID, 350.0).Return(nil).Once() // 300 + 50 = 350
		mockTransactionRepo.On("Delete", ctx, transactionID).Return(nil).Once()

		err := useCase.DeleteTransaction(ctx, transactionID, establishmentID)

		assert.NoError(t, err)
		mockTransactionRepo.AssertExpectations(t)
		mockAccountRepo.AssertExpectations(t)
	})

	// Test case 3: Transaction not found
	t.Run("Transaction not found", func(t *testing.T) {
		mockTransactionRepo.On("GetByID", ctx, transactionID, &establishmentID).Return(&models.Transaction{}, errors.New("not found")).Once()

		err := useCase.DeleteTransaction(ctx, transactionID, establishmentID)

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "transaction not found")
		mockTransactionRepo.AssertExpectations(t)
	})
}

func TestFinanceUseCase_GetTotalTransactionsAmount(t *testing.T) {
	mockTransactionRepo := new(MockTransactionRepositoryForFinance)()
	mockAccountRepo := new(MockAccountRepositoryForFinance)()
	mockShiftRepo := new(MockShiftRepositoryForFinance)()
	useCase := NewFinanceUseCase(mockTransactionRepo, mockAccountRepo, mockShiftRepo)
	ctx := context.Background()

	establishmentID := uuid.New()
	
	// Test case 1: Successfully get total amount
	t.Run("Successfully get total amount", func(t *testing.T) {
		filter := &repositories.TransactionFilter{EstablishmentID: &establishmentID}
		transactions := []*models.Transaction{
			{ID: uuid.New(), Amount: 100.0},
			{ID: uuid.New(), Amount: -50.0},
			{ID: uuid.New(), Amount: 200.0},
		}
		mockTransactionRepo.On("List", ctx, filter).Return(transactions, nil).Once()

		total, err := useCase.GetTotalTransactionsAmount(ctx, establishmentID, filter)

		assert.NoError(t, err)
		assert.Equal(t, 250.0, total)
		mockTransactionRepo.AssertExpectations(t)
	})

	// Test case 2: No transactions
	t.Run("No transactions", func(t *testing.T) {
		filter := &repositories.TransactionFilter{EstablishmentID: &establishmentID}
		mockTransactionRepo.On("List", ctx, filter).Return([]*models.Transaction{}, nil).Once()

		total, err := useCase.GetTotalTransactionsAmount(ctx, establishmentID, filter)

		assert.NoError(t, err)
		assert.Equal(t, 0.0, total)
		mockTransactionRepo.AssertExpectations(t)
	})

	// Test case 3: Repository error
	t.Run("Repository error", func(t *testing.T) {
		filter := &repositories.TransactionFilter{EstablishmentID: &establishmentID}
		expectedErr := errors.New("db error")
		mockTransactionRepo.On("List", ctx, filter).Return([]*models.Transaction{}, expectedErr).Once()

		total, err := useCase.GetTotalTransactionsAmount(ctx, establishmentID, filter)

		assert.Error(t, err)
		assert.Equal(t, 0.0, total)
		assert.Contains(t, err.Error(), "db error")
		mockTransactionRepo.AssertExpectations(t)
	})
}

func TestFinanceUseCase_GenerateShiftReport(t *testing.T) {
	mockTransactionRepo := new(MockTransactionRepositoryForFinance)()
	mockAccountRepo := new(MockAccountRepositoryForFinance)()
	mockShiftRepo := new(MockShiftRepositoryForFinance)()
	useCase := NewFinanceUseCase(mockTransactionRepo, mockAccountRepo, mockShiftRepo)
	ctx := context.Background()

	establishmentID := uuid.New()
	userID := uuid.New()
	shiftID := uuid.New()
	startDate := time.Date(2026, time.January, 1, 9, 0, 0, 0, time.UTC)
	endDate := time.Date(2026, time.January, 1, 18, 0, 0, 0, time.UTC)

	// Helper for filter
	createFilter := func(employeeID *uuid.UUID, includeProducts bool) usecases.ShiftReportFilter {
		return usecases.ShiftReportFilter{
			StartDate:       startDate,
			EndDate:         endDate,
			EmployeeID:      employeeID,
			IncludeProducts: includeProducts,
		}
	}

	// Test case 1: Successfully generate report with one shift
	t.Run("Successfully generate report with one shift", func(t *testing.T) {
		shift := &models.Shift{ID: shiftID, UserID: userID, StartTime: startDate, EndTime: &endDate, InitialCash: 1000.0, FinalCash: floatPtr(1500.0), EstablishmentID: establishmentID, User: &models.User{Name: "Test Cashier"}}
		transactions := []*models.Transaction{
			{ID: uuid.New(), Type: "income", Amount: 700.0, EstablishmentID: establishmentID, TransactionDate: startDate.Add(time.Hour)},
			{ID: uuid.New(), Type: "expense", Amount: 200.0, EstablishmentID: establishmentID, TransactionDate: startDate.Add(2 * time.Hour), Category: "Discount"},
			{ID: uuid.New(), Type: "income", Amount: 50.0, EstablishmentID: establishmentID, TransactionDate: startDate.Add(3 * time.Hour), Category: "CashPayment"},
			{ID: uuid.New(), Type: "income", Amount: 50.0, EstablishmentID: establishmentID, TransactionDate: startDate.Add(4 * time.Hour), Category: "CardPayment"},
		}

		mockShiftRepo.On("ListByFilter", ctx, &repositories.ShiftFilter{EstablishmentID: &establishmentID, UserID: &userID, StartDate: &startDate, EndDate: &endDate}).Return([]*models.Shift{shift}, nil).Once()
		mockTransactionRepo.On("List", ctx, &repositories.TransactionFilter{EstablishmentID: &establishmentID, StartDate: &shift.StartTime, EndDate: shift.EndTime, ShiftID: &shift.ID}).Return(transactions, nil).Once()

		report, err := useCase.GenerateShiftReport(ctx, establishmentID, createFilter(&userID, false))

		assert.NoError(t, err)
		assert.NotNil(t, report)
		assert.Equal(t, shiftID, report.ShiftID)
		assert.Equal(t, userID, report.UserID)
		assert.Equal(t, "Test Cashier", report.UserName)
		assert.Equal(t, startDate, report.StartTime)
		assert.Equal(t, *shift.FinalCash, *report.FinalCash)
		assert.Equal(t, 550.0, report.TotalAmount)      // 700 + 50 + 50 = 800 (income)
		assert.Equal(t, 200.0, report.TotalDiscounts) // 200 (expense)
		assert.Equal(t, 50.0+50.0, report.CashPayments+report.CardPayments) // TODO: Refine this logic to use specific transaction categories for payments
		mockShiftRepo.AssertExpectations(t)
		mockTransactionRepo.AssertExpectations(t)
	})

	// Test case 2: No shifts found
	t.Run("No shifts found", func(t *testing.T) {
		mockShiftRepo.On("ListByFilter", ctx, &repositories.ShiftFilter{EstablishmentID: &establishmentID, UserID: &userID, StartDate: &startDate, EndDate: &endDate}).Return([]*models.Shift{}, nil).Once()

		report, err := useCase.GenerateShiftReport(ctx, establishmentID, createFilter(&userID, false))

		assert.Error(t, err)
		assert.Nil(t, report)
		assert.Contains(t, err.Error(), "no shifts found")
		mockShiftRepo.AssertExpectations(t)
	})

	// Test case 3: Shift repository error
	t.Run("Shift repository error", func(t *testing.T) {
		expectedErr := errors.New("shift db error")
		mockShiftRepo.On("ListByFilter", ctx, &repositories.ShiftFilter{EstablishmentID: &establishmentID, UserID: &userID, StartDate: &startDate, EndDate: &endDate}).Return([]*models.Shift{}, expectedErr).Once()

		report, err := useCase.GenerateShiftReport(ctx, establishmentID, createFilter(&userID, false))

		assert.Error(t, err)
		assert.Nil(t, report)
		assert.Contains(t, err.Error(), "shift db error")
		mockShiftRepo.AssertExpectations(t)
	})

	// Test case 4: Transaction repository error
	t.Run("Transaction repository error", func(t *testing.T) {
		shift := &models.Shift{ID: shiftID, UserID: userID, StartTime: startDate, EndTime: &endDate, InitialCash: 1000.0, FinalCash: floatPtr(1500.0), EstablishmentID: establishmentID, User: &models.User{Name: "Test Cashier"}}
		expectedErr := errors.New("transaction db error")

		mockShiftRepo.On("ListByFilter", ctx, &repositories.ShiftFilter{EstablishmentID: &establishmentID, UserID: &userID, StartDate: &startDate, EndDate: &endDate}).Return([]*models.Shift{shift}, nil).Once()
		mockTransactionRepo.On("List", ctx, &repositories.TransactionFilter{EstablishmentID: &establishmentID, StartDate: &shift.StartTime, EndDate: shift.EndTime, ShiftID: &shift.ID}).Return([]*models.Transaction{}, expectedErr).Once()

		report, err := useCase.GenerateShiftReport(ctx, establishmentID, createFilter(&userID, false))

		assert.Error(t, err)
		assert.Nil(t, report)
		assert.Contains(t, err.Error(), "transaction db error")
		mockShiftRepo.AssertExpectations(t)
		mockTransactionRepo.AssertExpectations(t)
	})
}

func stringPtr(s string) *string {
	return &s
}

func floatPtr(f float64) *float64 {
	return &f
}