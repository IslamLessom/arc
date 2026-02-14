package repositories

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

// ClientGroupRepository интерфейс для работы с группами клиентов
type ClientGroupRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*models.ClientGroup, error)
	GetAllByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.ClientGroup, error)
	Create(ctx context.Context, group *models.ClientGroup) error
	Update(ctx context.Context, group *models.ClientGroup) error
	Delete(ctx context.Context, id uuid.UUID) error
	UpdateCustomersCount(ctx context.Context, groupID uuid.UUID) error
}

type clientGroupRepository struct {
	db *gorm.DB
}

func NewClientGroupRepository(db *gorm.DB) ClientGroupRepository {
	return &clientGroupRepository{db: db}
}

func (r *clientGroupRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.ClientGroup, error) {
	var group models.ClientGroup
	err := r.db.WithContext(ctx).First(&group, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrClientGroupNotFound
		}
		return nil, err
	}
	return &group, nil
}

func (r *clientGroupRepository) GetAllByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.ClientGroup, error) {
	var groups []*models.ClientGroup
	err := r.db.WithContext(ctx).
		Where("establishment_id = ?", establishmentID).
		Find(&groups).Error
	if err != nil {
		return nil, err
	}
	return groups, nil
}

func (r *clientGroupRepository) Create(ctx context.Context, group *models.ClientGroup) error {
	return r.db.WithContext(ctx).Create(group).Error
}

func (r *clientGroupRepository) Update(ctx context.Context, group *models.ClientGroup) error {
	return r.db.WithContext(ctx).Save(group).Error
}

func (r *clientGroupRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.ClientGroup{}, "id = ?", id).Error
}

func (r *clientGroupRepository) UpdateCustomersCount(ctx context.Context, groupID uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&models.ClientGroup{}).
		Where("id = ?", groupID).
		Update("customers_count", gorm.Expr(
			"(SELECT COUNT(*) FROM clients WHERE group_id = ? AND deleted_at IS NULL)",
			groupID,
		)).Error
}

// LoyaltyProgramRepository интерфейс для работы с программами лояльности
type LoyaltyProgramRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*models.LoyaltyProgram, error)
	GetAllByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.LoyaltyProgram, error)
	Create(ctx context.Context, program *models.LoyaltyProgram) error
	Update(ctx context.Context, program *models.LoyaltyProgram) error
	Delete(ctx context.Context, id uuid.UUID) error
	UpdateMembersCount(ctx context.Context, programID uuid.UUID) error
}

type loyaltyProgramRepository struct {
	db *gorm.DB
}

func NewLoyaltyProgramRepository(db *gorm.DB) LoyaltyProgramRepository {
	return &loyaltyProgramRepository{db: db}
}

func (r *loyaltyProgramRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.LoyaltyProgram, error) {
	var program models.LoyaltyProgram
	err := r.db.WithContext(ctx).First(&program, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrLoyaltyProgramNotFound
		}
		return nil, err
	}
	return &program, nil
}

func (r *loyaltyProgramRepository) GetAllByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.LoyaltyProgram, error) {
	var programs []*models.LoyaltyProgram
	err := r.db.WithContext(ctx).
		Where("establishment_id = ?", establishmentID).
		Find(&programs).Error
	if err != nil {
		return nil, err
	}
	return programs, nil
}

func (r *loyaltyProgramRepository) Create(ctx context.Context, program *models.LoyaltyProgram) error {
	return r.db.WithContext(ctx).Create(program).Error
}

func (r *loyaltyProgramRepository) Update(ctx context.Context, program *models.LoyaltyProgram) error {
	return r.db.WithContext(ctx).Save(program).Error
}

func (r *loyaltyProgramRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.LoyaltyProgram{}, "id = ?", id).Error
}

func (r *loyaltyProgramRepository) UpdateMembersCount(ctx context.Context, programID uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&models.LoyaltyProgram{}).
		Where("id = ?", programID).
		Update("members_count", gorm.Expr(
			"(SELECT COUNT(*) FROM clients WHERE loyalty_program_id = ? AND deleted_at IS NULL)",
			programID,
		)).Error
}

