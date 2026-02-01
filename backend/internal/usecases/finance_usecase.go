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

type ShiftReportFilter struct {
	StartDate       time.Time
	EndDate         time.Time
	IncludeProducts bool
}

type FinanceUseCase struct {
	transactionRepo repositories.TransactionRepository
	accountRepo     repositories.AccountRepository
	shiftRepo       repositories.ShiftRepository
	orderRepo       repositories.OrderRepository // Добавлен orderRepo
}

func NewFinanceUseCase(
	transactionRepo repositories.TransactionRepository,
	accountRepo repositories.AccountRepository,
	shiftRepo repositories.ShiftRepository,
	orderRepo repositories.OrderRepository, // Добавлен orderRepo
) *FinanceUseCase {
	return &FinanceUseCase{
		transactionRepo: transactionRepo,
		accountRepo:     accountRepo,
		shiftRepo:       shiftRepo,
		orderRepo:       orderRepo,
	}
}

// ——— Transactions ———

// CreateTransaction создает транзакцию и обновляет баланс счета
func (uc *FinanceUseCase) CreateTransaction(ctx context.Context, transaction *models.Transaction, establishmentID uuid.UUID) error {
	// Проверяем, что счет принадлежит заведению
	account, err := uc.accountRepo.GetByID(ctx, transaction.AccountID, &establishmentID)
	if err != nil || account == nil {
		return errors.New("account not found or access denied")
	}
	
	transaction.EstablishmentID = establishmentID
	
	// Если дата транзакции не указана, используем текущую
	if transaction.TransactionDate.IsZero() {
		transaction.TransactionDate = time.Now()
	}
	
	// Создаем транзакцию
	if err := uc.transactionRepo.Create(ctx, transaction); err != nil {
		return err
	}
	
	// Обновляем баланс счета в зависимости от типа транзакции
	if transaction.Type == "income" {
		// Доход - добавляем деньги
		account.Balance += transaction.Amount
	} else if transaction.Type == "expense" {
		// Расход - отнимаем деньги
		if account.Balance < transaction.Amount {
			return errors.New("insufficient balance")
		}
		account.Balance -= transaction.Amount
	}
	// Для transfer логика будет сложнее (перевод между счетами) - TODO

	if err := uc.accountRepo.UpdateBalance(ctx, transaction.AccountID, account.Balance); err != nil {
		return err
	}
	
	return nil
}

// GetTransaction возвращает транзакцию по ID
func (uc *FinanceUseCase) GetTransaction(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.Transaction, error) {
	return uc.transactionRepo.GetByID(ctx, id, &establishmentID)
}

// ListTransactions возвращает список транзакций с фильтрацией
func (uc *FinanceUseCase) ListTransactions(ctx context.Context, establishmentID uuid.UUID, filter *repositories.TransactionFilter) ([]*models.Transaction, error) {
	if filter == nil {
		filter = &repositories.TransactionFilter{}
	}
	filter.EstablishmentID = &establishmentID
	return uc.transactionRepo.List(ctx, filter)
}

