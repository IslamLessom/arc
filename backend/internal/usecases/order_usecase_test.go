package usecases

import (
	"context"
	"errors"
	"fmt"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

// MockOrderRepository is a mock implementation of repositories.OrderRepository
type MockOrderRepository struct {
	mock.Mock
}

func (m *MockOrderRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Order, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*models.Order), args.Error(1)
}

func (m *MockOrderRepository) List(ctx context.Context) ([]*models.Order, error) {
	args := m.Called(ctx)
	return args.Get(0).([]*models.Order), args.Error(1)
}

func (m *MockOrderRepository) ListActiveByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Order, error) {
	args := m.Called(ctx, establishmentID)
	return args.Get(0).([]*models.Order), args.Error(1)
}

func (m *MockOrderRepository) Create(ctx context.Context, order *models.Order) error {
	args := m.Called(ctx, order)
	return args.Error(0)
}

func (m *MockOrderRepository) Update(ctx context.Context, order *models.Order) error {
	args := m.Called(ctx, order)
	return args.Error(0)
}

func (m *MockOrderRepository) CreateOrderItem(ctx context.Context, item *models.OrderItem) error {
	args := m.Called(ctx, item)
	return args.Error(0)
}

func (m *MockOrderRepository) UpdateOrderItem(ctx context.Context, item *models.OrderItem) error {
	args := m.Called(ctx, item)
	return args.Error(0)
}

// MockTransactionRepository is a mock implementation of repositories.TransactionRepository
type MockTransactionRepository struct {
	mock.Mock
}

func (m *MockTransactionRepository) Create(ctx context.Context, transaction *models.Transaction) error {
	args := m.Called(ctx, transaction)
	return args.Error(0)
}

// MockWarehouseRepository is a mock implementation of repositories.WarehouseRepository
type MockWarehouseRepository struct {
	mock.Mock
}

func (m *MockWarehouseRepository) GetProductByID(ctx context.Context, id uuid.UUID) (*models.Product, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*models.Product), args.Error(1)
}

func (m *MockWarehouseRepository) GetTechCardByID(ctx context.Context, id uuid.UUID) (*models.TechCard, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*models.TechCard), args.Error(1)
}

