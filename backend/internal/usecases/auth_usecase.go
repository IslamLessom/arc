package usecases

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/yourusername/arc/backend/internal/config"
	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
	"github.com/yourusername/arc/backend/pkg/auth"
)

var ErrUserAlreadyExists = errors.New("user with this email already exists")
var ErrEmailRequired = errors.New("email is required")
var ErrNoApplicationAccess = errors.New("employee does not have access to this application")
var ErrSubscriptionExpired = errors.New("subscription expired")

// PermissionsData представляет распарсенные permissions из role
type PermissionsData struct {
	CashAccess struct {
		WorkWithCash bool `json:"work_with_cash"`
		AdminHall    bool `json:"admin_hall"`
	} `json:"cash_access"`
	AdminPanelAccess struct {
		Sections []struct {
			Section     string `json:"section"`
			AccessLevel string `json:"access_level"`
		} `json:"sections"`
	} `json:"admin_panel_access"`
	ApplicationsAccess struct {
		ConfirmInstallation bool `json:"confirm_installation"`
	} `json:"applications_access"`
	SalaryCalculation struct{} `json:"salary_calculation"`
}

type AuthUseCase struct {
	userRepo          repositories.UserRepository
	roleRepo          repositories.RoleRepository
	subscriptionRepo  repositories.SubscriptionRepository
	tokenRepo         repositories.TokenRepository
	establishmentRepo repositories.EstablishmentRepository
	shiftUseCase      *ShiftUseCase // Заменено на ShiftUseCase
	config            *config.Config
}

func NewAuthUseCase(
	userRepo repositories.UserRepository,
	roleRepo repositories.RoleRepository,
	subscriptionRepo repositories.SubscriptionRepository,
	tokenRepo repositories.TokenRepository,
	establishmentRepo repositories.EstablishmentRepository,
	shiftUseCase *ShiftUseCase, // Заменено на ShiftUseCase
	cfg *config.Config,
) *AuthUseCase {
	return &AuthUseCase{
		userRepo:          userRepo,
		roleRepo:          roleRepo,
		subscriptionRepo:  subscriptionRepo,
		tokenRepo:         tokenRepo,
		establishmentRepo: establishmentRepo,
		shiftUseCase:      shiftUseCase, // Присвоение ShiftUseCase
		config:            cfg,
	}
}

// Register создает нового пользователя и автоматически создает подписку на 14 дней
func (uc *AuthUseCase) Register(ctx context.Context, email, password, name string) (*models.User, string, string, error) {
	// Проверяем, существует ли пользователь
	if email == "" {
		return nil, "", "", ErrEmailRequired
	}

	existingUser, _ := uc.userRepo.GetByEmail(ctx, email)
	if existingUser != nil {
		return nil, "", "", ErrUserAlreadyExists
	}

	// Хешируем пароль
	hashedPassword, err := auth.HashPassword(password)
	if err != nil {
		return nil, "", "", err
	}

	// Получаем роль "owner" (по умолчанию для регистрации)
	role, err := uc.roleRepo.GetByName(ctx, "owner")
	if err != nil {
		// Если роли нет, возвращаем ошибку (нужно создать seed данные)
		return nil, "", "", errors.New("owner role not found, please seed roles first")
	}
	roleID := role.ID

	// Создаем пользователя
	user := &models.User{
		Email:               &email,
		Password:            hashedPassword,
		Name:                name,
		RoleID:              roleID,
		OnboardingCompleted: false,
	}

	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, "", "", err
	}

	// Создаем подписку на бесплатный тариф (14 дней)
	plan, err := uc.subscriptionRepo.GetPlanByName(ctx, "Trial")
	if err != nil {
		// Если плана нет, пропускаем создание подписки (можно создать позже)
		// return nil, "", "", fmt.Errorf("free trial plan not found: %w", err)
	} else {
		subscription := &models.Subscription{
			UserID:    user.ID,
			PlanID:    plan.ID,
			StartDate: time.Now(),
			EndDate:   time.Now().Add(time.Duration(plan.Duration) * 24 * time.Hour),
			IsActive:  true,
			AutoRenew: false,
		}

		if err := uc.subscriptionRepo.CreateSubscription(ctx, subscription); err != nil {
			return nil, "", "", err
		}

		user.SubscriptionID = &subscription.ID
		if err := uc.userRepo.Update(ctx, user); err != nil {
			return nil, "", "", err
		}
	}

	// Генерируем токены
	accessToken, err := auth.GenerateToken(user.ID, *user.Email, uc.config.JWT.Secret, uc.config.JWT.Expiration)
	if err != nil {
		return nil, "", "", err
	}

	refreshToken, err := auth.GenerateRefreshToken(user.ID, *user.Email, uc.config.JWT.Secret)
	if err != nil {
		return nil, "", "", err
	}

	return user, accessToken, refreshToken, nil
}

