package usecases

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/google/uuid"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

type OrderUseCase struct {
	orderRepo       repositories.OrderRepository
	warehouseRepo   repositories.WarehouseRepository
	transactionRepo repositories.TransactionRepository
	shiftRepo       repositories.ShiftRepository
	clientRepo      repositories.ClientRepository
	promotionRepo   repositories.PromotionRepository
	exclusionRepo   repositories.ExclusionRepository
	accountUseCase  *AccountUseCase // Добавлен AccountUseCase
}

type OrderPricingRule struct {
	Code    string  `json:"code"`
	Amount  float64 `json:"amount"`
	Message string  `json:"message,omitempty"`
}

type OrderCalculateResult struct {
	BaseAmount            float64            `json:"base_amount"`
	ExcludedAmount        float64            `json:"excluded_amount"`
	DiscountTotal         float64            `json:"discount_total"`
	PromotionDiscount     float64            `json:"promotion_discount"`
	LoyaltyRedeemedPoints int                `json:"loyalty_redeemed_points"`
	LoyaltyRedeemedAmount float64            `json:"loyalty_redeemed_amount"`
	LoyaltyEarnedPoints   int                `json:"loyalty_earned_points"`
	FinalAmount           float64            `json:"final_amount"`
	AppliedRules          []OrderPricingRule `json:"applied_rules"`
	AppliedPromotionIDs   []uuid.UUID        `json:"applied_promotion_ids,omitempty"`
	AppliedPromotionsJSON string             `json:"applied_promotions_json"`
	Items                 []models.OrderItem `json:"items"`
	ItemPricing           []OrderItemPricing `json:"item_pricing,omitempty"`
}

type OrderItemPricing struct {
	Index               int         `json:"index"`
	ProductID           *uuid.UUID  `json:"product_id,omitempty"`
	TechCardID          *uuid.UUID  `json:"tech_card_id,omitempty"`
	CategoryID          *uuid.UUID  `json:"category_id,omitempty"`
	ItemName            string      `json:"item_name,omitempty"`
	Quantity            int         `json:"quantity"`
	UnitPrice           float64     `json:"unit_price"`
	TotalPrice          float64     `json:"total_price"`
	Eligible            bool        `json:"eligible"`
	IneligibilityReason string      `json:"ineligibility_reason,omitempty"`
	PromotionIDs        []uuid.UUID `json:"promotion_ids,omitempty"`
	PromotionNames      []string    `json:"promotion_names,omitempty"`
	PromotionBadge      string      `json:"promotion_badge,omitempty"`
}

type OrderPromotionPreviewResult struct {
	Items            []OrderItemPricing  `json:"items"`
	ActivePromotions []*models.Promotion `json:"active_promotions"`
}

type OrderPricingOptions struct {
	ClientID                 *uuid.UUID
	SelectedPromotionID      *uuid.UUID
	RedeemLoyaltyPoints      int
	ManualDiscountPercentage *float64
}

type itemPricingMeta struct {
	ProductID   *uuid.UUID
	TechCardID  *uuid.UUID
	CategoryID  *uuid.UUID
	Eligible    bool
	TotalAmount float64
	ItemName    string
	Reason      string
}

func NewOrderUseCase(
	orderRepo repositories.OrderRepository,
	warehouseRepo repositories.WarehouseRepository,
	transactionRepo repositories.TransactionRepository,
	shiftRepo repositories.ShiftRepository,
	clientRepo repositories.ClientRepository,
	promotionRepo repositories.PromotionRepository,
	exclusionRepo repositories.ExclusionRepository,
	accountUseCase *AccountUseCase, // Добавлен AccountUseCase
) *OrderUseCase {
	return &OrderUseCase{
		orderRepo:       orderRepo,
		warehouseRepo:   warehouseRepo,
		transactionRepo: transactionRepo,
		shiftRepo:       shiftRepo,
		clientRepo:      clientRepo,
		promotionRepo:   promotionRepo,
		exclusionRepo:   exclusionRepo,
		accountUseCase:  accountUseCase, // Присвоение AccountUseCase
	}
}