func TestOrderUseCase_CreateOrder(t *testing.T) {
	mockOrderRepo := new(MockOrderRepository)
	mockWarehouseRepo := new(MockWarehouseRepository)
	useCase := NewOrderUseCase(mockOrderRepo, mockWarehouseRepo)
	ctx := context.Background()

	establishmentID := uuid.New()
	tableID := uuid.New()
	productID := uuid.New()
	techCardID := uuid.New()

	// Test case 1: Successfully create order with product
	t.Run("Successfully create order with product", func(t *testing.T) {
		items := []models.OrderItem{
			{ProductID: &productID, Quantity: 2, GuestNumber: intPtr(1)},
		}
		product := &models.Product{ID: productID, Price: 10.0}
		mockWarehouseRepo.On("GetProductByID", ctx, productID).Return(product, nil).Once()
		mockOrderRepo.On("Create", ctx, mock.AnythingOfType("*models.Order")).Return(nil).Once()

		order, err := useCase.CreateOrder(ctx, establishmentID, &tableID, items)

		assert.NoError(t, err)
		assert.NotNil(t, order)
		assert.Equal(t, 20.0, order.TotalAmount)
		assert.Equal(t, 10.0, order.Items[0].Price)
		mockWarehouseRepo.AssertExpectations(t)
		mockOrderRepo.AssertExpectations(t)
	})

	// Test case 2: Successfully create order with tech card
	t.Run("Successfully create order with tech card", func(t *testing.T) {
		items := []models.OrderItem{
			{TechCardID: &techCardID, Quantity: 1, GuestNumber: intPtr(1)},
		}
		techCard := &models.TechCard{ID: techCardID, Price: 15.0}
		mockWarehouseRepo.On("GetTechCardByID", ctx, techCardID).Return(techCard, nil).Once()
		mockOrderRepo.On("Create", ctx, mock.AnythingOfType("*models.Order")).Return(nil).Once()

		order, err := useCase.CreateOrder(ctx, establishmentID, &tableID, items)

		assert.NoError(t, err)
		assert.NotNil(t, order)
		assert.Equal(t, 15.0, order.TotalAmount)
		assert.Equal(t, 15.0, order.Items[0].Price)
		mockWarehouseRepo.AssertExpectations(t)
		mockOrderRepo.AssertExpectations(t)
	})

	// Test case 3: Product not found
	t.Run("Product not found", func(t *testing.T) {
		items := []models.OrderItem{
			{ProductID: &productID, Quantity: 1, GuestNumber: intPtr(1)},
		}
		mockWarehouseRepo.On("GetProductByID", ctx, productID).Return(&models.Product{}, errors.New("product not found")).Once()

		order, err := useCase.CreateOrder(ctx, establishmentID, &tableID, items)

		assert.Error(t, err)
		assert.Nil(t, order)
		assert.Contains(t, err.Error(), "product not found")
		mockWarehouseRepo.AssertExpectations(t)
	})

	// Test case 4: Tech card not found
	t.Run("Tech card not found", func(t *testing.T) {
		items := []models.OrderItem{
			{TechCardID: &techCardID, Quantity: 1, GuestNumber: intPtr(1)},
		}
		mockWarehouseRepo.On("GetTechCardByID", ctx, techCardID).Return(&models.TechCard{}, errors.New("tech card not found")).Once()
		mockWarehouseRepo.On("GetProductByID", ctx, mock.Anything).Return(&models.Product{}, errors.New("product not found")).Maybe()

		order, err := useCase.CreateOrder(ctx, establishmentID, &tableID, items)

		assert.Error(t, err)
		assert.Nil(t, order)
		assert.Contains(t, err.Error(), "tech card not found")
		mockWarehouseRepo.AssertExpectations(t)
	})

	// Test case 5: No product or tech card
	t.Run("No product or tech card", func(t *testing.T) {
		items := []models.OrderItem{
			{Quantity: 1, GuestNumber: intPtr(1)},
		}

		order, err := useCase.CreateOrder(ctx, establishmentID, &tableID, items)

		assert.Error(t, err)
		assert.Nil(t, order)
		assert.Contains(t, err.Error(), "order item must have a product or tech card")
	})

	// Test case 6: Repository error on create
	t.Run("Repository error on create", func(t *testing.T) {
		items := []models.OrderItem{
			{ProductID: &productID, Quantity: 1, GuestNumber: intPtr(1)},
		}
		product := &models.Product{ID: productID, Price: 10.0}
		mockWarehouseRepo.On("GetProductByID", ctx, productID).Return(product, nil).Once()
		mockOrderRepo.On("Create", ctx, mock.AnythingOfType("*models.Order")).Return(errors.New("db error")).Once()

		order, err := useCase.CreateOrder(ctx, establishmentID, &tableID, items)

		assert.Error(t, err)
		assert.Nil(t, order)
		assert.Contains(t, err.Error(), "db error")
		mockWarehouseRepo.AssertExpectations(t)
		mockOrderRepo.AssertExpectations(t)
	})
}

func TestOrderUseCase_GetActiveOrdersByEstablishment(t *testing.T) {
	mockOrderRepo := new(MockOrderRepository)
	mockWarehouseRepo := new(MockWarehouseRepository)
	useCase := NewOrderUseCase(mockOrderRepo, mockWarehouseRepo)
	ctx := context.Background()

	establishmentID := uuid.New()

	// Test case 1: Successfully get active orders
	t.Run("Successfully get active orders", func(t *testing.T) {
		expectedOrders := []*models.Order{
			{ID: uuid.New(), EstablishmentID: establishmentID, Status: "draft"},
			{ID: uuid.New(), EstablishmentID: establishmentID, Status: "confirmed"},
		}
		mockOrderRepo.On("ListActiveByEstablishmentID", ctx, establishmentID).Return(expectedOrders, nil).Once()

		orders, err := useCase.GetActiveOrdersByEstablishment(ctx, establishmentID)

		assert.NoError(t, err)
		assert.NotNil(t, orders)
		assert.Len(t, orders, 2)
		mockOrderRepo.AssertExpectations(t)
	})

	// Test case 2: No active orders
	t.Run("No active orders", func(t *testing.T) {
		mockOrderRepo.On("ListActiveByEstablishmentID", ctx, establishmentID).Return([]*models.Order{}, nil).Once()

		orders, err := useCase.GetActiveOrdersByEstablishment(ctx, establishmentID)

		assert.NoError(t, err)
		assert.NotNil(t, orders)
		assert.Len(t, orders, 0)
		mockOrderRepo.AssertExpectations(t)
	})

	// Test case 3: Repository error
	t.Run("Repository error", func(t *testing.T) {
		expectedErr := errors.New("db error")
		mockOrderRepo.On("ListActiveByEstablishmentID", ctx, establishmentID).Return([]*models.Order{}, expectedErr).Once()

		orders, err := useCase.GetActiveOrdersByEstablishment(ctx, establishmentID)

		assert.Error(t, err)
		assert.Nil(t, orders)
		assert.Contains(t, err.Error(), "db error")
		mockOrderRepo.AssertExpectations(t)
	})
}