// PromotionRepository интерфейс для работы с акциями
type PromotionRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*models.Promotion, error)
	GetAllByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Promotion, error)
	GetActive(ctx context.Context, establishmentID uuid.UUID) ([]*models.Promotion, error)
	Create(ctx context.Context, promotion *models.Promotion) error
	Update(ctx context.Context, promotion *models.Promotion) error
	Delete(ctx context.Context, id uuid.UUID) error
	IncrementUsageCount(ctx context.Context, promotionID uuid.UUID) error
}

type promotionRepository struct {
	db *gorm.DB
}

func NewPromotionRepository(db *gorm.DB) PromotionRepository {
	return &promotionRepository{db: db}
}

func (r *promotionRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Promotion, error) {
	var promotion models.Promotion
	err := r.db.WithContext(ctx).First(&promotion, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPromotionNotFound
		}
		return nil, err
	}
	return &promotion, nil
}

func (r *promotionRepository) GetAllByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Promotion, error) {
	var promotions []*models.Promotion
	err := r.db.WithContext(ctx).
		Where("establishment_id = ?", establishmentID).
		Find(&promotions).Error
	if err != nil {
		return nil, err
	}
	return promotions, nil
}

func (r *promotionRepository) GetActive(ctx context.Context, establishmentID uuid.UUID) ([]*models.Promotion, error) {
	var promotions []*models.Promotion
	now := r.db.NowFunc()
	err := r.db.WithContext(ctx).
		Where("establishment_id = ? AND active = ? AND start_date <= ? AND end_date >= ?",
			establishmentID, true, now, now).
		Find(&promotions).Error
	if err != nil {
		return nil, err
	}
	return promotions, nil
}

func (r *promotionRepository) Create(ctx context.Context, promotion *models.Promotion) error {
	return r.db.WithContext(ctx).Create(promotion).Error
}

func (r *promotionRepository) Update(ctx context.Context, promotion *models.Promotion) error {
	return r.db.WithContext(ctx).Save(promotion).Error
}

func (r *promotionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Promotion{}, "id = ?", id).Error
}

func (r *promotionRepository) IncrementUsageCount(ctx context.Context, promotionID uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&models.Promotion{}).
		Where("id = ?", promotionID).
		Update("usage_count", gorm.Expr("usage_count + 1")).Error
}

// ExclusionRepository интерфейс для работы с исключениями
type ExclusionRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*models.Exclusion, error)
	GetAllByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Exclusion, error)
	GetActive(ctx context.Context, establishmentID uuid.UUID) ([]*models.Exclusion, error)
	Create(ctx context.Context, exclusion *models.Exclusion) error
	Update(ctx context.Context, exclusion *models.Exclusion) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type exclusionRepository struct {
	db *gorm.DB
}

func NewExclusionRepository(db *gorm.DB) ExclusionRepository {
	return &exclusionRepository{db: db}
}

func (r *exclusionRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Exclusion, error) {
	var exclusion models.Exclusion
	err := r.db.WithContext(ctx).First(&exclusion, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrExclusionNotFound
		}
		return nil, err
	}
	return &exclusion, nil
}

func (r *exclusionRepository) GetAllByEstablishmentID(ctx context.Context, establishmentID uuid.UUID) ([]*models.Exclusion, error) {
	var exclusions []*models.Exclusion
	err := r.db.WithContext(ctx).
		Where("establishment_id = ?", establishmentID).
		Find(&exclusions).Error
	if err != nil {
		return nil, err
	}
	return exclusions, nil
}

func (r *exclusionRepository) GetActive(ctx context.Context, establishmentID uuid.UUID) ([]*models.Exclusion, error) {
	var exclusions []*models.Exclusion
	err := r.db.WithContext(ctx).
		Where("establishment_id = ? AND active = ?", establishmentID, true).
		Find(&exclusions).Error
	if err != nil {
		return nil, err
	}
	return exclusions, nil
}

func (r *exclusionRepository) Create(ctx context.Context, exclusion *models.Exclusion) error {
	return r.db.WithContext(ctx).Create(exclusion).Error
}

func (r *exclusionRepository) Update(ctx context.Context, exclusion *models.Exclusion) error {
	return r.db.WithContext(ctx).Save(exclusion).Error
}

func (r *exclusionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Exclusion{}, "id = ?", id).Error
}
