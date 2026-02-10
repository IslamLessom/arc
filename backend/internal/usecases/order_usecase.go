package usecases

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

type OrderUseCase struct {
	orderRepo       repositories.OrderRepository
	warehouseRepo   repositories.WarehouseRepository
	transactionRepo repositories.TransactionRepository
	accountUseCase  *AccountUseCase // Добавлен AccountUseCase
}

func NewOrderUseCase(
	orderRepo repositories.OrderRepository,
	warehouseRepo repositories.WarehouseRepository,
	transactionRepo repositories.TransactionRepository,
	accountUseCase *AccountUseCase, // Добавлен AccountUseCase
) *OrderUseCase {
	return &OrderUseCase{
		orderRepo:       orderRepo,
		warehouseRepo:   warehouseRepo,
		transactionRepo: transactionRepo,
		accountUseCase:  accountUseCase, // Присвоение AccountUseCase
	}
}

func (uc *OrderUseCase) CreateOrder(ctx context.Context, establishmentID uuid.UUID, tableID *uuid.UUID, items []models.OrderItem) (*models.Order, error) {
	order := &models.Order{
		EstablishmentID: establishmentID,
		TableID:         tableID,
		Status:          "draft",
		Items:           items,
	}

	// Calculate total amount and ensure item prices are set
	var totalAmount float64
	for i := range order.Items {
		item := &order.Items[i]
		if item.ProductID != nil {
			product, err := uc.warehouseRepo.GetProductByID(ctx, *item.ProductID)
			if err != nil {
				return nil, fmt.Errorf("product not found: %w", err)
			}
			item.Price = product.Price
		} else if item.TechCardID != nil {
			techCard, err := uc.warehouseRepo.GetTechCardByID(ctx, *item.TechCardID)
			if err != nil {
				return nil, fmt.Errorf("tech card not found: %w", err)
			}
			item.Price = techCard.Price
		} else {
			return nil, errors.New("order item must have a product or tech card")
		}
		item.TotalPrice = item.Price * float64(item.Quantity)
		totalAmount += item.TotalPrice
	}

	order.TotalAmount = totalAmount

	if err := uc.orderRepo.Create(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to create order: %w", err)
	}

	return order, nil
}

func (uc *OrderUseCase) GetActiveOrdersByEstablishment(ctx context.Context, establishmentID uuid.UUID) ([]*models.Order, error) {
	orders, err := uc.orderRepo.ListActiveByEstablishmentID(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get active orders: %w", err)
	}
	return orders, nil
}

func (uc *OrderUseCase) AddOrderItem(ctx context.Context, orderID uuid.UUID, item models.OrderItem) (*models.Order, error) {
	order, err := uc.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, fmt.Errorf("order not found: %w", err)
	}

	// Ensure item price is set
	if item.ProductID != nil {
		product, err := uc.warehouseRepo.GetProductByID(ctx, *item.ProductID)
		if err != nil {
			return nil, fmt.Errorf("product not found: %w", err)
		}
		item.Price = product.Price
	} else if item.TechCardID != nil {
		techCard, err := uc.warehouseRepo.GetTechCardByID(ctx, *item.TechCardID)
		if err != nil {
			return nil, fmt.Errorf("tech card not found: %w", err)
		}
		item.Price = techCard.Price
	} else {
		return nil, errors.New("order item must have a product or tech card")
	}
	item.TotalPrice = item.Price * float64(item.Quantity)

	// Add item to order
	order.Items = append(order.Items, item)
	order.TotalAmount += item.TotalPrice

	if err := uc.orderRepo.Update(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to add order item: %w", err)
	}

	return order, nil
}

func (uc *OrderUseCase) UpdateOrderItemQuantity(ctx context.Context, orderID uuid.UUID, itemID uuid.UUID, quantity int) (*models.Order, error) {
	order, err := uc.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, fmt.Errorf("order not found: %w", err)
	}

	found := false
	for i := range order.Items {
		item := &order.Items[i]
		if item.ID == itemID {
			// Update total amount
			order.TotalAmount -= item.TotalPrice
			item.Quantity = quantity
			item.TotalPrice = item.Price * float64(item.Quantity)
			order.TotalAmount += item.TotalPrice
			found = true
			break
		}
	}

	if !found {
		return nil, errors.New("order item not found")
	}

	if err := uc.orderRepo.Update(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to update order item quantity: %w", err)
	}

	return order, nil
}

