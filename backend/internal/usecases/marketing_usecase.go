package usecases

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

// MarketingUseCase содержит бизнес-логику для маркетинга
type MarketingUseCase struct {
	clientRepo        repositories.ClientRepository
	clientGroupRepo  repositories.ClientGroupRepository
	loyaltyRepo      repositories.LoyaltyProgramRepository
	promotionRepo    repositories.PromotionRepository
	exclusionRepo    repositories.ExclusionRepository
	logger           *zap.Logger
}

func NewMarketingUseCase(
	clientRepo repositories.ClientRepository,
	clientGroupRepo repositories.ClientGroupRepository,
	loyaltyRepo repositories.LoyaltyProgramRepository,
	promotionRepo repositories.PromotionRepository,
	exclusionRepo repositories.ExclusionRepository,
	logger *zap.Logger,
) *MarketingUseCase {
	return &MarketingUseCase{
		clientRepo:        clientRepo,
		clientGroupRepo:  clientGroupRepo,
		loyaltyRepo:      loyaltyRepo,
		promotionRepo:    promotionRepo,
		exclusionRepo:    exclusionRepo,
		logger:           logger,
	}
}

// ===== CLIENTS =====

// CreateClient creates a new client
func (uc *MarketingUseCase) CreateClient(
	ctx context.Context,
	name string,
	email *string,
	phone *string,
	birthday *string,
	groupID *uuid.UUID,
	loyaltyProgramID *uuid.UUID,
	establishmentID uuid.UUID,
) (*models.Client, error) {
	if name == "" {
		return nil, errors.New("client name is required")
	}

	client := &models.Client{
		Name:             name,
		Email:            email,
		Phone:            phone,
		GroupID:          groupID,
		LoyaltyProgramID:  loyaltyProgramID,
		EstablishmentID:   establishmentID,
		LoyaltyPoints:     0,
		TotalOrders:       0,
		TotalSpent:        0,
	}

	if birthday != nil {
		parsedTime, err := parseDate(*birthday)
		if err == nil {
			client.Birthday = &parsedTime
		}
	}

	if err := uc.clientRepo.Create(ctx, client); err != nil {
		return nil, fmt.Errorf("failed to create client: %w", err)
	}

	return client, nil
}

// GetClient retrieves a client by ID
func (uc *MarketingUseCase) GetClient(ctx context.Context, clientID uuid.UUID) (*models.Client, error) {
	client, err := uc.clientRepo.GetByID(ctx, clientID)
	if err != nil {
		return nil, err
	}
	return client, nil
}

// ListClients returns all clients for an establishment
func (uc *MarketingUseCase) ListClients(ctx context.Context, establishmentID uuid.UUID) ([]*models.Client, error) {
	clients, err := uc.clientRepo.GetAllByEstablishmentID(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to list clients: %w", err)
	}
	return clients, nil
}

// UpdateClient updates an existing client
func (uc *MarketingUseCase) UpdateClient(
	ctx context.Context,
	clientID uuid.UUID,
	name string,
	email *string,
	phone *string,
	birthday *string,
	groupID *uuid.UUID,
	loyaltyProgramID *uuid.UUID,
	establishmentID uuid.UUID,
) (*models.Client, error) {
	client, err := uc.clientRepo.GetByID(ctx, clientID)
	if err != nil {
		return nil, err
	}

	if name != "" {
		client.Name = name
	}
	client.Email = email
	client.Phone = phone
	client.GroupID = groupID
	client.LoyaltyProgramID = loyaltyProgramID

	if birthday != nil {
		parsedTime, err := parseDate(*birthday)
		if err == nil {
			client.Birthday = &parsedTime
		}
	}

	if err := uc.clientRepo.Update(ctx, client); err != nil {
		return nil, fmt.Errorf("failed to update client: %w", err)
	}

	return client, nil
}

// DeleteClient deletes a client
func (uc *MarketingUseCase) DeleteClient(ctx context.Context, clientID uuid.UUID) error {
	if err := uc.clientRepo.Delete(ctx, clientID); err != nil {
		return fmt.Errorf("failed to delete client: %w", err)
	}
	return nil
}

// AddClientLoyaltyPoints adds loyalty points to a client
func (uc *MarketingUseCase) AddClientLoyaltyPoints(ctx context.Context, clientID uuid.UUID, points int) error {
	if points <= 0 {
		return errors.New("points must be positive")
	}
	if err := uc.clientRepo.AddLoyaltyPoints(ctx, clientID, points); err != nil {
		return fmt.Errorf("failed to add loyalty points: %w", err)
	}
	return nil
}

