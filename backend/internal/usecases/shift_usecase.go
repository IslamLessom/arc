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

type ShiftUseCase struct {
	shiftRepo          repositories.ShiftRepository
	shiftSessionRepo   repositories.ShiftSessionRepository
	userRepo           repositories.UserRepository
	transactionRepo    repositories.TransactionRepository
	accountRepo        repositories.AccountRepository
	accountTypeRepo    repositories.AccountTypeRepository
	orderRepo          repositories.OrderRepository
}

func NewShiftUseCase(
	shiftRepo repositories.ShiftRepository,
	shiftSessionRepo repositories.ShiftSessionRepository,
	userRepo repositories.UserRepository,
	transactionRepo repositories.TransactionRepository,
	accountRepo repositories.AccountRepository,
	accountTypeRepo repositories.AccountTypeRepository,
	orderRepo repositories.OrderRepository,
) *ShiftUseCase {
	return &ShiftUseCase{
		shiftRepo:          shiftRepo,
		shiftSessionRepo:   shiftSessionRepo,
		userRepo:           userRepo,
		transactionRepo:    transactionRepo,
		accountRepo:        accountRepo,
		accountTypeRepo:    accountTypeRepo,
		orderRepo:          orderRepo,
	}
}

func (uc *ShiftUseCase) GetShiftByID(ctx context.Context, id uuid.UUID) (*models.Shift, error) {
	shift, err := uc.shiftRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get shift: %w", err)
	}
	return shift, nil
}

// GetActiveShiftByEstablishment находит активную смену заведения
func (uc *ShiftUseCase) GetActiveShiftByEstablishment(ctx context.Context, establishmentID uuid.UUID) (*models.Shift, error) {
	shift, err := uc.shiftRepo.GetActiveShiftByEstablishmentID(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get active shift: %w", err)
	}
	return shift, nil
}

// StartShift создает новую смену для заведения
func (uc *ShiftUseCase) StartShift(ctx context.Context, userID uuid.UUID, establishmentID uuid.UUID, initialCash float64) (*models.Shift, error) {
	// Проверяем, нет ли уже активной смены в заведении
	if existingShift, _ := uc.shiftRepo.GetActiveShiftByEstablishmentID(ctx, establishmentID); existingShift != nil {
		return nil, errors.New("establishment already has an active shift")
	}

	shift := &models.Shift{
		UserID:          userID,
		EstablishmentID: establishmentID,
		StartTime:       time.Now(),
		InitialCash:     initialCash,
	}

	if err := uc.shiftRepo.Create(ctx, shift); err != nil {
		return nil, fmt.Errorf("failed to create shift: %w", err)
	}

	return shift, nil
}

// StartUserSession создает сессию для пользователя на активной смене
// Если смены нет - создает её
func (uc *ShiftUseCase) StartUserSession(ctx context.Context, userID uuid.UUID, establishmentID uuid.UUID, initialCash float64) (*models.ShiftSession, error) {
	// Проверяем, нет ли уже активной сессии у пользователя
	if existingSession, _ := uc.shiftSessionRepo.GetActiveSessionByUserID(ctx, userID); existingSession != nil {
		return nil, errors.New("user already has an active session")
	}

	// Получаем или создаем активную смену заведения
	shift, err := uc.shiftRepo.GetActiveShiftByEstablishmentID(ctx, establishmentID)
	if err != nil {
		// Смены нет - создаем новую
		shift, err = uc.StartShift(ctx, userID, establishmentID, initialCash)
		if err != nil {
			return nil, fmt.Errorf("failed to start shift: %w", err)
		}
	}

	// Создаем сессию для пользователя
	session := &models.ShiftSession{
		ShiftID:   shift.ID,
		UserID:    userID,
		StartTime: time.Now(),
	}

	if err := uc.shiftSessionRepo.Create(ctx, session); err != nil {
		return nil, fmt.Errorf("failed to create shift session: %w", err)
	}

	return session, nil
}

// EndUserSession завершает сессию пользователя
func (uc *ShiftUseCase) EndUserSession(ctx context.Context, sessionID uuid.UUID) error {
	if err := uc.shiftSessionRepo.EndSession(ctx, sessionID); err != nil {
		return fmt.Errorf("failed to end shift session: %w", err)
	}
	return nil
}