func (uc *OrderUseCase) ProcessOrderPayment(ctx context.Context, orderID uuid.UUID, cashAmount, cardAmount, clientCash float64) (*models.Order, error) {
	order, err := uc.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, fmt.Errorf("order not found: %w", err)
	}

	if order.Status == "paid" || order.Status == "cancelled" {
		return nil, errors.New("order is already paid or cancelled")
	}

	// Calculate total payment received
	totalPaid := cashAmount + cardAmount

	// Логирование для отладки
	fmt.Printf("DEBUG Payment: orderID=%s, order.TotalAmount=%.2f, cashAmount=%.2f, cardAmount=%.2f, totalPaid=%.2f\n",
		orderID, order.TotalAmount, cashAmount, cardAmount, totalPaid)

	// Сравнение с допуском для float (epsilon = 0.01 - одна копейка)
	const epsilon = 0.01
	if totalPaid < order.TotalAmount-epsilon {
		return nil, fmt.Errorf("total payment (%.2f) is less than total order amount (%.2f)", totalPaid, order.TotalAmount)
	}

	order.CashAmount = cashAmount
	order.CardAmount = cardAmount
	order.PaymentStatus = "paid"
	order.Status = "paid"

	// Calculate change if cash payment exceeds remaining amount
	if cashAmount > 0 && clientCash > 0 {
		order.ChangeAmount = clientCash - cashAmount
		if order.ChangeAmount < 0 {
			return nil, errors.New("client cash is less than cash payment amount")
		}
	}

	if err := uc.orderRepo.Update(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to process order payment: %w", err)
	}

	// Create transaction for cash/card payment
	if order.CashAmount > 0 {
		// Пробуем создать транзакцию для наличных, автоматически создаем счет если его нет
		if uc.accountUseCase != nil {
			cashAccountType, err := uc.accountUseCase.accountTypeRepo.GetByName(ctx, "наличные")
			if err == nil && cashAccountType != nil {
				// Ищем конкретно "Денежный ящик"
				cashAccounts, err := uc.accountUseCase.repo.List(ctx, &repositories.AccountFilter{
					EstablishmentID: &order.EstablishmentID,
					TypeID:          &cashAccountType.ID,
					Active:          repositories.BoolPtr(true),
				})
				if err != nil {
					return nil, fmt.Errorf("failed to get cash accounts: %w", err)
				}

				// Ищем счет с названием "Денежный ящик"
				var cashDrawerAccount *models.Account
				for _, acc := range cashAccounts {
					if acc.Name == "Денежный ящик" {
						cashDrawerAccount = acc
						break
					}
				}

				var cashAccountID uuid.UUID
				if cashDrawerAccount == nil {
					// Если "Денежный ящик" не найден, создаем его
					newAccount := &models.Account{
						Name:            "Денежный ящик",
						EstablishmentID: order.EstablishmentID,
						TypeID:          cashAccountType.ID,
						Active:          true,
						Balance:         0,
					}
					if err := uc.accountUseCase.repo.Create(ctx, newAccount); err != nil {
						return nil, fmt.Errorf("failed to create cash drawer account: %w", err)
					}
					cashAccountID = newAccount.ID
				} else {
					cashAccountID = cashDrawerAccount.ID
				}

				transaction := &models.Transaction{
					TransactionDate: time.Now(),
					Type:            "income",
					Category:        "Оплата заказа",
					Description:     fmt.Sprintf("Оплата наличными, заказ №%s", order.ID.String()[:8]),
					Amount:          order.CashAmount,
					AccountID:       cashAccountID,
					EstablishmentID: order.EstablishmentID,
					OrderID:         &order.ID,
				}
				if err := uc.transactionRepo.Create(ctx, transaction); err != nil {
					return nil, fmt.Errorf("failed to create cash transaction: %w", err)
				}
			}
		}
	}
	if order.CardAmount > 0 {
		// Пробуем создать транзакцию для карты, автоматически создаем счет если его нет
		if uc.accountUseCase != nil {
			cardAccountType, err := uc.accountUseCase.accountTypeRepo.GetByName(ctx, "банковские карточки")
			if err == nil && cardAccountType != nil {
				cardAccounts, err := uc.accountUseCase.repo.List(ctx, &repositories.AccountFilter{
					EstablishmentID: &order.EstablishmentID,
					TypeID:          &cardAccountType.ID,
					Active:          repositories.BoolPtr(true),
				})
				if err != nil {
					return nil, fmt.Errorf("failed to get card account: %w", err)
				}

				var cardAccountID uuid.UUID
				if len(cardAccounts) == 0 {
					// Автоматически создаем счет для карт
					newAccount := &models.Account{
						Name:            "Банковские карточки",
						EstablishmentID: order.EstablishmentID,
						TypeID:          cardAccountType.ID,
						Active:          true,
						Balance:         0,
					}
					if err := uc.accountUseCase.repo.Create(ctx, newAccount); err != nil {
						return nil, fmt.Errorf("failed to create card account: %w", err)
					}
					cardAccountID = newAccount.ID
				} else {
					cardAccountID = cardAccounts[0].ID
				}

				transaction := &models.Transaction{
					TransactionDate: time.Now(),
					Type:            "income",
					Category:        "Оплата заказа",
					Description:     fmt.Sprintf("Оплата картой, заказ №%s", order.ID.String()[:8]),
					Amount:          order.CardAmount,
					AccountID:       cardAccountID,
					EstablishmentID: order.EstablishmentID,
					OrderID:         &order.ID,
				}
				if err := uc.transactionRepo.Create(ctx, transaction); err != nil {
					return nil, fmt.Errorf("failed to create card transaction: %w", err)
				}
			}
		}
	}

	if err := uc.deductTechCardIngredientsFromStock(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to deduct stock for order: %w", err)
	}

	return order, nil
}