func (uc *OrderUseCase) CalculateOrder(ctx context.Context, establishmentID uuid.UUID, items []models.OrderItem, options OrderPricingOptions) (*OrderCalculateResult, error) {
	if len(items) == 0 {
		return nil, errors.New("order must contain at least one item")
	}

	resolvedItems := make([]models.OrderItem, len(items))
	copy(resolvedItems, items)

	var (
		baseAmount     float64
		excludedAmount float64
	)

	itemMetaByIdx := make(map[int]itemPricingMeta, len(resolvedItems))

	exclusions, err := uc.exclusionRepo.GetActive(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get active exclusions: %w", err)
	}

	var client *models.Client
	if options.ClientID != nil {
		client, err = uc.clientRepo.GetByID(ctx, *options.ClientID)
		if err != nil {
			return nil, fmt.Errorf("failed to get client: %w", err)
		}
	}

	for i := range resolvedItems {
		item := &resolvedItems[i]
		meta := itemPricingMeta{Eligible: true}

		if item.ProductID != nil {
			product, getErr := uc.warehouseRepo.GetProductByID(ctx, *item.ProductID)
			if getErr != nil {
				return nil, fmt.Errorf("product not found: %w", getErr)
			}
			item.Price = product.Price
			productCategoryID := product.CategoryID
			meta.CategoryID = &productCategoryID
			meta.ProductID = item.ProductID
			meta.ItemName = product.Name
			if product.ExcludeFromDiscounts {
				meta.Eligible = false
				meta.Reason = "Товар исключен из скидок"
			}
		} else if item.TechCardID != nil {
			techCard, getErr := uc.warehouseRepo.GetTechCardByID(ctx, *item.TechCardID)
			if getErr != nil {
				return nil, fmt.Errorf("tech card not found: %w", getErr)
			}
			item.Price = techCard.Price
			techCardCategoryID := techCard.CategoryID
			meta.CategoryID = &techCardCategoryID
			meta.TechCardID = item.TechCardID
			meta.ItemName = techCard.Name
			if techCard.ExcludeFromDiscounts {
				meta.Eligible = false
				meta.Reason = "Техкарта исключена из скидок"
			}
		} else {
			return nil, errors.New("order item must have a product or tech card")
		}

		item.TotalPrice = models.RoundTo2(item.Price * float64(item.Quantity))
		meta.TotalAmount = item.TotalPrice
		baseAmount += item.TotalPrice

		for _, exclusion := range exclusions {
			if !meta.Eligible {
				break
			}
			if exclusion.EntityID == nil {
				continue
			}

			switch exclusion.Type {
			case "product":
				if meta.ProductID != nil && *meta.ProductID == *exclusion.EntityID {
					meta.Eligible = false
					meta.Reason = "Исключено правилом: товар"
				}
			case "category":
				if meta.CategoryID != nil && *meta.CategoryID == *exclusion.EntityID {
					meta.Eligible = false
					meta.Reason = "Исключено правилом: категория"
				}
			case "tech_card":
				if meta.TechCardID != nil && *meta.TechCardID == *exclusion.EntityID {
					meta.Eligible = false
					meta.Reason = "Исключено правилом: техкарта"
				}
			case "customer":
				if options.ClientID != nil && *options.ClientID == *exclusion.EntityID {
					meta.Eligible = false
					meta.Reason = "Исключено правилом: клиент"
				}
			case "customer_group":
				if client != nil && client.GroupID != nil && *client.GroupID == *exclusion.EntityID {
					meta.Eligible = false
					meta.Reason = "Исключено правилом: группа клиента"
				}
			}
		}

		if !meta.Eligible {
			excludedAmount += item.TotalPrice
		}

		itemMetaByIdx[i] = meta
	}

	eligibleAmount := baseAmount - excludedAmount
	if eligibleAmount < 0 {
		eligibleAmount = 0
	}

	rules := make([]OrderPricingRule, 0, 8)
	appliedPromotionIDs := make([]uuid.UUID, 0, 1)

	promotionDiscount := 0.0
	manualDiscount := 0.0
	clientGroupDiscount := 0.0

	if options.ManualDiscountPercentage != nil && *options.ManualDiscountPercentage > 0 {
		manualDiscount = models.RoundTo2(eligibleAmount * (*options.ManualDiscountPercentage / 100.0))
	}

	if client != nil && client.Group != nil && client.Group.DiscountPercentage > 0 {
		clientGroupDiscount = models.RoundTo2(eligibleAmount * (client.Group.DiscountPercentage / 100.0))
	}

	activePromotions, err := uc.promotionRepo.GetActive(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get active promotions: %w", err)
	}

	var selectedPromotion *models.Promotion
	if options.SelectedPromotionID != nil {
		for _, promotion := range activePromotions {
			if promotion.ID == *options.SelectedPromotionID {
				selectedPromotion = promotion
				break
			}
		}
	}

	if selectedPromotion == nil {
		for _, promotion := range activePromotions {
			discount := calculatePromotionDiscount(*promotion, resolvedItems, itemMetaByIdx)
			if discount > promotionDiscount {
				promotionDiscount = discount
				selectedPromotion = promotion
			}
		}
	} else {
		promotionDiscount = calculatePromotionDiscount(*selectedPromotion, resolvedItems, itemMetaByIdx)
	}

	percentageDiscount := promotionDiscount
	selectedRuleCode := "promotion"
	selectedRuleMessage := "Применена акция"
	if manualDiscount > percentageDiscount {
		percentageDiscount = manualDiscount
		selectedRuleCode = "manual_discount"
		selectedRuleMessage = "Применена ручная скидка"
	}
	if clientGroupDiscount > percentageDiscount {
		percentageDiscount = clientGroupDiscount
		selectedRuleCode = "client_group"
		selectedRuleMessage = "Применена скидка группы клиента"
	}

	if percentageDiscount > 0 {
		rules = append(rules, OrderPricingRule{Code: selectedRuleCode, Amount: models.RoundTo2(percentageDiscount), Message: selectedRuleMessage})
	}

	if selectedPromotion != nil && promotionDiscount > 0 && selectedRuleCode == "promotion" {
		appliedPromotionIDs = append(appliedPromotionIDs, selectedPromotion.ID)
		rules = append(rules, OrderPricingRule{Code: "promotion_id", Amount: models.RoundTo2(promotionDiscount), Message: selectedPromotion.Name})
	}

	itemPricing := buildItemPricing(resolvedItems, itemMetaByIdx, activePromotions)

	amountAfterDiscount := models.RoundTo2(baseAmount - percentageDiscount)
	if amountAfterDiscount < 0 {
		amountAfterDiscount = 0
	}

	loyaltyRedeemedPoints := 0
	loyaltyRedeemedAmount := 0.0
	loyaltyEarnedPoints := 0

	if client != nil {
		if options.RedeemLoyaltyPoints > 0 {
			requested := options.RedeemLoyaltyPoints
			if requested > client.LoyaltyPoints {
				requested = client.LoyaltyPoints
			}
			maxRedeemByAmount := int(math.Floor(amountAfterDiscount))
			if requested > maxRedeemByAmount {
				requested = maxRedeemByAmount
			}
			if requested > 0 {
				loyaltyRedeemedPoints = requested
				loyaltyRedeemedAmount = models.RoundTo2(float64(requested))
				rules = append(rules, OrderPricingRule{Code: "loyalty_redeem", Amount: loyaltyRedeemedAmount, Message: "Списаны бонусные баллы"})
			}
		}

		if client.LoyaltyProgram != nil && client.LoyaltyProgram.Active {
			amountForAccrual := amountAfterDiscount - loyaltyRedeemedAmount
			if amountForAccrual < 0 {
				amountForAccrual = 0
			}

			switch client.LoyaltyProgram.Type {
			case "points":
				if client.LoyaltyProgram.PointsPerCurrency != nil {
					loyaltyEarnedPoints = int(math.Floor(amountForAccrual * float64(*client.LoyaltyProgram.PointsPerCurrency) * client.LoyaltyProgram.PointMultiplier))
				}
			case "cashback":
				if client.LoyaltyProgram.CashbackPercentage != nil {
					cashback := amountForAccrual * (*client.LoyaltyProgram.CashbackPercentage / 100.0)
					if client.LoyaltyProgram.MaxCashbackAmount != nil && cashback > *client.LoyaltyProgram.MaxCashbackAmount {
						cashback = *client.LoyaltyProgram.MaxCashbackAmount
					}
					loyaltyEarnedPoints = int(math.Floor(cashback * client.LoyaltyProgram.PointMultiplier))
				}
			case "tier":
				loyaltyEarnedPoints = int(math.Floor(amountForAccrual * client.LoyaltyProgram.PointMultiplier))
			}

			if loyaltyEarnedPoints > 0 {
				rules = append(rules, OrderPricingRule{Code: "loyalty_earn", Amount: float64(loyaltyEarnedPoints), Message: "Начислены бонусные баллы"})
			}
		}
	}

	finalAmount := models.RoundTo2(amountAfterDiscount - loyaltyRedeemedAmount)
	if finalAmount < 0 {
		finalAmount = 0
	}

	appliedPayload, _ := json.Marshal(map[string]interface{}{
		"rules":                      rules,
		"selected_promotion_id":      options.SelectedPromotionID,
		"manual_discount_percentage": options.ManualDiscountPercentage,
		"requested_redeem_points":    options.RedeemLoyaltyPoints,
		"applied_promotion_ids":      appliedPromotionIDs,
	})

	return &OrderCalculateResult{
		BaseAmount:            models.RoundTo2(baseAmount),
		ExcludedAmount:        models.RoundTo2(excludedAmount),
		DiscountTotal:         models.RoundTo2(percentageDiscount + loyaltyRedeemedAmount),
		PromotionDiscount:     models.RoundTo2(promotionDiscount),
		LoyaltyRedeemedPoints: loyaltyRedeemedPoints,
		LoyaltyRedeemedAmount: loyaltyRedeemedAmount,
		LoyaltyEarnedPoints:   loyaltyEarnedPoints,
		FinalAmount:           finalAmount,
		AppliedRules:          rules,
		AppliedPromotionIDs:   appliedPromotionIDs,
		AppliedPromotionsJSON: string(appliedPayload),
		Items:                 resolvedItems,
		ItemPricing:           itemPricing,
	}, nil
}

