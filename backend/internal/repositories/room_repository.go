package repositories

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type RoomRepository interface {
	GetByID(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.Room, error)
	ListByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Room, error)
	Create(ctx context.Context, room *models.Room) error
	Update(ctx context.Context, room *models.Room, establishmentID uuid.UUID) error
	Delete(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error
}

type roomRepository struct {
	db *gorm.DB
}

func NewRoomRepository(db *gorm.DB) RoomRepository {
	return &roomRepository{db: db}
}

func (r *roomRepository) GetByID(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) (*models.Room, error) {
	var room models.Room
	err := r.db.WithContext(ctx).
		Preload("Tables").
		Where("establishment_id = ?", establishmentID).
		First(&room, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrRoomNotFound
		}
		return nil, err
	}
	return &room, nil
}

func (r *roomRepository) ListByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Room, error) {
	var rooms []*models.Room
	err := r.db.WithContext(ctx).
		Preload("Tables").
		Where("establishment_id = ?", establishmentID).
		Find(&rooms).Error
	return rooms, err
}

func (r *roomRepository) Create(ctx context.Context, room *models.Room) error {
	return r.db.WithContext(ctx).Create(room).Error
}

func (r *roomRepository) Update(ctx context.Context, room *models.Room, establishmentID uuid.UUID) error {
	return r.db.WithContext(ctx).Where("establishment_id = ?", establishmentID).Save(room).Error
}

func (r *roomRepository) Delete(ctx context.Context, id uuid.UUID, establishmentID uuid.UUID) error {
	return r.db.WithContext(ctx).Where("establishment_id = ?", establishmentID).Delete(&models.Room{}, "id = ?", id).Error
}