func (uc *OrderUseCase) CloseOrderWithoutPayment(ctx context.Context, orderID uuid.UUID, reason string) (*models.Order, error) {
	order, err := uc.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, fmt.Errorf("order not found: %w", err)
	}

	if order.Status == "paid" || order.Status == "cancelled" {
		return nil, errors.New("order is already paid or cancelled")
	}

	order.Status = "cancelled"
	order.PaymentStatus = "cancelled"
	order.ReasonForNoPayment = &reason

	if err := uc.orderRepo.Update(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to close order without payment: %w", err)
	}

	// Create a transaction to record the loss/discount
	transaction := &models.Transaction{
		TransactionDate: time.Now(),
		Category:        "Order Cancellation",
		Description:     fmt.Sprintf("Order %s closed without payment: %s", order.ID.String(), reason),
		Amount:          -order.TotalAmount,    // Negative amount for loss
		AccountID:       order.EstablishmentID, // Assuming loss affects establishment's main account for now
		EstablishmentID: order.EstablishmentID,
	}
	if err := uc.transactionRepo.Create(ctx, transaction); err != nil {
		return nil, fmt.Errorf("failed to create transaction for non-payment closure: %w", err)
	}

	return order, nil
}

func (uc *OrderUseCase) ListOrders(ctx context.Context, establishmentID uuid.UUID, startDateStr, endDateStr, status string) ([]*models.Order, error) {
	var startDate, endDate time.Time
	var err error

	if startDateStr != "" {
		startDate, err = time.Parse("2006-01-02", startDateStr)
		if err != nil {
			return nil, fmt.Errorf("invalid start date format: %w", err)
		}
	}

	if endDateStr != "" {
		endDate, err = time.Parse("2006-01-02", endDateStr)
		if err != nil {
			return nil, fmt.Errorf("invalid end date format: %w", err)
		}
	}

	orders, err := uc.orderRepo.List(ctx, establishmentID, startDate, endDate, status)
	if err != nil {
		return nil, fmt.Errorf("failed to list orders: %w", err)
	}
	return orders, nil
}

func (uc *OrderUseCase) GetOrder(ctx context.Context, orderID uuid.UUID, establishmentID uuid.UUID) (*models.Order, error) {
	order, err := uc.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, fmt.Errorf("order not found: %w", err)
	}
	// Проверяем, что заказ принадлежит указанному заведению
	if order.EstablishmentID != establishmentID {
		return nil, fmt.Errorf("order not found in establishment: order belongs to %s, requested %s",
			order.EstablishmentID.String(), establishmentID.String())
	}
	return order, nil
}