func calculatePromotionDiscount(promotion models.Promotion, items []models.OrderItem, itemMetaByIdx map[int]itemPricingMeta) float64 {
	if len(items) == 0 {
		return 0
	}

	switch promotion.Type {
	case "discount", "happy_hour":
		if promotion.DiscountPercentage == nil || *promotion.DiscountPercentage <= 0 {
			return 0
		}
		eligibleAmount := 0.0
		for idx := range items {
			if itemMetaByIdx[idx].Eligible && promotionTargetsItem(promotion, itemMetaByIdx[idx]) {
				eligibleAmount += items[idx].TotalPrice
			}
		}
		return models.RoundTo2(eligibleAmount * (*promotion.DiscountPercentage / 100.0))
	case "buy_x_get_y":
		if promotion.BuyQuantity == nil || promotion.GetQuantity == nil || *promotion.BuyQuantity <= 0 || *promotion.GetQuantity <= 0 {
			return 0
		}
		discount := 0.0
		for idx, item := range items {
			if !itemMetaByIdx[idx].Eligible || !promotionTargetsItem(promotion, itemMetaByIdx[idx]) {
				continue
			}
			groupSize := *promotion.BuyQuantity + *promotion.GetQuantity
			if groupSize <= 0 {
				continue
			}
			freeSets := item.Quantity / groupSize
			freeQty := freeSets * *promotion.GetQuantity
			discount += float64(freeQty) * item.Price
		}
		return models.RoundTo2(discount)
	default:
		return 0
	}
}

func promotionTargetsItem(promotion models.Promotion, meta itemPricingMeta) bool {
	switch promotion.TargetType {
	case "", "all":
		return true
	case "product":
		return meta.ProductID != nil && containsUUID(promotion.TargetIDs, *meta.ProductID)
	case "tech_card":
		return meta.TechCardID != nil && containsUUID(promotion.TargetIDs, *meta.TechCardID)
	case "category":
		return meta.CategoryID != nil && containsUUID(promotion.TargetIDs, *meta.CategoryID)
	default:
		return false
	}
}

func containsUUID(ids []uuid.UUID, target uuid.UUID) bool {
	for _, id := range ids {
		if id == target {
			return true
		}
	}
	return false
}