func TestOrderUseCase_AddOrderItem(t *testing.T) {
	mockOrderRepo := new(MockOrderRepository)
	mockWarehouseRepo := new(MockWarehouseRepository)
	useCase := NewOrderUseCase(mockOrderRepo, mockWarehouseRepo)
	ctx := context.Background()

	orderID := uuid.New()
	productID := uuid.New()
	techCardID := uuid.New()

	// Helper function for creating an order
	createTestOrder := func() *models.Order {
		return &models.Order{
			ID:              orderID,
			EstablishmentID: uuid.New(),
			Status:          "draft",
			TotalAmount:     0.0,
			Items:           []models.OrderItem{},
		}
	}

	// Test case 1: Successfully add product item
	t.Run("Successfully add product item", func(t *testing.T) {
		order := createTestOrder()
		itemToAdd := models.OrderItem{ProductID: &productID, Quantity: 1, GuestNumber: intPtr(1)}
		product := &models.Product{ID: productID, Price: 10.0}

		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()
		mockWarehouseRepo.On("GetProductByID", ctx, productID).Return(product, nil).Once()
		mockOrderRepo.On("Update", ctx, mock.AnythingOfType("*models.Order")).Return(nil).Once()

		updatedOrder, err := useCase.AddOrderItem(ctx, orderID, itemToAdd)

		assert.NoError(t, err)
		assert.NotNil(t, updatedOrder)
		assert.Len(t, updatedOrder.Items, 1)
		assert.Equal(t, 10.0, updatedOrder.TotalAmount)
		assert.Equal(t, 10.0, updatedOrder.Items[0].Price)
		mockOrderRepo.AssertExpectations(t)
		mockWarehouseRepo.AssertExpectations(t)
	})

	// Test case 2: Successfully add tech card item
	t.Run("Successfully add tech card item", func(t *testing.T) {
		order := createTestOrder()
		itemToAdd := models.OrderItem{TechCardID: &techCardID, Quantity: 2, GuestNumber: intPtr(1)}
		techCard := &models.TechCard{ID: techCardID, Price: 15.0}

		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()
		mockWarehouseRepo.On("GetTechCardByID", ctx, techCardID).Return(techCard, nil).Once()
		mockOrderRepo.On("Update", ctx, mock.AnythingOfType("*models.Order")).Return(nil).Once()

		updatedOrder, err := useCase.AddOrderItem(ctx, orderID, itemToAdd)

		assert.NoError(t, err)
		assert.NotNil(t, updatedOrder)
		assert.Len(t, updatedOrder.Items, 1)
		assert.Equal(t, 30.0, updatedOrder.TotalAmount)
		assert.Equal(t, 15.0, updatedOrder.Items[0].Price)
		mockOrderRepo.AssertExpectations(t)
		mockWarehouseRepo.AssertExpectations(t)
	})

	// Test case 3: Order not found
	t.Run("Order not found", func(t *testing.T) {
		itemToAdd := models.OrderItem{ProductID: &productID, Quantity: 1, GuestNumber: intPtr(1)}
		mockOrderRepo.On("GetByID", ctx, orderID).Return(&models.Order{}, errors.New("order not found")).Once()

		updatedOrder, err := useCase.AddOrderItem(ctx, orderID, itemToAdd)

		assert.Error(t, err)
		assert.Nil(t, updatedOrder)
		assert.Contains(t, err.Error(), "order not found")
		mockOrderRepo.AssertExpectations(t)
	})

	// Test case 4: Product not found for item
	t.Run("Product not found for item", func(t *testing.T) {
		order := createTestOrder()
		itemToAdd := models.OrderItem{ProductID: &productID, Quantity: 1, GuestNumber: intPtr(1)}
		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()
		mockWarehouseRepo.On("GetProductByID", ctx, productID).Return(&models.Product{}, errors.New("product not found")).Once()

		updatedOrder, err := useCase.AddOrderItem(ctx, orderID, itemToAdd)

		assert.Error(t, err)
		assert.Nil(t, updatedOrder)
		assert.Contains(t, err.Error(), "product not found")
		mockOrderRepo.AssertExpectations(t)
		mockWarehouseRepo.AssertExpectations(t)
	})

	// Test case 5: Update repository error
	t.Run("Update repository error", func(t *testing.T) {
		order := createTestOrder()
		itemToAdd := models.OrderItem{ProductID: &productID, Quantity: 1, GuestNumber: intPtr(1)}
		product := &models.Product{ID: productID, Price: 10.0}

		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()
		mockWarehouseRepo.On("GetProductByID", ctx, productID).Return(product, nil).Once()
		mockOrderRepo.On("Update", ctx, mock.AnythingOfType("*models.Order")).Return(errors.New("db error")).Once()

		updatedOrder, err := useCase.AddOrderItem(ctx, orderID, itemToAdd)

		assert.Error(t, err)
		assert.Nil(t, updatedOrder)
		assert.Contains(t, err.Error(), "db error")
		mockOrderRepo.AssertExpectations(t)
		mockWarehouseRepo.AssertExpectations(t)
	})
}