func (uc *OrderUseCase) deductTechCardIngredientsFromStock(ctx context.Context, order *models.Order) error {
	type ingredientUsage struct {
		quantity float64
		unit     string
	}

	usageByIngredient := make(map[uuid.UUID]ingredientUsage)

	// Собираем общее количество каждого ингредиента из всех тех-карт
	for _, item := range order.Items {
		if item.TechCardID == nil {
			continue
		}

		techCard, err := uc.warehouseRepo.GetTechCardByID(ctx, *item.TechCardID)
		if err != nil {
			return fmt.Errorf("tech card not found: %w", err)
		}
		if techCard == nil {
			return errors.New("tech card not found")
		}

		for _, ing := range techCard.Ingredients {
			qty := ing.Quantity * float64(item.Quantity)
			if qty == 0 {
				continue
			}
			current := usageByIngredient[ing.IngredientID]
			unit := current.unit
			if unit == "" {
				unit = ing.Unit
			}
			usageByIngredient[ing.IngredientID] = ingredientUsage{
				quantity: current.quantity + qty,
				unit:     unit,
			}
		}
	}

	if len(usageByIngredient) == 0 {
		return nil
	}

	// Умное распределение по складам
	for ingredientID, usage := range usageByIngredient {
		remainingQty := usage.quantity

		// Получаем все остатки этого ингредиента по всем складам заведения
		stocks, err := uc.warehouseRepo.GetStockByIngredientID(ctx, ingredientID)
		if err != nil {
			return fmt.Errorf("failed to get stocks for ingredient %s: %w", ingredientID, err)
		}

		// Фильтруем только склады этого заведения и сортируем по количеству ( FIFO - сначала списываем с того, где больше всего)
		var establishmentStocks []*models.Stock
		for _, stock := range stocks {
			// Проверяем, что склад принадлежит заведению
			warehouse, err := uc.warehouseRepo.GetWarehouseByID(ctx, stock.WarehouseID, &order.EstablishmentID)
			if err == nil && warehouse != nil && stock.Quantity > 0 {
				establishmentStocks = append(establishmentStocks, stock)
			}
		}

		// Сортируем по количеству по убыванию (сначала списываем с того, где больше)
		sortStocksByQuantityDesc(establishmentStocks)

		// Списываем с нескольких складов если нужно
		for _, stock := range establishmentStocks {
			if remainingQty <= 0 {
				break
			}

			// Определяем сколько списать с этого склада
			toDeduct := stock.Quantity
			if toDeduct > remainingQty {
				toDeduct = remainingQty
			}

			stock.Quantity -= toDeduct
			remainingQty -= toDeduct

			if err := uc.warehouseRepo.UpdateStock(ctx, stock); err != nil {
				return fmt.Errorf("failed to update stock for ingredient %s: %w", ingredientID, err)
			}
		}

		// Если не хватило на всех складах - создаем запись на складе по умолчанию с отрицательным остатком
		if remainingQty > 0.01 {
			warehouseID, err := uc.getDefaultWarehouseID(ctx, order.EstablishmentID)
			if err != nil {
				return fmt.Errorf("failed to get default warehouse: %w", err)
			}

			// Проверяем, есть ли уже запись для этого ингредиента на складе по умолчанию
			stock, err := uc.warehouseRepo.GetStockByIngredientAndWarehouse(ctx, ingredientID, warehouseID)
			if err != nil {
				return fmt.Errorf("failed to get stock for ingredient %s: %w", ingredientID, err)
			}

			unit := usage.unit
			if unit == "" {
				unit = "шт"
			}

			if stock == nil {
				// Создаем новую запись с отрицательным остатком
				stock = &models.Stock{
					WarehouseID:  warehouseID,
					IngredientID: &ingredientID,
					Quantity:     -remainingQty,
					Unit:         unit,
				}
				if err := uc.warehouseRepo.CreateStock(ctx, stock); err != nil {
					return fmt.Errorf("failed to create stock for ingredient %s: %w", ingredientID, err)
				}
			} else {
				// Обновляем существующую запись
				stock.Quantity -= remainingQty
				if err := uc.warehouseRepo.UpdateStock(ctx, stock); err != nil {
					return fmt.Errorf("failed to update stock for ingredient %s: %w", ingredientID, err)
				}
			}
		}
	}

	return nil
}

// sortStocksByQuantityDesc сортирует стоки по количеству по убыванию
func sortStocksByQuantityDesc(stocks []*models.Stock) {
	for i := 0; i < len(stocks)-1; i++ {
		for j := i + 1; j < len(stocks); j++ {
			if stocks[i].Quantity < stocks[j].Quantity {
				stocks[i], stocks[j] = stocks[j], stocks[i]
			}
		}
	}
}

func (uc *OrderUseCase) getDefaultWarehouseID(ctx context.Context, establishmentID uuid.UUID) (uuid.UUID, error) {
	warehouses, err := uc.warehouseRepo.ListWarehouses(ctx, establishmentID)
	if err != nil {
		return uuid.Nil, err
	}
	if len(warehouses) == 0 {
		return uuid.Nil, errors.New("no warehouses available for establishment")
	}

	for _, w := range warehouses {
		if w.Active {
			return w.ID, nil
		}
	}

	return warehouses[0].ID, nil
}

func (uc *OrderUseCase) UpdateOrder(ctx context.Context, orderID uuid.UUID, updatedOrder models.Order) (*models.Order, error) {
	order, err := uc.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, fmt.Errorf("order not found: %w", err)
	}

	// Update fields as necessary
	order.TableID = updatedOrder.TableID
	order.Status = updatedOrder.Status
	order.PaymentStatus = updatedOrder.PaymentStatus
	order.TotalAmount = updatedOrder.TotalAmount
	order.CashAmount = updatedOrder.CashAmount
	order.CardAmount = updatedOrder.CardAmount
	order.ChangeAmount = updatedOrder.ChangeAmount
	order.ReasonForNoPayment = updatedOrder.ReasonForNoPayment
	order.Items = updatedOrder.Items // This might need more sophisticated merging logic

	if err := uc.orderRepo.Update(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to update order: %w", err)
	}

	return order, nil
}
