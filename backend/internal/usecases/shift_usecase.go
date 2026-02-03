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
}

func NewShiftUseCase(
	shiftRepo repositories.ShiftRepository,
	shiftSessionRepo repositories.ShiftSessionRepository,
	userRepo repositories.UserRepository,
	transactionRepo repositories.TransactionRepository,
) *ShiftUseCase {
	return &ShiftUseCase{
		shiftRepo:          shiftRepo,
		shiftSessionRepo:   shiftSessionRepo,
		userRepo:           userRepo,
		transactionRepo:    transactionRepo,
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

	now := time.Now()
	shift.EndTime = &now
	shift.FinalCash = &finalCash
	shift.Comment = comment

	if err := uc.shiftRepo.Update(ctx, shift); err != nil {
		return nil, fmt.Errorf("failed to update shift: %w", err)
	}

	// Create a transaction for cash movement (incassation)
	if shift.InitialCash != finalCash {
		transaction := &models.Transaction{
			TransactionDate: time.Now(),
			Category:    "Incassation",
			Description: fmt.Sprintf("Incassation for shift %s. Initial cash: %.2f, Final cash: %.2f", shift.ID.String(), shift.InitialCash, finalCash),
			Amount:      shift.InitialCash - finalCash,
			AccountID:   cashAccountID,
			EstablishmentID: shift.EstablishmentID,
		}
		if err := uc.transactionRepo.Create(ctx, transaction); err != nil {
			return nil, fmt.Errorf("failed to create incassation transaction: %w", err)
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