func TestOrderUseCase_UpdateOrderItemQuantity(t *testing.T) {
	mockOrderRepo := new(MockOrderRepository)
	mockWarehouseRepo := new(MockWarehouseRepository)
	useCase := NewOrderUseCase(mockOrderRepo, mockWarehouseRepo)
	ctx := context.Background()

	orderID := uuid.New()
	itemID := uuid.New()
	productID := uuid.New()

	// Helper function for creating an order with items
	createTestOrderWithItems := func() *models.Order {
		return &models.Order{
			ID:              orderID,
			EstablishmentID: uuid.New(),
			Status:          "draft",
			TotalAmount:     20.0,
			Items: []models.OrderItem{
				{ID: itemID, ProductID: &productID, Quantity: 2, Price: 10.0, TotalPrice: 20.0, GuestNumber: intPtr(1)},
			},
		}
	}

	// Test case 1: Successfully update item quantity
	t.Run("Successfully update item quantity", func(t *testing.T) {
		order := createTestOrderWithItems()
		newQuantity := 3

		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()
		mockOrderRepo.On("Update", ctx, mock.AnythingOfType("*models.Order")).Return(nil).Once()

		updatedOrder, err := useCase.UpdateOrderItemQuantity(ctx, orderID, itemID, newQuantity)

		assert.NoError(t, err)
		assert.NotNil(t, updatedOrder)
		assert.Equal(t, newQuantity, updatedOrder.Items[0].Quantity)
		assert.Equal(t, 30.0, updatedOrder.Items[0].TotalPrice)
		assert.Equal(t, 30.0, updatedOrder.TotalAmount)
		mockOrderRepo.AssertExpectations(t)
	})

	// Test case 2: Order not found
	t.Run("Order not found", func(t *testing.T) {
		newQuantity := 3
		mockOrderRepo.On("GetByID", ctx, orderID).Return(&models.Order{}, errors.New("order not found")).Once()

		updatedOrder, err := useCase.UpdateOrderItemQuantity(ctx, orderID, itemID, newQuantity)

		assert.Error(t, err)
		assert.Nil(t, updatedOrder)
		assert.Contains(t, err.Error(), "order not found")
		mockOrderRepo.AssertExpectations(t)
	})

	// Test case 3: Order item not found
	t.Run("Order item not found", func(t *testing.T) {
		order := createTestOrderWithItems()
		nonExistentItemID := uuid.New()
		newQuantity := 3

		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()

		updatedOrder, err := useCase.UpdateOrderItemQuantity(ctx, orderID, nonExistentItemID, newQuantity)

		assert.Error(t, err)
		assert.Nil(t, updatedOrder)
		assert.Contains(t, err.Error(), "order item not found")
		mockOrderRepo.AssertExpectations(t)
	})

	// Test case 4: Update repository error
	t.Run("Update repository error", func(t *testing.T) {
		order := createTestOrderWithItems()
		newQuantity := 3
		expectedErr := errors.New("db error")

		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()
		mockOrderRepo.On("Update", ctx, mock.AnythingOfType("*models.Order")).Return(expectedErr).Once()

		updatedOrder, err := useCase.UpdateOrderItemQuantity(ctx, orderID, itemID, newQuantity)

		assert.Error(t, err)
		assert.Nil(t, updatedOrder)
		assert.Contains(t, err.Error(), "db error")
		mockOrderRepo.AssertExpectations(t)
	})
}

