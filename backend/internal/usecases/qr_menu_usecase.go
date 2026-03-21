package usecases

import (
	"context"
	crand "crypto/rand"
	"errors"
	"math/big"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/config"
	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
	"github.com/yourusername/arc/backend/pkg/auth"
)

var (
	ErrQRTokenNotFound      = errors.New("QR code not found or expired")
	ErrGuestPhoneRegistered = errors.New("phone number already registered")
	ErrGuestInvalidPassword = errors.New("invalid phone or password")
	ErrGuestNameRequired    = errors.New("guest name is required")
	ErrQROrderItemsRequired = errors.New("items are required")
	ErrQROrderInvalidItem   = errors.New("each item must have exactly one of product_id or tech_card_id")
	ErrQROrderNoValidItems  = errors.New("no valid items to create order")
)

// QRMenuInfo — данные, возвращаемые при сканировании QR-кода
type QRMenuInfo struct {
	Establishment *models.Establishment `json:"establishment"`
	Table         *models.Table         `json:"table"`
}

// QRMenuCategory — категория с товарами для публичного меню
type QRMenuCategory struct {
	ID       uuid.UUID         `json:"id"`
	Name     string            `json:"name"`
	Products []*models.Product `json:"products"`
}

// GuestCreateRequest — запрос на создание гостевой сессии
type GuestCreateRequest struct {
	GuestName   string `json:"guest_name"`   // Никнейм или эмодзи для анонима
	Phone       string `json:"phone"`        // Телефон (для регистрации)
	Password    string `json:"password"`     // Пароль (для регистрации)
	IsAnonymous bool   `json:"is_anonymous"` // true = анонимный
}

// GuestSessionResponse — ответ при создании/входе гостя
type GuestSessionResponse struct {
	Token       string               `json:"token"`
	GuestName   string               `json:"guest_name"`
	IsAnonymous bool                 `json:"is_anonymous"`
	Session     *models.GuestSession `json:"session"`
}

// QRMenuUseCase — логика QR-меню
type QRMenuUseCase struct {
	tableRepo         repositories.TableRepository
	guestSessionRepo  repositories.GuestSessionRepository
	productRepo       repositories.ProductRepository
	categoryRepo      repositories.CategoryRepository
	orderRepo         repositories.OrderRepository
	establishmentRepo repositories.EstablishmentRepository
	techCardRepo      repositories.TechCardRepository
	cfg               *config.Config
	logger            *zap.Logger
}

func NewQRMenuUseCase(
	tableRepo repositories.TableRepository,
	guestSessionRepo repositories.GuestSessionRepository,
	productRepo repositories.ProductRepository,
	categoryRepo repositories.CategoryRepository,
	orderRepo repositories.OrderRepository,
	establishmentRepo repositories.EstablishmentRepository,
	techCardRepo repositories.TechCardRepository,
	cfg *config.Config,
	logger *zap.Logger,
) *QRMenuUseCase {
	return &QRMenuUseCase{
		tableRepo:         tableRepo,
		guestSessionRepo:  guestSessionRepo,
		productRepo:       productRepo,
		categoryRepo:      categoryRepo,
		orderRepo:         orderRepo,
		establishmentRepo: establishmentRepo,
		techCardRepo:      techCardRepo,
		cfg:               cfg,
		logger:            logger,
	}
}

// GetTableByQRToken возвращает информацию о столике и заведении по QR-токену
func (uc *QRMenuUseCase) GetTableByQRToken(ctx context.Context, qrToken uuid.UUID) (*QRMenuInfo, error) {
	table, err := uc.tableRepo.GetByQRToken(ctx, qrToken)
	if err != nil {
		if errors.Is(err, repositories.ErrTableNotFound) {
			return nil, ErrQRTokenNotFound
		}
		return nil, err
	}

	if table.Room == nil {
		return nil, ErrQRTokenNotFound
	}

	establishment, err := uc.establishmentRepo.GetByID(ctx, table.Room.EstablishmentID)
	if err != nil {
		return nil, err
	}

	return &QRMenuInfo{Establishment: establishment, Table: table}, nil
}