// EndShift завершает смену заведения
func (uc *ShiftUseCase) EndShift(ctx context.Context, shiftID uuid.UUID, finalCash float64, comment *string, cashAccountID uuid.UUID) (*models.Shift, error) {
	shift, err := uc.shiftRepo.GetByID(ctx, shiftID)
	if err != nil {
		return nil, fmt.Errorf("failed to get shift: %w", err)
	}

	if shift.EndTime != nil {
		return nil, errors.New("shift already ended")
	}

	// Получаем сумму всех оплат за смену (заказы со статусом paid)
	cashSalesTotal := 0.0
	cardSalesTotal := 0.0
	if uc.orderRepo != nil {
		// Получаем все заказы за период смены
		orders, err := uc.orderRepo.List(ctx, shift.EstablishmentID, shift.StartTime, time.Now(), "paid")
		if err == nil {
			fmt.Printf("DEBUG Shift End: Found %d paid orders\n", len(orders))
			for _, order := range orders {
				fmt.Printf("DEBUG Order: ID=%s, CashAmount=%.2f, CardAmount=%.2f, CreatedAt=%v, PaidAt=%v, StartTime=%v\n",
					order.ID, order.CashAmount, order.CardAmount, order.CreatedAt, order.UpdatedAt, shift.StartTime)
				// Суммируем оплаты, сделанные после начала смены
				if order.UpdatedAt.After(shift.StartTime) {
					if order.CashAmount > 0 {
						cashSalesTotal += order.CashAmount
						fmt.Printf("DEBUG: Added CashAmount=%.2f, CashTotal=%.2f\n", order.CashAmount, cashSalesTotal)
					}
					if order.CardAmount > 0 {
						cardSalesTotal += order.CardAmount
						fmt.Printf("DEBUG: Added CardAmount=%.2f, CardTotal=%.2f\n", order.CardAmount, cardSalesTotal)
					}
				}
			}
			fmt.Printf("DEBUG Shift End: cashSalesTotal=%.2f, cardSalesTotal=%.2f\n", cashSalesTotal, cardSalesTotal)
		} else {
			fmt.Printf("DEBUG Shift End: Error getting orders: %v\n", err)
		}
	}

	// Рассчитываем ожидаемую сумму в кассе
	expectedCash := shift.InitialCash + cashSalesTotal
	fmt.Printf("DEBUG Shift End: initialCash=%.2f, cashSalesTotal=%.2f, expectedCash=%.2f, finalCash=%.2f\n",
		shift.InitialCash, cashSalesTotal, expectedCash, finalCash)

	// Рассчитываем недостачу (если finalCash меньше expected)
	var shortage *float64
	if finalCash < expectedCash - 0.01 {
		shortageValue := expectedCash - finalCash
		shortage = &shortageValue
	}

	now := time.Now()
	shift.EndTime = &now
	shift.FinalCash = &finalCash
	shift.CashAmount = cashSalesTotal
	shift.CardAmount = cardSalesTotal
	shift.Shortage = shortage
	shift.Comment = comment

	if err := uc.shiftRepo.Update(ctx, shift); err != nil {
		return nil, fmt.Errorf("failed to update shift: %w", err)
	}

	// Инкассация - отправляем все наличные продажи в сейф
	// cashSalesTotal - это сумма всех наличных оплат за смену
	if cashSalesTotal > 0.01 {
		// Используем переданный cashAccountID (выбранный денежный ящик)
		cashAccount, err := uc.accountRepo.GetByID(ctx, cashAccountID, &shift.EstablishmentID)
		if err == nil && cashAccount != nil {
			// Создаем расходную транзакцию для денежного ящика (инкассация в сейф)
			transaction := &models.Transaction{
				TransactionDate: time.Now(),
				Type:            "expense",
				Category:        "Инкассация",
				Description:     fmt.Sprintf("Инкассация в сейф, смена №%s. Наличные продажи: %.2f ₽", shift.ID.String()[:8], cashSalesTotal),
				Amount:          cashSalesTotal,
				AccountID:       cashAccount.ID,
				EstablishmentID: shift.EstablishmentID,
				ShiftID:         &shift.ID,
			}
			if err := uc.transactionRepo.Create(ctx, transaction); err != nil {
				return nil, fmt.Errorf("failed to create incassation transaction: %w", err)
			}
		}
	}

	return shift, nil
}

// GetUserActiveSession возвращает активную сессию пользователя
func (uc *ShiftUseCase) GetUserActiveSession(ctx context.Context, userID uuid.UUID) (*models.ShiftSession, error) {
	session, err := uc.shiftSessionRepo.GetActiveSessionByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get active session: %w", err)
	}
	return session, nil
}