// UpdateTransaction обновляет транзакцию и пересчитывает баланс
func (uc *FinanceUseCase) UpdateTransaction(ctx context.Context, transaction *models.Transaction, establishmentID uuid.UUID) error {
	// Получаем существующую транзакцию
	existing, err := uc.transactionRepo.GetByID(ctx, transaction.ID, &establishmentID)
	if err != nil || existing == nil {
		return errors.New("transaction not found or access denied")
	}
	
	// Проверяем, что новый счет принадлежит заведению (если изменился)
	if transaction.AccountID != existing.AccountID {
		account, err := uc.accountRepo.GetByID(ctx, transaction.AccountID, &establishmentID)
		if err != nil || account == nil {
			return errors.New("account not found or access denied")
		}
	}
	
	// Откатываем изменения от старой транзакции
	oldAccount, _ := uc.accountRepo.GetByID(ctx, existing.AccountID, nil)
	if oldAccount != nil {
		if existing.Type == "income" {
			oldAccount.Balance -= existing.Amount
		} else if existing.Type == "expense" {
			oldAccount.Balance += existing.Amount
		}
		uc.accountRepo.UpdateBalance(ctx, existing.AccountID, oldAccount.Balance)
	}

	// Применяем изменения новой транзакции
	newAccount, _ := uc.accountRepo.GetByID(ctx, transaction.AccountID, nil)
	if newAccount != nil {
		if transaction.Type == "income" {
			newAccount.Balance += transaction.Amount
		} else if transaction.Type == "expense" {
			newAccount.Balance -= transaction.Amount
		}
		uc.accountRepo.UpdateBalance(ctx, transaction.AccountID, newAccount.Balance)
	}
	
	// Обновляем транзакцию
	return uc.transactionRepo.Update(ctx, transaction)
}

