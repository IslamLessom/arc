package usecases

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

type RoomUseCase struct {
	roomRepo repositories.RoomRepository
}

func NewRoomUseCase(roomRepo repositories.RoomRepository) *RoomUseCase {
	return &RoomUseCase{
		roomRepo: roomRepo,
	}
}

func (uc *RoomUseCase) GetRoomByID(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.Room, error) {
	room, err := uc.roomRepo.GetByID(ctx, id, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get room: %w", err)
	}
	return room, nil
}

func (uc *RoomUseCase) ListRoomsByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Room, error) {
	rooms, err := uc.roomRepo.ListByEstablishmentID(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to list rooms: %w", err)
	}
	return rooms, nil
}

func (uc *RoomUseCase) CreateRoom(ctx context.Context, room *models.Room) error {
	if err := uc.roomRepo.Create(ctx, room); err != nil {
		return fmt.Errorf("failed to create room: %w", err)
	}
	return nil
}

func (uc *RoomUseCase) UpdateRoom(ctx context.Context, room *models.Room, establishmentID uuid.UUID) error {
	if err := uc.roomRepo.Update(ctx, room, establishmentID); err != nil {
		return fmt.Errorf("failed to update room: %w", err)
	}
	return nil
}

func (uc *RoomUseCase) DeleteRoom(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error {
	if err := uc.roomRepo.Delete(ctx, id, establishmentID); err != nil {
		return fmt.Errorf("failed to delete room: %w", err)
	}
	return nil
}