func buildItemPricing(items []models.OrderItem, itemMetaByIdx map[int]itemPricingMeta, promotions []*models.Promotion) []OrderItemPricing {
	result := make([]OrderItemPricing, 0, len(items))

	for idx, item := range items {
		meta := itemMetaByIdx[idx]
		promotionIDs := make([]uuid.UUID, 0)
		promotionNames := make([]string, 0)

		if meta.Eligible {
			for _, promotion := range promotions {
				if calculatePromotionDiscount(*promotion, []models.OrderItem{item}, map[int]itemPricingMeta{0: meta}) <= 0 {
					continue
				}
				promotionIDs = append(promotionIDs, promotion.ID)
				promotionNames = append(promotionNames, promotion.Name)
			}
		}

		badge := ""
		if len(promotionNames) > 0 {
			badge = "Акция"
		}

		result = append(result, OrderItemPricing{
			Index:               idx,
			ProductID:           meta.ProductID,
			TechCardID:          meta.TechCardID,
			CategoryID:          meta.CategoryID,
			ItemName:            meta.ItemName,
			Quantity:            item.Quantity,
			UnitPrice:           models.RoundTo2(item.Price),
			TotalPrice:          models.RoundTo2(item.TotalPrice),
			Eligible:            meta.Eligible,
			IneligibilityReason: meta.Reason,
			PromotionIDs:        promotionIDs,
			PromotionNames:      promotionNames,
			PromotionBadge:      badge,
		})
	}

	return result
}

func (uc *OrderUseCase) PreviewPromotionsByItems(ctx context.Context, establishmentID uuid.UUID, items []models.OrderItem, options OrderPricingOptions) (*OrderPromotionPreviewResult, error) {
	calculation, err := uc.CalculateOrder(ctx, establishmentID, items, options)
	if err != nil {
		return nil, err
	}

	activePromotions, err := uc.promotionRepo.GetActive(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get active promotions: %w", err)
	}

	return &OrderPromotionPreviewResult{
		Items:            calculation.ItemPricing,
		ActivePromotions: activePromotions,
	}, nil
}

func parsePricingOptionsFromOrder(order *models.Order) OrderPricingOptions {
	if order == nil {
		return OrderPricingOptions{}
	}

	options := OrderPricingOptions{ClientID: order.ClientID}
	if order.AppliedPromotionsJSON == "" {
		return options
	}

	var payload struct {
		SelectedPromotionID      *uuid.UUID `json:"selected_promotion_id"`
		ManualDiscountPercentage *float64   `json:"manual_discount_percentage"`
		RequestedRedeemPoints    int        `json:"requested_redeem_points"`
	}

	if err := json.Unmarshal([]byte(order.AppliedPromotionsJSON), &payload); err != nil {
		return options
	}

	options.SelectedPromotionID = payload.SelectedPromotionID
	options.ManualDiscountPercentage = payload.ManualDiscountPercentage
	options.RedeemLoyaltyPoints = payload.RequestedRedeemPoints
	return options
}

func applyCalculationToOrder(order *models.Order, calculation *OrderCalculateResult) {
	order.Items = calculation.Items
	order.TotalAmount = calculation.BaseAmount
	order.DiscountTotal = calculation.DiscountTotal
	order.PromotionDiscountTotal = calculation.PromotionDiscount
	order.LoyaltyRedeemedPoints = calculation.LoyaltyRedeemedPoints
	order.LoyaltyRedeemedAmount = calculation.LoyaltyRedeemedAmount
	order.LoyaltyEarnedPoints = calculation.LoyaltyEarnedPoints
	order.FinalAmount = calculation.FinalAmount
	order.AppliedPromotionsJSON = calculation.AppliedPromotionsJSON
}

func (uc *OrderUseCase) CreateOrder(
	ctx context.Context,
	establishmentID uuid.UUID,
	tableID *uuid.UUID,
	clientID *uuid.UUID,
	items []models.OrderItem,
	selectedPromotionID *uuid.UUID,
	redeemLoyaltyPoints int,
	manualDiscountPercentage *float64,
	totalAmountOverride ...float64,
) (*models.Order, error) {
	order := &models.Order{
		EstablishmentID: establishmentID,
		TableID:         tableID,
		ClientID:        clientID,
		Status:          "draft",
		Items:           items,
	}

	// Try to set ShiftID and WaiterID from context (userID should be in context from auth middleware)
	if userID := ctx.Value("userID"); userID != nil {
		if userIDStr, ok := userID.(uuid.UUID); ok {
			// Set WaiterID (the user who created the order)
			order.WaiterID = &userIDStr
			fmt.Printf("DEBUG CreateOrder: Set waiter_id=%s\n", userIDStr)

			// Get current active shift for this user
			activeShift, err := uc.shiftRepo.GetActiveShiftByUserID(ctx, userIDStr)
			if err == nil && activeShift != nil {
				order.ShiftID = &activeShift.ID
				fmt.Printf("DEBUG CreateOrder: Set shift_id=%s for user %s\n", activeShift.ID, userIDStr)
			}
		}
	}

	calculation, err := uc.CalculateOrder(ctx, establishmentID, items, OrderPricingOptions{
		ClientID:                 clientID,
		SelectedPromotionID:      selectedPromotionID,
		RedeemLoyaltyPoints:      redeemLoyaltyPoints,
		ManualDiscountPercentage: manualDiscountPercentage,
	})
	if err != nil {
		return nil, err
	}

	order.Items = calculation.Items
	order.TotalAmount = calculation.BaseAmount
	order.DiscountTotal = calculation.DiscountTotal
	order.PromotionDiscountTotal = calculation.PromotionDiscount
	order.LoyaltyRedeemedPoints = calculation.LoyaltyRedeemedPoints
	order.LoyaltyRedeemedAmount = calculation.LoyaltyRedeemedAmount
	order.LoyaltyEarnedPoints = calculation.LoyaltyEarnedPoints
	order.FinalAmount = calculation.FinalAmount
	order.AppliedPromotionsJSON = calculation.AppliedPromotionsJSON

	if len(totalAmountOverride) > 0 {
		overrideAmount := totalAmountOverride[0]
		if overrideAmount < 0 {
			return nil, errors.New("total amount override cannot be negative")
		}

		// Контроль контракта: фронт не может произвольно менять итог.
		const epsilon = 0.01
		if math.Abs(overrideAmount-calculation.FinalAmount) > epsilon {
			return nil, fmt.Errorf("total amount override (%.2f) must match server-calculated final amount (%.2f)", overrideAmount, calculation.FinalAmount)
		}
	}

	if err := uc.orderRepo.Create(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to create order: %w", err)
	}

	return order, nil
}

