package usecases

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

type AdvanceUseCase struct {
	advanceRepo repositories.AdvanceRepository
	userRepo    repositories.UserRepository
}

func NewAdvanceUseCase(
	advanceRepo repositories.AdvanceRepository,
	userRepo repositories.UserRepository,
) *AdvanceUseCase {
	return &AdvanceUseCase{
		advanceRepo: advanceRepo,
		userRepo:    userRepo,
	}
}

// CreateAdvance создаёт новый аванс для сотрудника
func (uc *AdvanceUseCase) CreateAdvance(ctx context.Context, userID, establishmentID uuid.UUID, amount float64, description *string) (*models.Advance, error) {
	// Проверяем что пользователь существует и принадлежит заведению
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	if user.EstablishmentID == nil || *user.EstablishmentID != establishmentID {
		return nil, fmt.Errorf("user does not belong to this establishment")
	}

	advance := &models.Advance{
		UserID:          userID,
		EstablishmentID: establishmentID,
		Amount:          amount,
		GivenDate:       time.Now(),
		Description:     description,
		Status:          "pending",
	}

	if err := uc.advanceRepo.Create(ctx, advance); err != nil {
		return nil, fmt.Errorf("failed to create advance: %w", err)
	}

	return advance, nil
}

// GetAdvanceByID получает аванс по ID
func (uc *AdvanceUseCase) GetAdvanceByID(ctx context.Context, id uuid.UUID) (*models.Advance, error) {
	return uc.advanceRepo.GetByID(ctx, id)
}

// ListAdvancesByEstablishment получает все авансы заведения
func (uc *AdvanceUseCase) ListAdvancesByEstablishment(ctx context.Context, establishmentID uuid.UUID) ([]*models.Advance, error) {
	return uc.advanceRepo.ListByEstablishmentID(ctx, establishmentID)
}

// ListAdvancesByUser получает авансы конкретного сотрудника
func (uc *AdvanceUseCase) ListAdvancesByUser(ctx context.Context, userID uuid.UUID) ([]*models.Advance, error) {
	return uc.advanceRepo.ListByUserID(ctx, userID)
}

// ListPendingAdvances получает все необработанные авансы заведения
func (uc *AdvanceUseCase) ListPendingAdvances(ctx context.Context, establishmentID uuid.UUID) ([]*models.Advance, error) {
	return uc.advanceRepo.ListPendingByEstablishmentID(ctx, establishmentID)
}

// ApplyAdvancesToSalaryPeriod помечает авансы как применённые за определённый период зарплаты
func (uc *AdvanceUseCase) ApplyAdvancesToSalaryPeriod(ctx context.Context, userID uuid.UUID, periodStart, periodEnd time.Time) ([]*models.Advance, error) {
	advances, err := uc.advanceRepo.ListByUserIDAndStatus(ctx, userID, "pending")
	if err != nil {
		return nil, fmt.Errorf("failed to get advances: %w", err)
	}

	for _, advance := range advances {
		advance.Status = "applied"
		advance.AppliedToSalaryPeriodStart = &periodStart
		advance.AppliedToSalaryPeriodEnd = &periodEnd

		if err := uc.advanceRepo.Update(ctx, advance); err != nil {
			return nil, fmt.Errorf("failed to update advance: %w", err)
		}
	}

	return advances, nil
}

// DeleteAdvance удаляет аванс (только если он в статусе pending)
func (uc *AdvanceUseCase) DeleteAdvance(ctx context.Context, id uuid.UUID) error {
	advance, err := uc.advanceRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get advance: %w", err)
	}

	if advance.Status != "pending" {
		return fmt.Errorf("cannot delete advance with status %s", advance.Status)
	}

	return uc.advanceRepo.Delete(ctx, id)
}
