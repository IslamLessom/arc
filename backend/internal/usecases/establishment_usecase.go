package usecases

import (
	"context"

	"github.com/google/uuid"
	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

type EstablishmentUseCase struct {
	repo      repositories.EstablishmentRepository
	tableRepo repositories.TableRepository
	roomRepo  repositories.RoomRepository
}

func NewEstablishmentUseCase(
	repo repositories.EstablishmentRepository,
	tableRepo repositories.TableRepository,
	roomRepo repositories.RoomRepository,
) *EstablishmentUseCase {
	return &EstablishmentUseCase{
		repo:      repo,
		tableRepo: tableRepo,
		roomRepo:  roomRepo,
	}
}

// GetByID возвращает заведение по ID
func (uc *EstablishmentUseCase) GetByID(ctx context.Context, id uuid.UUID) (*models.Establishment, error) {
	return uc.repo.GetByID(ctx, id)
}

// ListByEstablishment возвращает заведение по ID (для "моё заведение" — 0 или 1 элемент)
func (uc *EstablishmentUseCase) ListByEstablishment(ctx context.Context, establishmentID uuid.UUID) ([]*models.Establishment, error) {
	e, err := uc.repo.GetByID(ctx, establishmentID)
	if err != nil {
		return []*models.Establishment{}, nil
	}
	return []*models.Establishment{e}, nil
}

// Update обновляет заведение
func (uc *EstablishmentUseCase) Update(ctx context.Context, e *models.Establishment) error {
	return uc.repo.Update(ctx, e)
}

// CreateWithSettings создает заведение с настройками из опросника
// Если has_seating_places = true, автоматически создает зал и столы
func (uc *EstablishmentUseCase) CreateWithSettings(ctx context.Context, establishment *models.Establishment) error {
	// Создаем заведение
	if err := uc.repo.Create(ctx, establishment); err != nil {
		return err
	}

	// Если есть сидячие места, создаем зал по умолчанию и столы
	if establishment.HasSeatingPlaces && establishment.TableCount != nil && *establishment.TableCount > 0 {
		// Сначала создаем зал по умолчанию
		defaultRoom := &models.Room{
			EstablishmentID: establishment.ID,
			Name:            "Основной зал",
			Floor:           1,
			Active:          true,
		}
		if err := uc.roomRepo.Create(ctx, defaultRoom); err != nil {
			return err
		}

		// Затем создаем столы, привязанные к залу
		tables := make([]*models.Table, 0, *establishment.TableCount)
		for i := 1; i <= *establishment.TableCount; i++ {
			tables = append(tables, &models.Table{
				RoomID:    defaultRoom.ID,
				Number:    i,
				Capacity:  4, // по умолчанию 4 места
				PositionX: 0, // Координаты будут установлены при визуальной расстановке
				PositionY: 0,
				Rotation:  0,
				Status:    "available",
				Active:    true,
			})
		}

		if err := uc.tableRepo.CreateBatch(ctx, tables); err != nil {
			return err
		}
	}

	return nil
}