func intPtr(i int) *int {
	return &i
}

func TestOrderUseCase_ProcessOrderPayment(t *testing.T) {
	mockOrderRepo := new(MockOrderRepository)
	mockWarehouseRepo := new(MockWarehouseRepository)
	mockTransactionRepo := new(MockTransactionRepository)
	useCase := NewOrderUseCase(mockOrderRepo, mockWarehouseRepo, mockTransactionRepo)
	ctx := context.Background()

	orderID := uuid.New()
	establishmentID := uuid.New()

	// Helper function to create a test order
	createTestOrderForPayment := func(total float64) *models.Order {
		return &models.Order{
			ID:              orderID,
			EstablishmentID: establishmentID,
			Status:          "draft",
			TotalAmount:     total,
			PaymentStatus:   "pending",
			Items:           []models.OrderItem{},
		}
	}

	// Test case 1: Successfully pay with cash, no change
	t.Run("Successfully pay with cash, no change", func(t *testing.T) {
		order := createTestOrderForPayment(100.0)
		cashAmount := 100.0
		cardAmount := 0.0
		clientCash := 100.0

		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()
		mockOrderRepo.On("Update", ctx, mock.AnythingOfType("*models.Order")).Return(nil).Once()
		mockTransactionRepo.On("Create", ctx, mock.AnythingOfType("*models.Transaction")).Return(nil).Once()

		updatedOrder, err := useCase.ProcessOrderPayment(ctx, orderID, cashAmount, cardAmount, clientCash)

		assert.NoError(t, err)
		assert.NotNil(t, updatedOrder)
		assert.Equal(t, "paid", updatedOrder.Status)
		assert.Equal(t, "paid", updatedOrder.PaymentStatus)
		assert.Equal(t, cashAmount, updatedOrder.CashAmount)
		assert.Equal(t, cardAmount, updatedOrder.CardAmount)
		assert.Equal(t, 0.0, updatedOrder.ChangeAmount) // No change
		mockOrderRepo.AssertExpectations(t)
		mockTransactionRepo.AssertExpectations(t)
	})

	// Test case 2: Successfully pay with cash, with change
	t.Run("Successfully pay with cash, with change", func(t *testing.T) {
		order := createTestOrderForPayment(80.0)
		cashAmount := 80.0
		cardAmount := 0.0
		clientCash := 100.0

		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()
		mockOrderRepo.On("Update", ctx, mock.AnythingOfType("*models.Order")).Return(nil).Once()
		mockTransactionRepo.On("Create", ctx, mock.AnythingOfType("*models.Transaction")).Return(nil).Once()

		updatedOrder, err := useCase.ProcessOrderPayment(ctx, orderID, cashAmount, cardAmount, clientCash)

		assert.NoError(t, err)
		assert.NotNil(t, updatedOrder)
		assert.Equal(t, 20.0, updatedOrder.ChangeAmount)
		mockOrderRepo.AssertExpectations(t)
		mockTransactionRepo.AssertExpectations(t)
	})

	// Test case 3: Successfully pay with card
	t.Run("Successfully pay with card", func(t *testing.T) {
		order := createTestOrderForPayment(120.0)
		cashAmount := 0.0
		cardAmount := 120.0
		clientCash := 0.0

		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()
		mockOrderRepo.On("Update", ctx, mock.AnythingOfType("*models.Order")).Return(nil).Once()
		mockTransactionRepo.On("Create", ctx, mock.AnythingOfType("*models.Transaction")).Return(nil).Once()

		updatedOrder, err := useCase.ProcessOrderPayment(ctx, orderID, cashAmount, cardAmount, clientCash)

		assert.NoError(t, err)
		assert.NotNil(t, updatedOrder)
		assert.Equal(t, "paid", updatedOrder.Status)
		assert.Equal(t, cardAmount, updatedOrder.CardAmount)
		mockOrderRepo.AssertExpectations(t)
		mockTransactionRepo.AssertExpectations(t)
	})

	// Test case 4: Successfully pay with mixed methods
	t.Run("Successfully pay with mixed methods", func(t *testing.T) {
		order := createTestOrderForPayment(150.0)
		cashAmount := 50.0
		cardAmount := 100.0
		clientCash := 50.0

		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()
		mockOrderRepo.On("Update", ctx, mock.AnythingOfType("*models.Order")).Return(nil).Once()
		mockTransactionRepo.On("Create", ctx, mock.AnythingOfType("*models.Transaction")).Return(nil).Times(2) // Two transactions

		updatedOrder, err := useCase.ProcessOrderPayment(ctx, orderID, cashAmount, cardAmount, clientCash)

		assert.NoError(t, err)
		assert.NotNil(t, updatedOrder)
		assert.Equal(t, "paid", updatedOrder.Status)
		assert.Equal(t, cashAmount, updatedOrder.CashAmount)
		assert.Equal(t, cardAmount, updatedOrder.CardAmount)
		mockOrderRepo.AssertExpectations(t)
		mockTransactionRepo.AssertExpectations(t)
	})

	// Test case 5: Order already paid
	t.Run("Order already paid", func(t *testing.T) {
		order := createTestOrderForPayment(100.0)
		order.Status = "paid"
		order.PaymentStatus = "paid"
		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()

		updatedOrder, err := useCase.ProcessOrderPayment(ctx, orderID, 100.0, 0.0, 100.0)

		assert.Error(t, err)
		assert.Nil(t, updatedOrder)
		assert.Contains(t, err.Error(), "order is already paid or cancelled")
		mockOrderRepo.AssertExpectations(t)
	})

	// Test case 6: Total payment less than total amount
	t.Run("Total payment less than total amount", func(t *testing.T) {
		order := createTestOrderForPayment(100.0)
		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()

		updatedOrder, err := useCase.ProcessOrderPayment(ctx, orderID, 50.0, 0.0, 50.0)

		assert.Error(t, err)
		assert.Nil(t, updatedOrder)
		assert.Contains(t, err.Error(), "total payment is less than total order amount")
		mockOrderRepo.AssertExpectations(t)
	})

	// Test case 7: Client cash less than cash payment amount (should not happen with logic, but for robustness)
	t.Run("Client cash less than cash payment amount", func(t *testing.T) {
		order := createTestOrderForPayment(100.0)
		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()

		updatedOrder, err := useCase.ProcessOrderPayment(ctx, orderID, 100.0, 0.0, 50.0)

		assert.Error(t, err)
		assert.Nil(t, updatedOrder)
		assert.Contains(t, err.Error(), "client cash is less than cash payment amount")
		mockOrderRepo.AssertExpectations(t)
	})

	// Test case 8: Order repo update error
	t.Run("Order repo update error", func(t *testing.T) {
		order := createTestOrderForPayment(100.0)
		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()
		mockOrderRepo.On("Update", ctx, mock.AnythingOfType("*models.Order")).Return(errors.New("db error")).Once()

		updatedOrder, err := useCase.ProcessOrderPayment(ctx, orderID, 100.0, 0.0, 100.0)

		assert.Error(t, err)
		assert.Nil(t, updatedOrder)
		assert.Contains(t, err.Error(), "db error")
		mockOrderRepo.AssertExpectations(t)
	})

	// Test case 9: Transaction creation error (cash)
	t.Run("Transaction creation error (cash)", func(t *testing.T) {
		order := createTestOrderForPayment(100.0)
		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()
		mockOrderRepo.On("Update", ctx, mock.AnythingOfType("*models.Order")).Return(nil).Once()
		mockTransactionRepo.On("Create", ctx, mock.AnythingOfType("*models.Transaction")).Return(errors.New("transaction db error")).Once()

		updatedOrder, err := useCase.ProcessOrderPayment(ctx, orderID, 100.0, 0.0, 100.0)

		assert.Error(t, err)
		assert.Nil(t, updatedOrder)
		assert.Contains(t, err.Error(), "transaction db error")
		mockOrderRepo.AssertExpectations(t)
		mockTransactionRepo.AssertExpectations(t)
	})
}