// GetPublicMenu возвращает активное меню заведения для публичного просмотра (товары и тех-карты)
func (uc *QRMenuUseCase) GetPublicMenu(ctx context.Context, establishmentID uuid.UUID) ([]*QRMenuCategory, error) {
	active := true

	// Получаем товары
	products, err := uc.productRepo.List(ctx, &repositories.ProductFilter{
		EstablishmentID: &establishmentID,
		Active:          &active,
	})
	if err != nil {
		return nil, err
	}

	// Получаем тех-карты
	techCards, err := uc.techCardRepo.List(ctx, &repositories.TechCardFilter{
		EstablishmentID: &establishmentID,
		Active:          &active,
	})
	if err != nil {
		return nil, err
	}

	// Получаем категории
	categories, err := uc.categoryRepo.List(ctx, &repositories.CategoryFilter{
		EstablishmentID: &establishmentID,
	})
	if err != nil {
		return nil, err
	}

	// Группируем товары и тех-карты по категориям
	catMap := make(map[uuid.UUID]*QRMenuCategory)
	result := make([]*QRMenuCategory, 0, len(categories))

	for _, cat := range categories {
		qmc := &QRMenuCategory{
			ID:       cat.ID,
			Name:     cat.Name,
			Products: []*models.Product{},
		}
		catMap[cat.ID] = qmc
		result = append(result, qmc)
	}

	// Добавляем товары в категории
	var uncategorizedProducts []*models.Product
	for _, p := range products {
		if p.CategoryID == uuid.Nil {
			uncategorizedProducts = append(uncategorizedProducts, p)
			continue
		}
		if cat, ok := catMap[p.CategoryID]; ok {
			cat.Products = append(cat.Products, p)
		}
	}

	// Добавляем тех-карты в категории (конвертируем в Product для унифицированного ответа)
	var uncategorizedTechCards []*models.Product
	for _, tc := range techCards {
		tcAsProduct := &models.Product{
			ID:                   tc.ID,
			EstablishmentID:      tc.EstablishmentID,
			CategoryID:           tc.CategoryID,
			Category:             tc.Category,
			WorkshopID:           tc.WorkshopID,
			Workshop:             tc.Workshop,
			Name:                 tc.Name,
			Description:          tc.Description,
			CoverImage:           tc.CoverImage,
			IsWeighted:           tc.IsWeighted,
			ExcludeFromDiscounts: tc.ExcludeFromDiscounts,
			CostPrice:            tc.CostPrice,
			Markup:               tc.Markup,
			Price:                tc.Price,
			Active:               tc.Active,
			CreatedAt:            tc.CreatedAt,
			UpdatedAt:            tc.UpdatedAt,
		}

		if tc.CategoryID == uuid.Nil {
			uncategorizedTechCards = append(uncategorizedTechCards, tcAsProduct)
			continue
		}
		if cat, ok := catMap[tc.CategoryID]; ok {
			cat.Products = append(cat.Products, tcAsProduct)
		}
	}

	// Товары и тех-карты без категории в "Прочее"
	allUncategorized := append(uncategorizedProducts, uncategorizedTechCards...)
	if len(allUncategorized) > 0 {
		result = append(result, &QRMenuCategory{
			ID:       uuid.Nil,
			Name:     "Прочее",
			Products: allUncategorized,
		})
	}

	// Убираем пустые категории
	filtered := result[:0]
	for _, cat := range result {
		if len(cat.Products) > 0 {
			filtered = append(filtered, cat)
		}
	}

	return filtered, nil
}

// CreateAnonymousSession создаёт анонимную гостевую сессию
func (uc *QRMenuUseCase) CreateAnonymousSession(ctx context.Context, qrToken uuid.UUID, guestName string) (*GuestSessionResponse, error) {
	if guestName == "" {
		guestName = generateAnonymousGuestName()
	}

	table, err := uc.tableRepo.GetByQRToken(ctx, qrToken)
	if err != nil {
		return nil, ErrQRTokenNotFound
	}

	if table.Room == nil {
		return nil, ErrQRTokenNotFound
	}
	establishmentID := table.Room.EstablishmentID

	session := &models.GuestSession{
		EstablishmentID: establishmentID,
		TableID:         &table.ID,
		GuestName:       guestName,
		IsAnonymous:     true,
	}
	if err := uc.guestSessionRepo.Create(ctx, session); err != nil {
		return nil, err
	}

	jwtToken, err := auth.GenerateGuestToken(session.ID, establishmentID, table.ID, guestName, true, uc.cfg.JWT.Secret)
	if err != nil {
		return nil, err
	}

	return &GuestSessionResponse{
		Token:       jwtToken,
		GuestName:   guestName,
		IsAnonymous: true,
		Session:     session,
	}, nil
}

