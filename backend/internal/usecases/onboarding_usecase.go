package usecases

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

type OnboardingUseCase struct {
	onboardingRepo   repositories.OnboardingRepository
	establishmentRepo repositories.EstablishmentRepository
	tableRepo        repositories.TableRepository
	userRepo         repositories.UserRepository
	accountUseCase   *AccountUseCase
}

func NewOnboardingUseCase(
	onboardingRepo repositories.OnboardingRepository,
	establishmentRepo repositories.EstablishmentRepository,
	tableRepo repositories.TableRepository,
	userRepo repositories.UserRepository,
	accountUseCase *AccountUseCase,
) *OnboardingUseCase {
	return &OnboardingUseCase{
		onboardingRepo:    onboardingRepo,
		establishmentRepo: establishmentRepo,
		tableRepo:         tableRepo,
		userRepo:          userRepo,
		accountUseCase:    accountUseCase,
	}
}

// GetQuestions возвращает все активные вопросы опросника, отсортированные по шагам
func (uc *OnboardingUseCase) GetQuestions(ctx context.Context) ([]*models.OnboardingQuestion, error) {
	return uc.onboardingRepo.GetQuestions(ctx)
}

// SubmitAnswers обрабатывает ответы пользователя и создает заведение
func (uc *OnboardingUseCase) SubmitAnswers(ctx context.Context, userID uuid.UUID, answers map[string]interface{}) (*models.Establishment, error) {
	// Проверяем, есть ли уже ответы у пользователя
	existingResponse, err := uc.onboardingRepo.GetResponseByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Создаем или обновляем ответы
	var response *models.OnboardingResponse
	if existingResponse != nil {
		response = existingResponse
		// Очищаем старые ответы
		response.Answers = []models.OnboardingAnswer{}
	} else {
		response = &models.OnboardingResponse{
			UserID:    userID,
			Completed: false,
			Answers:   []models.OnboardingAnswer{},
		}
	}

	// Сохраняем ответы
	for key, value := range answers {
		valueJSON, err := json.Marshal(value)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal answer for key %s: %w", key, err)
		}

		response.Answers = append(response.Answers, models.OnboardingAnswer{
			QuestionKey: key,
			Value:       string(valueJSON),
		})
	}

	// Валидация обязательных полей
	if err := uc.validateAnswers(answers); err != nil {
		return nil, err
	}

	// Создаем заведение на основе ответов
	establishment, err := uc.createEstablishmentFromAnswers(ctx, userID, answers)
	if err != nil {
		return nil, err
	}

	// Помечаем опросник как завершенный
	response.Completed = true
	if existingResponse != nil {
		if err := uc.onboardingRepo.UpdateResponse(ctx, response); err != nil {
			return nil, err
		}
	} else {
		if err := uc.onboardingRepo.CreateResponse(ctx, response); err != nil {
			return nil, err
		}
	}

	// Обновляем пользователя
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	user.OnboardingCompleted = true
	user.EstablishmentID = &establishment.ID
	if err := uc.userRepo.Update(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	// Создаем 3 счета по умолчанию для заведения
	if err := uc.accountUseCase.CreateDefaultAccounts(ctx, establishment.ID); err != nil {
		// Логируем ошибку, но не прерываем процесс (счета можно создать позже)
		// В production лучше использовать logger
		_ = err
	}

	return establishment, nil
}

// validateAnswers проверяет обязательные поля
func (uc *OnboardingUseCase) validateAnswers(answers map[string]interface{}) error {
	requiredFields := []string{
		"establishment_name",
		"address",
		"phone",
		"type",
		"has_seating_places",
		"has_takeaway",
		"has_delivery",
	}

	for _, field := range requiredFields {
		if _, ok := answers[field]; !ok {
			return fmt.Errorf("required field missing: %s", field)
		}
	}

	// Если есть сидячие места, проверяем количество столов
	if hasSeating, ok := answers["has_seating_places"].(bool); ok && hasSeating {
		if _, ok := answers["table_count"]; !ok {
			return errors.New("table_count is required when has_seating_places is true")
		}
	}

	return nil
}

// createEstablishmentFromAnswers создает заведение на основе ответов
func (uc *OnboardingUseCase) createEstablishmentFromAnswers(ctx context.Context, userID uuid.UUID, answers map[string]interface{}) (*models.Establishment, error) {
	establishment := &models.Establishment{
		OwnerID: userID,
	}

	// Базовые поля
	if name, ok := answers["establishment_name"].(string); ok {
		establishment.Name = name
	}
	if address, ok := answers["address"].(string); ok {
		establishment.Address = address
	}
	if phone, ok := answers["phone"].(string); ok {
		establishment.Phone = phone
	}
	if email, ok := answers["email"].(string); ok && email != "" {
		establishment.Email = email
	}

	// Тип заведения
	if typ, ok := answers["type"].(string); ok {
		establishment.Type = typ
	}

	// Настройки столов
	if hasSeating, ok := answers["has_seating_places"].(bool); ok {
		establishment.HasSeatingPlaces = hasSeating
		if hasSeating {
			if tableCount, ok := answers["table_count"].(float64); ok {
				count := int(tableCount)
				establishment.TableCount = &count
			}
		}
	}

	// Дополнительные настройки
	if hasDelivery, ok := answers["has_delivery"].(bool); ok {
		establishment.HasDelivery = hasDelivery
	}
	if hasTakeaway, ok := answers["has_takeaway"].(bool); ok {
		establishment.HasTakeaway = hasTakeaway
	}
	if hasReservations, ok := answers["has_reservations"].(bool); ok {
		establishment.HasReservations = hasReservations
	}

	establishment.Active = true

	// Создаем заведение
	if err := uc.establishmentRepo.Create(ctx, establishment); err != nil {
		return nil, err
	}

	// Если есть сидячие места, создаем столы
	if establishment.HasSeatingPlaces && establishment.TableCount != nil && *establishment.TableCount > 0 {
		tables := make([]*models.Table, 0, *establishment.TableCount)
		for i := 1; i <= *establishment.TableCount; i++ {
			tables = append(tables, &models.Table{
				EstablishmentID: establishment.ID,
				Number:          i,
				Capacity:        4, // по умолчанию 4 места
				PositionX:       0,
				PositionY:       0,
				Rotation:        0,
				Status:          "available",
				Active:          true,
			})
		}

		if err := uc.tableRepo.CreateBatch(ctx, tables); err != nil {
			return nil, err
		}
	}

	return establishment, nil
}

// GetUserResponse возвращает ответы пользователя
func (uc *OnboardingUseCase) GetUserResponse(ctx context.Context, userID uuid.UUID) (*models.OnboardingResponse, error) {
	return uc.onboardingRepo.GetResponseByUserID(ctx, userID)
}