// Login авторизует пользователя и возвращает токены
func (uc *AuthUseCase) Login(ctx context.Context, email, password string) (*models.User, string, string, error) {
	user, err := uc.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, "", "", repositories.ErrUserNotFound
	}

	// Проверяем пароль
	if !auth.CheckPassword(password, user.Password) {
		return nil, "", "", repositories.ErrInvalidCredentials
	}

	// Генерируем токены
	accessToken, err := auth.GenerateToken(user.ID, *user.Email, uc.config.JWT.Secret, uc.config.JWT.Expiration)
	if err != nil {
		return nil, "", "", err
	}

	refreshToken, err := auth.GenerateRefreshToken(user.ID, *user.Email, uc.config.JWT.Secret)
	if err != nil {
		return nil, "", "", err
	}

	return user, accessToken, refreshToken, nil
}

func (uc *AuthUseCase) LoginEmployee(ctx context.Context, pin string, initialCash float64, establishmentID uuid.UUID) (*models.User, string, string, error) {
	user, err := uc.userRepo.GetByPIN(ctx, pin, establishmentID)
	if err != nil {
		return nil, "", "", repositories.ErrUserNotFound
	}

	// Проверяем, что у сотрудника есть роль
	if user.Role == nil {
		return nil, "", "", errors.New("employee role not found")
	}

	// Проверяем доступ к приложению POS (обязательное условие для входа в POS)
	perms := &PermissionsData{}
	if user.Role.Permissions != "" {
		if err := json.Unmarshal([]byte(user.Role.Permissions), perms); err != nil {
			// Если не можем распарсить permissions - считаем что доступа нет
			return nil, "", "", fmt.Errorf("failed to parse role permissions: %w", err)
		}
	}

	// Для входа в POS приложение у сотрудника должен быть хотя бы какой-то доступ установлен
	// Либо явный доступ к POS (через applications_access или какой-то другой механизм)
	// Пока будем проверять что хотя бы есть разрешение работать с кассой
	// или какие-то установленные права вообще

	// Проверяем наличие реальных прав в админ-панели (не 'none')
	hasAdminAccess := false
	for _, section := range perms.AdminPanelAccess.Sections {
		if section.AccessLevel != "none" {
			hasAdminAccess = true
			break
		}
	}

	hasAnyAccess := perms.CashAccess.WorkWithCash ||
		perms.CashAccess.AdminHall ||
		hasAdminAccess

	if !hasAnyAccess && user.Role.Permissions != "" {
		// Если есть permissions строка но нет доступов - это потенциально означает что администратор
		// запретил доступ сотруднику (явно удалил все права)
		return nil, "", "", ErrNoApplicationAccess
	}

	// Если у пользователя не установлен EstablishmentID, устанавливаем его
	updated := false
	if user.EstablishmentID == nil {
		user.EstablishmentID = &establishmentID
		updated = true
	} else if *user.EstablishmentID != establishmentID {
		// Проверяем, что пользователь принадлежит к указанному заведению
		return nil, "", "", errors.New("employee not found in this establishment")
	}

	// Если обновили EstablishmentID, сохраняем в базу
	if updated {
		err = uc.userRepo.Update(ctx, user)
		if err != nil {
			return nil, "", "", fmt.Errorf("failed to update user establishment: %w", err)
		}
	}

	isValidSubscription, err := uc.ValidateSubscription(ctx, user.ID)
	if err != nil {
		return nil, "", "", fmt.Errorf("failed to validate subscription: %w", err)
	}
	if !isValidSubscription {
		return nil, "", "", ErrSubscriptionExpired
	}

	// Проверяем, есть ли уже активная сессия у пользователя
	existingSession, err := uc.shiftUseCase.GetUserActiveSession(ctx, user.ID)
	if err != nil || existingSession == nil {
		// Нет активной сессии - создаём новую
		_, err = uc.shiftUseCase.StartUserSession(ctx, user.ID, *user.EstablishmentID, initialCash)
		if err != nil {
			return nil, "", "", fmt.Errorf("failed to start shift session: %w", err)
		}
	}
	// Если сессия есть - продолжаем вход (используем существующую)

	// Generate tokens
	accessToken, err := auth.GenerateToken(user.ID, *user.Email, uc.config.JWT.Secret, uc.config.JWT.Expiration)
	if err != nil {
		return nil, "", "", err
	}

	refreshToken, err := auth.GenerateRefreshToken(user.ID, *user.Email, uc.config.JWT.Secret)
	if err != nil {
		return nil, "", "", err
	}

	return user, accessToken, refreshToken, nil
}