func generateAnonymousGuestName() string {
	emojis := []string{"🐶", "🐱", "🐻", "🦊", "🐼", "🐨", "🦁", "🐯", "🐸", "🐧", "🦋", "🐬", "🦄", "🌟", "🎈", "🍕", "🍦", "🎵"}
	pick := func() string {
		n, err := crand.Int(crand.Reader, big.NewInt(int64(len(emojis))))
		if err != nil {
			return "🙂"
		}
		return emojis[n.Int64()]
	}

	return pick() + pick()
}

// RegisterGuest регистрирует нового гостя (с телефоном и паролем)
func (uc *QRMenuUseCase) RegisterGuest(ctx context.Context, qrToken uuid.UUID, req GuestCreateRequest) (*GuestSessionResponse, error) {
	if req.Phone == "" || req.Password == "" || req.GuestName == "" {
		return nil, ErrGuestNameRequired
	}

	table, err := uc.tableRepo.GetByQRToken(ctx, qrToken)
	if err != nil {
		return nil, ErrQRTokenNotFound
	}

	if table.Room == nil {
		return nil, ErrQRTokenNotFound
	}
	establishmentID := table.Room.EstablishmentID

	// Проверяем, не занят ли номер телефона
	existing, _ := uc.guestSessionRepo.GetByPhone(ctx, req.Phone, establishmentID)
	if existing != nil {
		return nil, ErrGuestPhoneRegistered
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	phone := req.Phone
	session := &models.GuestSession{
		EstablishmentID: establishmentID,
		TableID:         &table.ID,
		GuestName:       req.GuestName,
		Phone:           &phone,
		PasswordHash:    string(hash),
		IsAnonymous:     false,
	}
	if err := uc.guestSessionRepo.Create(ctx, session); err != nil {
		return nil, err
	}

	jwtToken, err := auth.GenerateGuestToken(session.ID, establishmentID, table.ID, req.GuestName, false, uc.cfg.JWT.Secret)
	if err != nil {
		return nil, err
	}

	return &GuestSessionResponse{
		Token:       jwtToken,
		GuestName:   req.GuestName,
		IsAnonymous: false,
		Session:     session,
	}, nil
}

// LoginGuest выполняет вход зарегистрированного гостя (телефон + пароль)
func (uc *QRMenuUseCase) LoginGuest(ctx context.Context, qrToken uuid.UUID, phone, password string) (*GuestSessionResponse, error) {
	table, err := uc.tableRepo.GetByQRToken(ctx, qrToken)
	if err != nil {
		return nil, ErrQRTokenNotFound
	}
	if table.Room == nil {
		return nil, ErrQRTokenNotFound
	}
	establishmentID := table.Room.EstablishmentID

	session, err := uc.guestSessionRepo.GetByPhone(ctx, phone, establishmentID)
	if err != nil {
		return nil, ErrGuestInvalidPassword
	}

	if err := bcrypt.CompareHashAndPassword([]byte(session.PasswordHash), []byte(password)); err != nil {
		return nil, ErrGuestInvalidPassword
	}

	// Обновляем привязку к текущему столу
	session.TableID = &table.ID
	jwtToken, err := auth.GenerateGuestToken(session.ID, establishmentID, table.ID, session.GuestName, false, uc.cfg.JWT.Secret)
	if err != nil {
		return nil, err
	}

	return &GuestSessionResponse{
		Token:       jwtToken,
		GuestName:   session.GuestName,
		IsAnonymous: false,
		Session:     session,
	}, nil
}

// CreateQROrder создаёт заказ от имени гостя через QR-меню
type QROrderItemRequest struct {
	ProductID  *uuid.UUID `json:"product_id"`
	TechCardID *uuid.UUID `json:"tech_card_id"`
	Quantity   int        `json:"quantity"`
}

type CreateQROrderRequest struct {
	Items []QROrderItemRequest `json:"items"`
}

func (uc *QRMenuUseCase) CreateQROrder(ctx context.Context, claims *auth.GuestClaims, req CreateQROrderRequest) (*models.Order, error) {
	if len(req.Items) == 0 {
		return nil, ErrQROrderItemsRequired
	}

	tableID := claims.TableID
	order := &models.Order{
		EstablishmentID: claims.EstablishmentID,
		TableID:         &tableID,
		Status:          "confirmed",
		PaymentStatus:   "pending",
		Source:          "qr_menu",
		GuestName:       &claims.GuestName,
		GuestSessionID:  &claims.SessionID,
	}

	// Рассчитываем позиции заказа
	var totalAmount float64
	validItemsCount := 0
	for _, item := range req.Items {
		if item.Quantity <= 0 {
			continue
		}

		hasProduct := item.ProductID != nil
		hasTechCard := item.TechCardID != nil
		if hasProduct == hasTechCard {
			return nil, ErrQROrderInvalidItem
		}

		orderItem := &models.OrderItem{
			ProductID:  item.ProductID,
			TechCardID: item.TechCardID,
			Quantity:   item.Quantity,
		}

		// Получаем цену товара или тех-карты
		if item.ProductID != nil {
			product, err := uc.productRepo.GetByID(ctx, *item.ProductID, &claims.EstablishmentID)
			if err != nil {
				if !errors.Is(err, gorm.ErrRecordNotFound) {
					return nil, err
				}

				// Обратная совместимость для старого клиента:
				// если пришел product_id, но это на самом деле id тех-карты.
				techCard, tcErr := uc.techCardRepo.GetByID(ctx, *item.ProductID, &claims.EstablishmentID)
				if tcErr != nil {
					return nil, err
				}
				orderItem.ProductID = nil
				orderItem.TechCardID = &techCard.ID
				orderItem.Price = techCard.Price
				orderItem.TotalPrice = models.RoundTo2(techCard.Price * float64(item.Quantity))
			} else {
				orderItem.Price = product.Price
				orderItem.TotalPrice = models.RoundTo2(product.Price * float64(item.Quantity))
			}
		} else {
			techCard, err := uc.techCardRepo.GetByID(ctx, *item.TechCardID, &claims.EstablishmentID)
			if err != nil {
				return nil, err
			}
			orderItem.Price = techCard.Price
			orderItem.TotalPrice = models.RoundTo2(techCard.Price * float64(item.Quantity))
		}

		totalAmount += orderItem.TotalPrice
		order.Items = append(order.Items, *orderItem)
		validItemsCount++
	}

	if validItemsCount == 0 {
		return nil, ErrQROrderNoValidItems
	}

	order.TotalAmount = models.RoundTo2(totalAmount)
	order.FinalAmount = order.TotalAmount

	if err := uc.orderRepo.Create(ctx, order); err != nil {
		return nil, err
	}

	// Помечаем стол как занятый
	if err := uc.tableRepo.UpdateStatus(ctx, tableID, "occupied"); err != nil {
		uc.logger.Warn("failed to update table status", zap.Error(err))
	}

	// Загружаем созданный заказ с позициями
	created, err := uc.orderRepo.GetByID(ctx, order.ID)
	if err != nil {
		return order, nil
	}
	return created, nil
}

// GetGuestOrders возвращает заказы гостя по текущей сессии
func (uc *QRMenuUseCase) GetGuestOrders(ctx context.Context, sessionID uuid.UUID, establishmentID uuid.UUID) ([]*models.Order, error) {
	allOrders, err := uc.orderRepo.ListActiveByEstablishmentID(ctx, establishmentID)
	if err != nil {
		return nil, err
	}

	var result []*models.Order
	for _, o := range allOrders {
		if o.GuestSessionID != nil && *o.GuestSessionID == sessionID {
			result = append(result, o)
		}
	}
	return result, nil
}

// GenerateTableQRToken (admin) — генерирует/перегенерирует QR-токен для стола
func (uc *QRMenuUseCase) GenerateTableQRToken(ctx context.Context, tableID uuid.UUID) (uuid.UUID, error) {
	newToken := uuid.New()
	if err := uc.tableRepo.UpdateQRToken(ctx, tableID, newToken); err != nil {
		return uuid.Nil, err
	}
	return newToken, nil
}
