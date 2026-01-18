package repositories

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type OnboardingRepository interface {
	// Questions
	GetQuestions(ctx context.Context) ([]*models.OnboardingQuestion, error)
	GetQuestionByKey(ctx context.Context, key string) (*models.OnboardingQuestion, error)
	
	// Responses
	GetResponseByUserID(ctx context.Context, userID uuid.UUID) (*models.OnboardingResponse, error)
	CreateResponse(ctx context.Context, response *models.OnboardingResponse) error
	UpdateResponse(ctx context.Context, response *models.OnboardingResponse) error
	DeleteResponse(ctx context.Context, userID uuid.UUID) error
}

type onboardingRepository struct {
	db *gorm.DB
}

func NewOnboardingRepository(db *gorm.DB) OnboardingRepository {
	return &onboardingRepository{db: db}
}

func (r *onboardingRepository) GetQuestions(ctx context.Context) ([]*models.OnboardingQuestion, error) {
	var questions []*models.OnboardingQuestion
	err := r.db.WithContext(ctx).
		Where("active = ?", true).
		Preload("Options").
		Order("step ASC, \"order\" ASC").
		Find(&questions).Error
	return questions, err
}

func (r *onboardingRepository) GetQuestionByKey(ctx context.Context, key string) (*models.OnboardingQuestion, error) {
	var question models.OnboardingQuestion
	err := r.db.WithContext(ctx).
		Where("key = ? AND active = ?", key, true).
		Preload("Options").
		First(&question).Error
	return &question, err
}

func (r *onboardingRepository) GetResponseByUserID(ctx context.Context, userID uuid.UUID) (*models.OnboardingResponse, error) {
	var response models.OnboardingResponse
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Preload("Answers").
		First(&response).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &response, err
}

func (r *onboardingRepository) CreateResponse(ctx context.Context, response *models.OnboardingResponse) error {
	return r.db.WithContext(ctx).Create(response).Error
}

func (r *onboardingRepository) UpdateResponse(ctx context.Context, response *models.OnboardingResponse) error {
	return r.db.WithContext(ctx).Session(&gorm.Session{FullSaveAssociations: true}).Save(response).Error
}

func (r *onboardingRepository) DeleteResponse(ctx context.Context, userID uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.OnboardingResponse{}, "user_id = ?", userID).Error
}