func (uc *OrderUseCase) GetActiveOrdersByEstablishment(ctx context.Context, establishmentID uuid.UUID) ([]*models.Order, error) {
	orders, err := uc.orderRepo.ListActiveByEstablishmentID(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get active orders: %w", err)
	}
	return orders, nil
}

func (uc *OrderUseCase) AddOrderItem(ctx context.Context, orderID uuid.UUID, item models.OrderItem) (*models.Order, error) {
	order, err := uc.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, fmt.Errorf("order not found: %w", err)
	}

	// Ensure item price is set
	if item.ProductID != nil {
		product, err := uc.warehouseRepo.GetProductByID(ctx, *item.ProductID)
		if err != nil {
			return nil, fmt.Errorf("product not found: %w", err)
		}
		item.Price = product.Price
	} else if item.TechCardID != nil {
		techCard, err := uc.warehouseRepo.GetTechCardByID(ctx, *item.TechCardID)
		if err != nil {
			return nil, fmt.Errorf("tech card not found: %w", err)
		}
		item.Price = techCard.Price
	} else {
		return nil, errors.New("order item must have a product or tech card")
	}
	item.TotalPrice = item.Price * float64(item.Quantity)

	// Add item to order
	order.Items = append(order.Items, item)

	pricingOptions := parsePricingOptionsFromOrder(order)
	calculation, err := uc.CalculateOrder(ctx, order.EstablishmentID, order.Items, pricingOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to recalculate order after adding item: %w", err)
	}
	applyCalculationToOrder(order, calculation)

	if err := uc.orderRepo.Update(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to add order item: %w", err)
	}

	return order, nil
}

func (uc *OrderUseCase) UpdateOrderItemQuantity(ctx context.Context, orderID uuid.UUID, itemID uuid.UUID, quantity int) (*models.Order, error) {
	order, err := uc.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, fmt.Errorf("order not found: %w", err)
	}

	found := false
	for i := range order.Items {
		item := &order.Items[i]
		if item.ID == itemID {
			// Update total amount
			order.TotalAmount -= item.TotalPrice
			item.Quantity = quantity
			item.TotalPrice = item.Price * float64(item.Quantity)
			order.TotalAmount += item.TotalPrice
			found = true
			break
		}
	}

	if !found {
		return nil, errors.New("order item not found")
	}

	pricingOptions := parsePricingOptionsFromOrder(order)
	calculation, err := uc.CalculateOrder(ctx, order.EstablishmentID, order.Items, pricingOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to recalculate order after quantity update: %w", err)
	}
	applyCalculationToOrder(order, calculation)

	if err := uc.orderRepo.Update(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to update order item quantity: %w", err)
	}

	return order, nil
}