// RedeemClientLoyaltyPoints redeems loyalty points from a client
func (uc *MarketingUseCase) RedeemClientLoyaltyPoints(ctx context.Context, clientID uuid.UUID, points int) error {
	if points <= 0 {
		return errors.New("points must be positive")
	}
	if err := uc.clientRepo.RedeemLoyaltyPoints(ctx, clientID, points); err != nil {
		return fmt.Errorf("failed to redeem loyalty points: %w", err)
	}
	return nil
}

// ===== CLIENT GROUPS =====

// CreateClientGroup creates a new client group
func (uc *MarketingUseCase) CreateClientGroup(
	ctx context.Context,
	name string,
	description *string,
	discountPercentage float64,
	minOrders *int,
	minSpent *float64,
	establishmentID uuid.UUID,
) (*models.ClientGroup, error) {
	if name == "" {
		return nil, errors.New("group name is required")
	}

	group := &models.ClientGroup{
		Name:               name,
		Description:         description,
		DiscountPercentage:  discountPercentage,
		MinOrders:          minOrders,
		MinSpent:           minSpent,
		EstablishmentID:    establishmentID,
		CustomersCount:     0,
	}

	if err := uc.clientGroupRepo.Create(ctx, group); err != nil {
		return nil, fmt.Errorf("failed to create client group: %w", err)
	}

	return group, nil
}

// GetClientGroup retrieves a client group by ID
func (uc *MarketingUseCase) GetClientGroup(ctx context.Context, groupID uuid.UUID) (*models.ClientGroup, error) {
	group, err := uc.clientGroupRepo.GetByID(ctx, groupID)
	if err != nil {
		return nil, err
	}
	return group, nil
}

// ListClientGroups returns all client groups for an establishment
func (uc *MarketingUseCase) ListClientGroups(ctx context.Context, establishmentID uuid.UUID) ([]*models.ClientGroup, error) {
	groups, err := uc.clientGroupRepo.GetAllByEstablishmentID(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to list client groups: %w", err)
	}
	return groups, nil
}

// UpdateClientGroup updates an existing client group
func (uc *MarketingUseCase) UpdateClientGroup(
	ctx context.Context,
	groupID uuid.UUID,
	name string,
	description *string,
	discountPercentage float64,
	minOrders *int,
	minSpent *float64,
	establishmentID uuid.UUID,
) (*models.ClientGroup, error) {
	group, err := uc.clientGroupRepo.GetByID(ctx, groupID)
	if err != nil {
		return nil, err
	}

	if name != "" {
		group.Name = name
	}
	group.Description = description
	group.DiscountPercentage = discountPercentage
	group.MinOrders = minOrders
	group.MinSpent = minSpent

	if err := uc.clientGroupRepo.Update(ctx, group); err != nil {
		return nil, fmt.Errorf("failed to update client group: %w", err)
	}

	return group, nil
}

// DeleteClientGroup deletes a client group
func (uc *MarketingUseCase) DeleteClientGroup(ctx context.Context, groupID uuid.UUID) error {
	if err := uc.clientGroupRepo.Delete(ctx, groupID); err != nil {
		return fmt.Errorf("failed to delete client group: %w", err)
	}
	return nil
}

// ===== LOYALTY PROGRAMS =====

// CreateLoyaltyProgram creates a new loyalty program
func (uc *MarketingUseCase) CreateLoyaltyProgram(
	ctx context.Context,
	name string,
	description *string,
	programType string,
	pointsPerCurrency *int,
	cashbackPercentage *float64,
	maxCashbackAmount *float64,
	pointMultiplier float64,
	establishmentID uuid.UUID,
) (*models.LoyaltyProgram, error) {
	if name == "" {
		return nil, errors.New("program name is required")
	}
	if programType == "" {
		return nil, errors.New("program type is required")
	}

	program := &models.LoyaltyProgram{
		Name:               name,
		Description:         description,
		Type:               programType,
		PointsPerCurrency:  pointsPerCurrency,
		CashbackPercentage: cashbackPercentage,
		MaxCashbackAmount:  maxCashbackAmount,
		PointMultiplier:     pointMultiplier,
		Active:             true,
		MembersCount:        0,
		EstablishmentID:    establishmentID,
	}

	if err := uc.loyaltyRepo.Create(ctx, program); err != nil {
		return nil, fmt.Errorf("failed to create loyalty program: %w", err)
	}

	return program, nil
}