// DeleteTransaction удаляет транзакцию и откатывает изменения баланса
func (uc *FinanceUseCase) DeleteTransaction(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error {
	transaction, err := uc.transactionRepo.GetByID(ctx, id, &establishmentID)
	if err != nil || transaction == nil {
		return errors.New("transaction not found or access denied")
	}
	
	// Откатываем изменения баланса
	account, err := uc.accountRepo.GetByID(ctx, transaction.AccountID, nil)
	if err == nil && account != nil {
		if transaction.Type == "income" {
			account.Balance -= transaction.Amount
		} else if transaction.Type == "expense" {
			account.Balance += transaction.Amount
		}
		uc.accountRepo.UpdateBalance(ctx, transaction.AccountID, account.Balance)
	}
	
	// Удаляем транзакцию
	return uc.transactionRepo.Delete(ctx, id)
}

// GetTotalTransactionsAmount возвращает общую сумму транзакций с фильтрацией
func (uc *FinanceUseCase) GetTotalTransactionsAmount(ctx context.Context, establishmentID uuid.UUID, filter *repositories.TransactionFilter) (float64, error) {
	if filter == nil {
		filter = &repositories.TransactionFilter{}
	}
	filter.EstablishmentID = &establishmentID
	transactions, err := uc.transactionRepo.List(ctx, filter)
	if err != nil {
		return 0, fmt.Errorf("failed to list transactions for total sum calculation: %w", err)
	}

	var total float64
	for _, t := range transactions {
		total += t.Amount
	}
	return total, nil
}

// ShiftReport представляет отчет о смене
type ShiftReport struct {
	ShiftID              uuid.UUID        `json:"shift_id"`
	StartTime            time.Time        `json:"start_time"`
	EndTime              *time.Time       `json:"end_time,omitempty"`
	InitialCash          float64          `json:"initial_cash"`
	FinalCash            *float64         `json:"final_cash,omitempty"`
	Comment              *string          `json:"comment,omitempty"`
	TotalOrders          int              `json:"total_orders"`
	TotalAmount          float64          `json:"total_amount"`
	TotalDiscounts       float64          `json:"total_discounts"`
	AmountAfterDiscounts float64          `json:"amount_after_discounts"`
	CashPayments         float64          `json:"cash_payments"`
	CardPayments         float64          `json:"card_payments"`
	Transactions         []models.Transaction `json:"transactions"`
	OrderSummaries       []ShiftReportOrderSummary `json:"order_summaries,omitempty"`
}

// ShiftReportOrderSummary представляет краткую информацию о заказе для отчета
type ShiftReportOrderSummary struct {
	OrderID     uuid.UUID `json:"order_id"`
	TableNumber *int      `json:"table_number,omitempty"`
	Status      string    `json:"status"`
	TotalAmount float64   `json:"total_amount"`
	PaymentStatus string  `json:"payment_status"`
	// Дополнительные поля, если IncludeProducts = true
	Items []models.OrderItem `json:"items,omitempty"`
}

// GenerateShiftReport генерирует отчет о смене
func (uc *FinanceUseCase) GenerateShiftReport(ctx context.Context, establishmentID uuid.UUID, filter ShiftReportFilter) (*ShiftReport, error) {
	// Получаем смены по фильтру
	shifts, err := uc.shiftRepo.ListByFilter(ctx, &repositories.ShiftFilter{
		EstablishmentID: &establishmentID,
		StartDate:       &filter.StartDate,
		EndDate:         &filter.EndDate,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list shifts for report: %w", err)
	}

	if len(shifts) == 0 {
		return nil, errors.New("no shifts found for the specified period")
	}

	// Assuming one shift per report for simplicity
	shift := shifts[0]

	report := &ShiftReport{
		ShiftID:         shift.ID,
		StartTime:       shift.StartTime,
		EndTime:         shift.EndTime,
		InitialCash:     shift.InitialCash,
		FinalCash:       shift.FinalCash,
		Comment:         shift.Comment,
	}

	// Fetch all transactions for the shift
	transactions, err := uc.transactionRepo.List(ctx, &repositories.TransactionFilter{
		EstablishmentID: &establishmentID,
		StartDate:       &shift.StartTime,
		EndDate:         shift.EndTime,
		ShiftID:         &shift.ID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list transactions for shift report: %w", err)
	}

	convertedTransactions := make([]models.Transaction, len(transactions))
	for i, tx := range transactions {
		convertedTransactions[i] = *tx
	}
	report.Transactions = convertedTransactions

	// Fetch orders related to this shift
	orders, err := uc.orderRepo.ListByShiftIDAndEstablishmentIDAndDateRange(ctx, shift.ID, establishmentID, shift.StartTime, *shift.EndTime)
	if err != nil {
		return nil, fmt.Errorf("failed to list orders for shift report: %w", err)
	}

	report.TotalOrders = len(orders)
	
	var totalAmountFromOrders float64
	var totalDiscountsFromOrders float64
	var cashPaymentsFromOrders float64
	var cardPaymentsFromOrders float64
	var orderSummaries []ShiftReportOrderSummary

	for _, order := range orders {
		totalAmountFromOrders += order.TotalAmount
		cashPaymentsFromOrders += order.CashAmount
		cardPaymentsFromOrders += order.CardAmount
		if order.Status == "cancelled" && order.ReasonForNoPayment != nil { // Assuming cancelled orders without payment are discounts/losses
			totalDiscountsFromOrders += order.TotalAmount
		}

		// Populate OrderSummaries if IncludeProducts is true
		if filter.IncludeProducts {
			summary := ShiftReportOrderSummary{
				OrderID:     order.ID,
				Status:      order.Status,
				TotalAmount: order.TotalAmount,
				PaymentStatus: order.PaymentStatus,
			}
			if order.TableID != nil {
				summary.TableNumber = &order.Table.Number
			}
			summary.Items = order.Items // Assuming OrderItem contains product/techcard info
			orderSummaries = append(orderSummaries, summary)
		}
	}

	report.TotalAmount = totalAmountFromOrders
	report.TotalDiscounts = totalDiscountsFromOrders
	report.AmountAfterDiscounts = report.TotalAmount - report.TotalDiscounts
	report.CashPayments = cashPaymentsFromOrders
	report.CardPayments = cardPaymentsFromOrders
	report.OrderSummaries = orderSummaries

	return report, nil
}

// GetShifts возвращает список смен с фильтрацией
func (uc *FinanceUseCase) GetShifts(ctx context.Context, establishmentID *uuid.UUID, startDate *time.Time, endDate *time.Time) ([]*models.Shift, error) {
	filter := &repositories.ShiftFilter{
		EstablishmentID: establishmentID,
		StartDate:       startDate,
		EndDate:         endDate,
	}

	shifts, err := uc.shiftRepo.ListByFilter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to list shifts: %w", err)
	}

	return shifts, nil
}
