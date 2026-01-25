package usecases

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

type TableUseCase struct {
	tableRepo repositories.TableRepository
}

func NewTableUseCase(tableRepo repositories.TableRepository) *TableUseCase {
	return &TableUseCase{
		tableRepo: tableRepo,
	}
}

func (uc *TableUseCase) GetTableByID(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.Table, error) {
	table, err := uc.tableRepo.GetByID(ctx, id, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get table: %w", err)
	}
	return table, nil
}

func (uc *TableUseCase) ListTablesByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Table, error) {
	tables, err := uc.tableRepo.ListByEstablishmentID(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to list tables: %w", err)
	}
	return tables, nil
}

func (uc *TableUseCase) CreateTable(ctx context.Context, table *models.Table) error {
	if err := uc.tableRepo.Create(ctx, table); err != nil {
		return fmt.Errorf("failed to create table: %w", err)
	}
	return nil
}

func (uc *TableUseCase) UpdateTable(ctx context.Context, table *models.Table, establishmentID uuid.UUID) error {
	if err := uc.tableRepo.Update(ctx, table, establishmentID); err != nil {
		return fmt.Errorf("failed to update table: %w", err)
	}
	return nil
}

func (uc *TableUseCase) DeleteTable(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error {
	if err := uc.tableRepo.Delete(ctx, id, establishmentID); err != nil {
		return fmt.Errorf("failed to delete table: %w", err)
	}
	return nil
}