// GetLoyaltyProgram retrieves a loyalty program by ID
func (uc *MarketingUseCase) GetLoyaltyProgram(ctx context.Context, programID uuid.UUID) (*models.LoyaltyProgram, error) {
	program, err := uc.loyaltyRepo.GetByID(ctx, programID)
	if err != nil {
		return nil, err
	}
	return program, nil
}

// ListLoyaltyPrograms returns all loyalty programs for an establishment
func (uc *MarketingUseCase) ListLoyaltyPrograms(ctx context.Context, establishmentID uuid.UUID) ([]*models.LoyaltyProgram, error) {
	programs, err := uc.loyaltyRepo.GetAllByEstablishmentID(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to list loyalty programs: %w", err)
	}
	return programs, nil
}

// UpdateLoyaltyProgram updates an existing loyalty program
func (uc *MarketingUseCase) UpdateLoyaltyProgram(
	ctx context.Context,
	programID uuid.UUID,
	name string,
	description *string,
	programType string,
	pointsPerCurrency *int,
	cashbackPercentage *float64,
	maxCashbackAmount *float64,
	pointMultiplier float64,
	active bool,
) (*models.LoyaltyProgram, error) {
	program, err := uc.loyaltyRepo.GetByID(ctx, programID)
	if err != nil {
		return nil, err
	}

	if name != "" {
		program.Name = name
	}
	program.Description = description
	program.Type = programType
	program.PointsPerCurrency = pointsPerCurrency
	program.CashbackPercentage = cashbackPercentage
	program.MaxCashbackAmount = maxCashbackAmount
	program.PointMultiplier = pointMultiplier
	program.Active = active

	if err := uc.loyaltyRepo.Update(ctx, program); err != nil {
		return nil, fmt.Errorf("failed to update loyalty program: %w", err)
	}

	return program, nil
}

// DeleteLoyaltyProgram deletes a loyalty program
func (uc *MarketingUseCase) DeleteLoyaltyProgram(ctx context.Context, programID uuid.UUID) error {
	if err := uc.loyaltyRepo.Delete(ctx, programID); err != nil {
		return fmt.Errorf("failed to delete loyalty program: %w", err)
	}
	return nil
}

// ===== PROMOTIONS =====

// CreatePromotion creates a new promotion
func (uc *MarketingUseCase) CreatePromotion(
	ctx context.Context,
	name string,
	description *string,
	promotionType string,
	discountPercentage *float64,
	buyQuantity *int,
	getQuantity *int,
	startDate string,
	endDate string,
	establishmentID uuid.UUID,
) (*models.Promotion, error) {
	if name == "" {
		return nil, errors.New("promotion name is required")
	}
	if promotionType == "" {
		return nil, errors.New("promotion type is required")
	}

	start, err := parseDate(startDate)
	if err != nil {
		return nil, fmt.Errorf("invalid start date: %w", err)
	}

	end, err := parseDate(endDate)
	if err != nil {
		return nil, fmt.Errorf("invalid end date: %w", err)
	}

	promotion := &models.Promotion{
		Name:               name,
		Description:         description,
		Type:               promotionType,
		DiscountPercentage:  discountPercentage,
		BuyQuantity:        buyQuantity,
		GetQuantity:         getQuantity,
		StartDate:           start,
		EndDate:             end,
		Active:             true,
		UsageCount:          0,
		EstablishmentID:     establishmentID,
	}

	if err := uc.promotionRepo.Create(ctx, promotion); err != nil {
		return nil, fmt.Errorf("failed to create promotion: %w", err)
	}

	return promotion, nil
}

// GetPromotion retrieves a promotion by ID
func (uc *MarketingUseCase) GetPromotion(ctx context.Context, promotionID uuid.UUID) (*models.Promotion, error) {
	promotion, err := uc.promotionRepo.GetByID(ctx, promotionID)
	if err != nil {
		return nil, err
	}
	return promotion, nil
}

// ListPromotions returns all promotions for an establishment
func (uc *MarketingUseCase) ListPromotions(ctx context.Context, establishmentID uuid.UUID) ([]*models.Promotion, error) {
	promotions, err := uc.promotionRepo.GetAllByEstablishmentID(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to list promotions: %w", err)
	}
	return promotions, nil
}