func (uc *OrderUseCase) ProcessOrderPayment(ctx context.Context, orderID uuid.UUID, cashAmount, cardAmount, clientCash float64) (*models.Order, error) {
	order, err := uc.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, fmt.Errorf("order not found: %w", err)
	}

	if order.Status == "paid" || order.Status == "cancelled" {
		return nil, errors.New("order is already paid or cancelled")
	}

	pricingOptions := parsePricingOptionsFromOrder(order)
	calculation, err := uc.CalculateOrder(ctx, order.EstablishmentID, order.Items, pricingOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to recalculate order before payment: %w", err)
	}
	applyCalculationToOrder(order, calculation)

	// Calculate total payment received
	totalPaid := cashAmount + cardAmount

	// Логирование для отладки
	fmt.Printf("DEBUG Payment: orderID=%s, order.FinalAmount=%.2f, cashAmount=%.2f, cardAmount=%.2f, totalPaid=%.2f\n",
		orderID, order.FinalAmount, cashAmount, cardAmount, totalPaid)

	// Сравнение с допуском для float (epsilon = 0.01 - одна копейка)
	const epsilon = 0.01
	if totalPaid < order.FinalAmount-epsilon {
		return nil, fmt.Errorf("total payment (%.2f) is less than total order amount (%.2f)", totalPaid, order.FinalAmount)
	}

	// Ограничиваем суммы транзакций суммой заказа
	// Транзакция должна быть на сумму заказа, а не на введенную клиентом сумму
	actualCardAmount := math.Min(cardAmount, order.FinalAmount)
	remainingAfterCard := math.Max(0, order.FinalAmount-actualCardAmount)
	actualCashAmount := math.Min(cashAmount, remainingAfterCard)

	order.CashAmount = actualCashAmount
	order.CardAmount = actualCardAmount
	order.PaymentStatus = "paid"
	order.Status = "paid"

	// Calculate change if cash payment exceeds remaining amount
	if actualCashAmount > 0 && clientCash > 0 {
		order.ChangeAmount = clientCash - actualCashAmount
		if order.ChangeAmount < 0 {
			return nil, errors.New("client cash is less than cash payment amount")
		}
	}

	if err := uc.orderRepo.Update(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to process order payment: %w", err)
	}

	// Обновляем статистику всех клиентов из order_items (несколько гостей могут быть разными клиентами)
	clientTotals := make(map[uuid.UUID]float64) // clientID -> сумма его позиций
	for _, item := range order.Items {
		if item.ClientID != nil {
			clientTotals[*item.ClientID] += item.TotalPrice
		}
	}

	// Если есть общий client_id на заказе (обратная совместимость), тоже обрабатываем
	if order.ClientID != nil {
		if _, exists := clientTotals[*order.ClientID]; !exists {
			clientTotals[*order.ClientID] = order.FinalAmount
		}
	}

	// Обрабатываем каждого клиента
	for clientID, clientTotal := range clientTotals {
		client, getErr := uc.clientRepo.GetByID(ctx, clientID)
		if getErr != nil {
			// Пропускаем если клиент не найден
			continue
		}

		// Лояльность обрабатывается только для основного клиента заказа
		if order.ClientID != nil && clientID == *order.ClientID {
			if calculation.LoyaltyRedeemedPoints > 0 {
				if err := uc.clientRepo.RedeemLoyaltyPoints(ctx, client.ID, calculation.LoyaltyRedeemedPoints); err != nil {
					return nil, fmt.Errorf("failed to redeem loyalty points: %w", err)
				}
			}
			if calculation.LoyaltyEarnedPoints > 0 {
				if err := uc.clientRepo.AddLoyaltyPoints(ctx, client.ID, calculation.LoyaltyEarnedPoints); err != nil {
					return nil, fmt.Errorf("failed to add loyalty points: %w", err)
				}
			}
		}

		// Обновляем статистику клиента
		client.TotalOrders += 1
		client.TotalSpent = models.RoundTo2(client.TotalSpent + clientTotal)
		if err := uc.clientRepo.Update(ctx, client); err != nil {
			return nil, fmt.Errorf("failed to update client totals for %s: %w", clientID, err)
		}
	}

	for _, promotionID := range calculation.AppliedPromotionIDs {
		if err := uc.promotionRepo.IncrementUsageCount(ctx, promotionID); err != nil {
			return nil, fmt.Errorf("failed to increment promotion usage_count: %w", err)
		}
	}

	// Create transaction for cash/card payment
	if order.CashAmount > 0 {
		// Пробуем создать транзакцию для наличных, автоматически создаем счет если его нет
		if uc.accountUseCase != nil {
			cashAccountType, err := uc.accountUseCase.accountTypeRepo.GetByName(ctx, "наличные")
			if err == nil && cashAccountType != nil {
				// Ищем конкретно "Денежный ящик"
				cashAccounts, err := uc.accountUseCase.repo.List(ctx, &repositories.AccountFilter{
					EstablishmentID: &order.EstablishmentID,
					TypeID:          &cashAccountType.ID,
					Active:          repositories.BoolPtr(true),
				})
				if err != nil {
					return nil, fmt.Errorf("failed to get cash accounts: %w", err)
				}

				// Ищем счет с названием "Денежный ящик"
				var cashDrawerAccount *models.Account
				for _, acc := range cashAccounts {
					if acc.Name == "Денежный ящик" {
						cashDrawerAccount = acc
						break
					}
				}

				var cashAccountID uuid.UUID
				if cashDrawerAccount == nil {
					// Если "Денежный ящик" не найден, создаем его
					newAccount := &models.Account{
						Name:            "Денежный ящик",
						EstablishmentID: order.EstablishmentID,
						TypeID:          cashAccountType.ID,
						Active:          true,
						Balance:         0,
					}
					if err := uc.accountUseCase.repo.Create(ctx, newAccount); err != nil {
						return nil, fmt.Errorf("failed to create cash drawer account: %w", err)
					}
					cashAccountID = newAccount.ID
				} else {
					cashAccountID = cashDrawerAccount.ID
				}

				transaction := &models.Transaction{
					TransactionDate: time.Now(),
					Type:            "income",
					Category:        "Оплата заказа",
					Description:     fmt.Sprintf("Оплата наличными, заказ №%s", order.ID.String()[:8]),
					Amount:          order.CashAmount,
					AccountID:       cashAccountID,
					EstablishmentID: order.EstablishmentID,
					OrderID:         &order.ID,
				}
				if err := uc.transactionRepo.Create(ctx, transaction); err != nil {
					return nil, fmt.Errorf("failed to create cash transaction: %w", err)
				}
			}
		}
	}
	if order.CardAmount > 0 {
		// Пробуем создать транзакцию для карты, автоматически создаем счет если его нет
		if uc.accountUseCase != nil {
			cardAccountType, err := uc.accountUseCase.accountTypeRepo.GetByName(ctx, "банковские карточки")
			if err == nil && cardAccountType != nil {
				cardAccounts, err := uc.accountUseCase.repo.List(ctx, &repositories.AccountFilter{
					EstablishmentID: &order.EstablishmentID,
					TypeID:          &cardAccountType.ID,
					Active:          repositories.BoolPtr(true),
				})
				if err != nil {
					return nil, fmt.Errorf("failed to get card account: %w", err)
				}

				var cardAccountID uuid.UUID
				if len(cardAccounts) == 0 {
					// Автоматически создаем счет для карт
					newAccount := &models.Account{
						Name:            "Банковские карточки",
						EstablishmentID: order.EstablishmentID,
						TypeID:          cardAccountType.ID,
						Active:          true,
						Balance:         0,
					}
					if err := uc.accountUseCase.repo.Create(ctx, newAccount); err != nil {
						return nil, fmt.Errorf("failed to create card account: %w", err)
					}
					cardAccountID = newAccount.ID
				} else {
					cardAccountID = cardAccounts[0].ID
				}

				transaction := &models.Transaction{
					TransactionDate: time.Now(),
					Type:            "income",
					Category:        "Оплата заказа",
					Description:     fmt.Sprintf("Оплата картой, заказ №%s", order.ID.String()[:8]),
					Amount:          order.CardAmount,
					AccountID:       cardAccountID,
					EstablishmentID: order.EstablishmentID,
					OrderID:         &order.ID,
				}
				if err := uc.transactionRepo.Create(ctx, transaction); err != nil {
					return nil, fmt.Errorf("failed to create card transaction: %w", err)
				}
			}
		}
	}

	if err := uc.deductTechCardIngredientsFromStock(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to deduct stock for order: %w", err)
	}

	return order, nil
}