// RefreshToken обновляет access token используя refresh token
func (uc *AuthUseCase) RefreshToken(ctx context.Context, refreshTokenString string) (string, string, error) {
	claims, err := auth.ValidateToken(refreshTokenString, uc.config.JWT.Secret)
	if err != nil {
		return "", "", errors.New("invalid refresh token")
	}

	// Получаем пользователя
	user, err := uc.userRepo.GetByID(ctx, claims.UserID)
	if err != nil {
		return "", "", repositories.ErrUserNotFound
	}

	// Генерируем новые токены
	accessToken, err := auth.GenerateToken(user.ID, *user.Email, uc.config.JWT.Secret, uc.config.JWT.Expiration)
	if err != nil {
		return "", "", err
	}

	newRefreshToken, err := auth.GenerateRefreshToken(user.ID, *user.Email, uc.config.JWT.Secret)
	if err != nil {
		return "", "", err
	}

	return accessToken, newRefreshToken, nil
}

// ValidateSubscription проверяет, активна ли подписка пользователя
func (uc *AuthUseCase) ValidateSubscription(ctx context.Context, userID uuid.UUID) (bool, error) {
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return false, err
	}

	subscription, err := uc.subscriptionRepo.GetSubscriptionByUserID(ctx, userID)
	if err != nil {
		return false, err
	}

	if subscription == nil {
		if user.EstablishmentID == nil {
			return false, nil
		}

		establishment, err := uc.establishmentRepo.GetByID(ctx, *user.EstablishmentID)
		if err != nil {
			return false, err
		}

		subscription, err = uc.subscriptionRepo.GetSubscriptionByUserID(ctx, establishment.OwnerID)
		if err != nil {
			return false, err
		}
		if subscription == nil {
			return false, nil
		}
	}

	return subscription.IsValid(), nil
}

// Logout добавляет токен в blacklist
func (uc *AuthUseCase) Logout(ctx context.Context, tokenString string, userID uuid.UUID) error {
	// Получаем время истечения токена
	expiresAt, err := auth.GetTokenExpiration(tokenString, uc.config.JWT.Secret)
	if err != nil {
		// Если не удалось получить время истечения, используем текущее время + 24 часа
		expiresAt = time.Now().Add(24 * time.Hour)
	}

	// Добавляем токен в blacklist
	return uc.tokenRepo.AddToBlacklist(ctx, tokenString, userID, expiresAt)
}

// GetTokenRepo возвращает репозиторий токенов (для middleware)
func (uc *AuthUseCase) GetTokenRepo() repositories.TokenRepository {
	return uc.tokenRepo
}

// GetCurrentUser возвращает данные текущего пользователя
func (uc *AuthUseCase) GetCurrentUser(ctx context.Context, userID uuid.UUID) (*models.User, error) {
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return user, nil
}

// GetUserByID возвращает пользователя по ID с загруженной ролью
func (uc *AuthUseCase) GetUserByID(ctx context.Context, userID uuid.UUID) (*models.User, error) {
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Загружаем роль пользователя
	if user.RoleID != uuid.Nil {
		role, err := uc.roleRepo.GetByID(ctx, user.RoleID)
		if err == nil {
			user.Role = role
		}
	}

	return user, nil
}

// GetCurrentUserWithEstablishment возвращает данные текущего пользователя и его заведение
func (uc *AuthUseCase) GetCurrentUserWithEstablishment(ctx context.Context, userID uuid.UUID) (*models.User, *models.Establishment, error) {
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, nil, err
	}

	var establishment *models.Establishment
	if user.EstablishmentID != nil {
		est, err := uc.establishmentRepo.GetByID(ctx, *user.EstablishmentID)
		if err != nil {
			// Если заведение не найдено, возвращаем пользователя без заведения
			return user, nil, nil
		}
		establishment = est
	}

	return user, establishment, nil
}

// GetEstablishmentID возвращает ID заведения пользователя (нужен завершённый onboarding)
func (uc *AuthUseCase) GetEstablishmentID(ctx context.Context, userID uuid.UUID) (*uuid.UUID, error) {
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return user.EstablishmentID, nil
}