func TestOrderUseCase_CloseOrderWithoutPayment(t *testing.T) {
	mockOrderRepo := new(MockOrderRepository)
	mockWarehouseRepo := new(MockWarehouseRepository)
	mockTransactionRepo := new(MockTransactionRepository)
	useCase := NewOrderUseCase(mockOrderRepo, mockWarehouseRepo, mockTransactionRepo)
	ctx := context.Background()

	orderID := uuid.New()
	establishmentID := uuid.New()
	reason := "Guest left"

	// Helper function to create a test order
	createTestOrderForClosure := func(status string) *models.Order {
		return &models.Order{
			ID:              orderID,
			EstablishmentID: establishmentID,
			Status:          status,
			TotalAmount:     50.0,
			PaymentStatus:   "pending",
			Items:           []models.OrderItem{},
		}
	}

	// Test case 1: Successfully close order without payment
	t.Run("Successfully close order without payment", func(t *testing.T) {
		order := createTestOrderForClosure("draft")

		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()
		mockOrderRepo.On("Update", ctx, mock.AnythingOfType("*models.Order")).Return(nil).Once()
		mockTransactionRepo.On("Create", ctx, mock.AnythingOfType("*models.Transaction")).Return(nil).Once()

		updatedOrder, err := useCase.CloseOrderWithoutPayment(ctx, orderID, reason)

		assert.NoError(t, err)
		assert.NotNil(t, updatedOrder)
		assert.Equal(t, "cancelled", updatedOrder.Status)
		assert.Equal(t, "cancelled", updatedOrder.PaymentStatus)
		assert.Equal(t, reason, *updatedOrder.ReasonForNoPayment)
		mockOrderRepo.AssertExpectations(t)
		mockTransactionRepo.AssertExpectations(t)
	})

	// Test case 2: Order already paid or cancelled
	t.Run("Order already paid or cancelled", func(t *testing.T) {
		order := createTestOrderForClosure("paid")
		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()

		updatedOrder, err := useCase.CloseOrderWithoutPayment(ctx, orderID, reason)

		assert.Error(t, err)
		assert.Nil(t, updatedOrder)
		assert.Contains(t, err.Error(), "order is already paid or cancelled")
		mockOrderRepo.AssertExpectations(t)
	})

	// Test case 3: Order repo update error
	t.Run("Order repo update error", func(t *testing.T) {
		order := createTestOrderForClosure("draft")
		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()
		mockOrderRepo.On("Update", ctx, mock.AnythingOfType("*models.Order")).Return(errors.New("db error")).Once()

		updatedOrder, err := useCase.CloseOrderWithoutPayment(ctx, orderID, reason)

		assert.Error(t, err)
		assert.Nil(t, updatedOrder)
		assert.Contains(t, err.Error(), "db error")
		mockOrderRepo.AssertExpectations(t)
	})

	// Test case 4: Transaction creation error
	t.Run("Transaction creation error", func(t *testing.T) {
		order := createTestOrderForClosure("draft")
		mockOrderRepo.On("GetByID", ctx, orderID).Return(order, nil).Once()
		mockOrderRepo.On("Update", ctx, mock.AnythingOfType("*models.Order")).Return(nil).Once()
		mockTransactionRepo.On("Create", ctx, mock.AnythingOfType("*models.Transaction")).Return(errors.New("transaction db error")).Once()

		updatedOrder, err := useCase.CloseOrderWithoutPayment(ctx, orderID, reason)

		assert.Error(t, err)
		assert.Nil(t, updatedOrder)
		assert.Contains(t, err.Error(), "transaction db error")
		mockOrderRepo.AssertExpectations(t)
		mockTransactionRepo.AssertExpectations(t)
	})
}