func (uc *OrderUseCase) CloseOrderWithoutPayment(ctx context.Context, orderID uuid.UUID, reason string) (*models.Order, error) {
	order, err := uc.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, fmt.Errorf("order not found: %w", err)
	}

	if order.Status == "paid" || order.Status == "cancelled" {
		return nil, errors.New("order is already paid or cancelled")
	}

	order.Status = "cancelled"
	order.PaymentStatus = "cancelled"
	order.ReasonForNoPayment = &reason

	if err := uc.orderRepo.Update(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to close order without payment: %w", err)
	}

	// Create a transaction to record the loss/discount
	transaction := &models.Transaction{
		TransactionDate: time.Now(),
		Category:        "Order Cancellation",
		Description:     fmt.Sprintf("Order %s closed without payment: %s", order.ID.String(), reason),
		Amount:          -order.TotalAmount,    // Negative amount for loss
		AccountID:       order.EstablishmentID, // Assuming loss affects establishment's main account for now
		EstablishmentID: order.EstablishmentID,
	}
	if err := uc.transactionRepo.Create(ctx, transaction); err != nil {
		return nil, fmt.Errorf("failed to create transaction for non-payment closure: %w", err)
	}

	return order, nil
}

func (uc *OrderUseCase) ListOrders(ctx context.Context, establishmentID uuid.UUID, startDateStr, endDateStr, status string) ([]*models.Order, error) {
	var startDate, endDate time.Time
	var err error

	if startDateStr != "" {
		startDate, err = time.Parse("2006-01-02", startDateStr)
		if err != nil {
			return nil, fmt.Errorf("invalid start date format: %w", err)
		}
	}

	if endDateStr != "" {
		endDate, err = time.Parse("2006-01-02", endDateStr)
		if err != nil {
			return nil, fmt.Errorf("invalid end date format: %w", err)
		}
	}

	orders, err := uc.orderRepo.List(ctx, establishmentID, startDate, endDate, status)
	if err != nil {
		return nil, fmt.Errorf("failed to list orders: %w", err)
	}
	return orders, nil
}

func (uc *OrderUseCase) GetOrder(ctx context.Context, orderID uuid.UUID, establishmentID uuid.UUID) (*models.Order, error) {
	order, err := uc.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, fmt.Errorf("order not found: %w", err)
	}
	// Проверяем, что заказ принадлежит указанному заведению
	if order.EstablishmentID != establishmentID {
		return nil, fmt.Errorf("order not found in establishment: order belongs to %s, requested %s",
			order.EstablishmentID.String(), establishmentID.String())
	}
	return order, nil
}

func (uc *OrderUseCase) deductTechCardIngredientsFromStock(ctx context.Context, order *models.Order) error {
	type itemUsage struct {
		quantity float64
		unit     string
	}

	// Для ингредиентов из тех-карт
	usageByIngredient := make(map[uuid.UUID]itemUsage)
	// Для товаров (Products)
	usageByProduct := make(map[uuid.UUID]itemUsage)

	// Собираем данные для списания
	for _, item := range order.Items {
		// Обработка тех-карт - списываем ингредиенты
		if item.TechCardID != nil {
			techCard, err := uc.warehouseRepo.GetTechCardByID(ctx, *item.TechCardID)
			if err != nil {
				return fmt.Errorf("tech card not found: %w", err)
			}
			if techCard == nil {
				return errors.New("tech card not found")
			}

			for _, ing := range techCard.Ingredients {
				qty := ing.Quantity * float64(item.Quantity)
				if qty == 0 {
					continue
				}
				current := usageByIngredient[ing.IngredientID]
				unit := current.unit
				if unit == "" {
					unit = ing.Unit
				}
				usageByIngredient[ing.IngredientID] = itemUsage{
					quantity: current.quantity + qty,
					unit:     unit,
				}
			}
		}

		// Обработка товаров - списываем сами товары
		if item.ProductID != nil {
			qty := float64(item.Quantity)
			if qty == 0 {
				continue
			}
			current := usageByProduct[*item.ProductID]
			unit := current.unit
			if unit == "" {
				unit = "шт" // По умолчанию для товаров
			}
			usageByProduct[*item.ProductID] = itemUsage{
				quantity: current.quantity + qty,
				unit:     unit,
			}
		}
	}

	// Если нечего списывать - выходим
	if len(usageByIngredient) == 0 && len(usageByProduct) == 0 {
		return nil
	}

	// Списываем ингредиенты из тех-карт
	for ingredientID, usage := range usageByIngredient {
		if err := uc.deductItemFromStock(ctx, order, ingredientID, "ingredient", usage.quantity, usage.unit); err != nil {
			return err
		}
	}

	// Списываем товары
	for productID, usage := range usageByProduct {
		if err := uc.deductItemFromStock(ctx, order, productID, "product", usage.quantity, usage.unit); err != nil {
			return err
		}
	}

	return nil
}