// UpdatePromotion updates an existing promotion
func (uc *MarketingUseCase) UpdatePromotion(
	ctx context.Context,
	promotionID uuid.UUID,
	name string,
	description *string,
	promotionType string,
	discountPercentage *float64,
	buyQuantity *int,
	getQuantity *int,
	startDate string,
	endDate string,
	active bool,
) (*models.Promotion, error) {
	promotion, err := uc.promotionRepo.GetByID(ctx, promotionID)
	if err != nil {
		return nil, err
	}

	if name != "" {
		promotion.Name = name
	}
	promotion.Description = description
	promotion.Type = promotionType
	promotion.DiscountPercentage = discountPercentage
	promotion.BuyQuantity = buyQuantity
	promotion.GetQuantity = getQuantity

	if startDate != "" {
		start, err := parseDate(startDate)
		if err == nil {
			promotion.StartDate = start
		}
	}

	if endDate != "" {
		end, err := parseDate(endDate)
		if err == nil {
			promotion.EndDate = end
		}
	}

	promotion.Active = active

	if err := uc.promotionRepo.Update(ctx, promotion); err != nil {
		return nil, fmt.Errorf("failed to update promotion: %w", err)
	}

	return promotion, nil
}

// DeletePromotion deletes a promotion
func (uc *MarketingUseCase) DeletePromotion(ctx context.Context, promotionID uuid.UUID) error {
	if err := uc.promotionRepo.Delete(ctx, promotionID); err != nil {
		return fmt.Errorf("failed to delete promotion: %w", err)
	}
	return nil
}

// ===== EXCLUSIONS =====

// CreateExclusion creates a new exclusion
func (uc *MarketingUseCase) CreateExclusion(
	ctx context.Context,
	name string,
	description *string,
	exclusionType string,
	entityID *uuid.UUID,
	entityName *string,
	establishmentID uuid.UUID,
) (*models.Exclusion, error) {
	if name == "" {
		return nil, errors.New("exclusion name is required")
	}
	if exclusionType == "" {
		return nil, errors.New("exclusion type is required")
	}

	exclusion := &models.Exclusion{
		Name:             name,
		Description:       description,
		Type:             exclusionType,
		EntityID:          entityID,
		EntityName:        entityName,
		Active:            true,
		EstablishmentID:    establishmentID,
	}

	if err := uc.exclusionRepo.Create(ctx, exclusion); err != nil {
		return nil, fmt.Errorf("failed to create exclusion: %w", err)
	}

	return exclusion, nil
}

// GetExclusion retrieves an exclusion by ID
func (uc *MarketingUseCase) GetExclusion(ctx context.Context, exclusionID uuid.UUID) (*models.Exclusion, error) {
	exclusion, err := uc.exclusionRepo.GetByID(ctx, exclusionID)
	if err != nil {
		return nil, err
	}
	return exclusion, nil
}

// ListExclusions returns all exclusions for an establishment
func (uc *MarketingUseCase) ListExclusions(ctx context.Context, establishmentID uuid.UUID) ([]*models.Exclusion, error) {
	exclusions, err := uc.exclusionRepo.GetAllByEstablishmentID(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to list exclusions: %w", err)
	}
	return exclusions, nil
}

// UpdateExclusion updates an existing exclusion
func (uc *MarketingUseCase) UpdateExclusion(
	ctx context.Context,
	exclusionID uuid.UUID,
	name string,
	description *string,
	exclusionType string,
	entityID *uuid.UUID,
	entityName *string,
	active bool,
) (*models.Exclusion, error) {
	exclusion, err := uc.exclusionRepo.GetByID(ctx, exclusionID)
	if err != nil {
		return nil, err
	}

	if name != "" {
		exclusion.Name = name
	}
	exclusion.Description = description
	exclusion.Type = exclusionType
	exclusion.EntityID = entityID
	exclusion.EntityName = entityName
	exclusion.Active = active

	if err := uc.exclusionRepo.Update(ctx, exclusion); err != nil {
		return nil, fmt.Errorf("failed to update exclusion: %w", err)
	}

	return exclusion, nil
}

// DeleteExclusion deletes an exclusion
func (uc *MarketingUseCase) DeleteExclusion(ctx context.Context, exclusionID uuid.UUID) error {
	if err := uc.exclusionRepo.Delete(ctx, exclusionID); err != nil {
		return fmt.Errorf("failed to delete exclusion: %w", err)
	}
	return nil
}

// Helper functions

func parseDate(dateStr string) (time.Time, error) {
	layouts := []string{
		"2006-01-02",
		"02/01/2006",
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05.000Z",
	}
	for _, layout := range layouts {
		if t, err := time.Parse(layout, dateStr); err == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("unable to parse date: %s", dateStr)
}
