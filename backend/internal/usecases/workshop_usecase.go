package usecases

import (
	"context"

	"github.com/google/uuid"
	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

type WorkshopUseCase struct {
	repo repositories.WorkshopRepository
}

func NewWorkshopUseCase(repo repositories.WorkshopRepository) *WorkshopUseCase {
	return &WorkshopUseCase{
		repo: repo,
	}
}

func (uc *WorkshopUseCase) ListWorkshops(ctx context.Context, establishmentID uuid.UUID) ([]*models.Workshop, error) {
	return uc.repo.ListWorkshops(ctx, establishmentID)
}

func (uc *WorkshopUseCase) GetWorkshop(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.Workshop, error) {
	return uc.repo.GetWorkshopByID(ctx, id, &establishmentID)
}

func (uc *WorkshopUseCase) CreateWorkshop(ctx context.Context, w *models.Workshop, establishmentID uuid.UUID) error {
	w.EstablishmentID = establishmentID
	return uc.repo.CreateWorkshop(ctx, w)
}

func (uc *WorkshopUseCase) UpdateWorkshop(ctx context.Context, w *models.Workshop, establishmentID uuid.UUID) error {
	if _, err := uc.repo.GetWorkshopByID(ctx, w.ID, &establishmentID); err != nil {
		return err
	}
	return uc.repo.UpdateWorkshop(ctx, w)
}

func (uc *WorkshopUseCase) DeleteWorkshop(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error {
	if _, err := uc.repo.GetWorkshopByID(ctx, id, &establishmentID); err != nil {
		return err
	}
	return uc.repo.DeleteWorkshop(ctx, id)
}