// deductItemFromStock списывает ингредиент или товар со складов
func (uc *OrderUseCase) deductItemFromStock(ctx context.Context, order *models.Order, itemID uuid.UUID, itemType string, quantity float64, unit string) error {
	remainingQty := quantity

	var stocks []*models.Stock
	var err error

	// Получаем остатки по типу элемента
	if itemType == "ingredient" {
		stocks, err = uc.warehouseRepo.GetStockByIngredientID(ctx, itemID)
	} else if itemType == "product" {
		stocks, err = uc.warehouseRepo.GetStockByProductID(ctx, itemID)
	} else {
		return fmt.Errorf("unsupported item type: %s", itemType)
	}

	if err != nil {
		return fmt.Errorf("failed to get stocks for %s %s: %w", itemType, itemID, err)
	}

	// Фильтруем только склады этого заведения и сортируем по количеству
	var establishmentStocks []*models.Stock
	for _, stock := range stocks {
		// Проверяем, что склад принадлежит заведению
		warehouse, err := uc.warehouseRepo.GetWarehouseByID(ctx, stock.WarehouseID, &order.EstablishmentID)
		if err == nil && warehouse != nil && stock.Quantity > 0 {
			establishmentStocks = append(establishmentStocks, stock)
		}
	}

	// Сортируем по количеству по убыванию (сначала списываем с того, где больше)
	sortStocksByQuantityDesc(establishmentStocks)

	// Списываем с нескольких складов если нужно
	for _, stock := range establishmentStocks {
		if remainingQty <= 0 {
			break
		}

		// Определяем сколько списать с этого склада
		toDeduct := stock.Quantity
		if toDeduct > remainingQty {
			toDeduct = remainingQty
		}

		stock.Quantity -= toDeduct
		remainingQty -= toDeduct

		if err := uc.warehouseRepo.UpdateStock(ctx, stock); err != nil {
			return fmt.Errorf("failed to update stock for %s %s: %w", itemType, itemID, err)
		}
	}

	// Если не хватило на всех складах - создаем запись на складе по умолчанию с отрицательным остатком
	if remainingQty > 0.01 {
		warehouseID, err := uc.getDefaultWarehouseID(ctx, order.EstablishmentID)
		if err != nil {
			return fmt.Errorf("failed to get default warehouse: %w", err)
		}

		var stock *models.Stock
		if itemType == "ingredient" {
			stock, err = uc.warehouseRepo.GetStockByIngredientAndWarehouse(ctx, itemID, warehouseID)
		} else if itemType == "product" {
			stock, err = uc.warehouseRepo.GetStockByProductAndWarehouse(ctx, itemID, warehouseID)
		}

		if err != nil {
			return fmt.Errorf("failed to get stock for %s %s: %w", itemType, itemID, err)
		}

		if stock == nil {
			// Создаем новую запись с отрицательным остатком
			stock = &models.Stock{
				WarehouseID: warehouseID,
				Quantity:    -remainingQty,
				Unit:        unit,
			}
			if itemType == "ingredient" {
				stock.IngredientID = &itemID
			} else if itemType == "product" {
				stock.ProductID = &itemID
			}
			if err := uc.warehouseRepo.CreateStock(ctx, stock); err != nil {
				return fmt.Errorf("failed to create stock for %s %s: %w", itemType, itemID, err)
			}
		} else {
			// Обновляем существующую запись
			stock.Quantity -= remainingQty
			if err := uc.warehouseRepo.UpdateStock(ctx, stock); err != nil {
				return fmt.Errorf("failed to update stock for %s %s: %w", itemType, itemID, err)
			}
		}
	}

	return nil
}

// sortStocksByQuantityDesc сортирует стоки по количеству по убыванию
func sortStocksByQuantityDesc(stocks []*models.Stock) {
	for i := 0; i < len(stocks)-1; i++ {
		for j := i + 1; j < len(stocks); j++ {
			if stocks[i].Quantity < stocks[j].Quantity {
				stocks[i], stocks[j] = stocks[j], stocks[i]
			}
		}
	}
}

func (uc *OrderUseCase) getDefaultWarehouseID(ctx context.Context, establishmentID uuid.UUID) (uuid.UUID, error) {
	warehouses, err := uc.warehouseRepo.ListWarehouses(ctx, establishmentID)
	if err != nil {
		return uuid.Nil, err
	}
	if len(warehouses) == 0 {
		return uuid.Nil, errors.New("no warehouses available for establishment")
	}

	for _, w := range warehouses {
		if w.Active {
			return w.ID, nil
		}
	}

	return warehouses[0].ID, nil
}

func (uc *OrderUseCase) UpdateOrder(ctx context.Context, orderID uuid.UUID, updatedOrder models.Order) (*models.Order, error) {
	order, err := uc.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, fmt.Errorf("order not found: %w", err)
	}

	// Update fields as necessary
	order.TableID = updatedOrder.TableID
	order.Status = updatedOrder.Status
	order.PaymentStatus = updatedOrder.PaymentStatus
	order.TotalAmount = updatedOrder.TotalAmount
	order.CashAmount = updatedOrder.CashAmount
	order.CardAmount = updatedOrder.CardAmount
	order.ChangeAmount = updatedOrder.ChangeAmount
	order.ReasonForNoPayment = updatedOrder.ReasonForNoPayment
	order.Items = updatedOrder.Items // This might need more sophisticated merging logic

	if err := uc.orderRepo.Update(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to update order: %w", err)
	}

	return order, nil
}
