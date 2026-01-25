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
	shiftRepo       repositories.ShiftRepository
	userRepo        repositories.UserRepository
	transactionRepo repositories.TransactionRepository
}

func NewShiftUseCase(shiftRepo repositories.ShiftRepository, userRepo repositories.UserRepository, transactionRepo repositories.TransactionRepository) *ShiftUseCase {
	return &ShiftUseCase{
		shiftRepo:       shiftRepo,
		userRepo:        userRepo,
		transactionRepo: transactionRepo,
	}
}

func (uc *ShiftUseCase) GetShiftByID(ctx context.Context, id uuid.UUID) (*models.Shift, error) {
	shift, err := uc.shiftRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get shift: %w", err)
	}
	return shift, nil
}

func (uc *ShiftUseCase) GetCurrentActiveShift(ctx context.Context, userID uuid.UUID) (*models.Shift, error) {
	shift, err := uc.shiftRepo.GetActiveShiftByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get active shift: %w", err)
	}
	return shift, nil
}

func (uc *ShiftUseCase) StartShift(ctx context.Context, userID uuid.UUID, establishmentID uuid.UUID, initialCash float64) (*models.Shift, error) {
	// Проверяем, нет ли уже активной смены для этого пользователя
	if existingShift, _ := uc.shiftRepo.GetActiveShiftByUserID(ctx, userID); existingShift != nil {
		return nil, errors.New("user already has an active shift")
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