package usecases

import (
	"context"
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

type AuthUseCase struct {
	userRepo         repositories.UserRepository
	roleRepo         repositories.RoleRepository
	subscriptionRepo repositories.SubscriptionRepository
	tokenRepo        repositories.TokenRepository
	establishmentRepo repositories.EstablishmentRepository
	shiftUseCase     *ShiftUseCase // Заменено на ShiftUseCase
	config           *config.Config
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
		userRepo:         userRepo,
		roleRepo:         roleRepo,
		subscriptionRepo: subscriptionRepo,
		tokenRepo:        tokenRepo,
		establishmentRepo: establishmentRepo,
		shiftUseCase:     shiftUseCase, // Присвоение ShiftUseCase
		config:           cfg,
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
		Email:                email,
		Password:             hashedPassword,
		Name:                 name,
		RoleID:               roleID,
		OnboardingCompleted:  false,
	}

	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, "", "", err
	}

	// Создаем подписку на бесплатный тариф (14 дней)
	plan, err := uc.subscriptionRepo.GetPlanByName(ctx, "Free Trial")
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
	accessToken, err := auth.GenerateToken(user.ID, user.Email, uc.config.JWT.Secret, uc.config.JWT.Expiration)
	if err != nil {
		return nil, "", "", err
	}

	refreshToken, err := auth.GenerateRefreshToken(user.ID, user.Email, uc.config.JWT.Secret)
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
	accessToken, err := auth.GenerateToken(user.ID, user.Email, uc.config.JWT.Secret, uc.config.JWT.Expiration)
	if err != nil {
		return nil, "", "", err
	}

	refreshToken, err := auth.GenerateRefreshToken(user.ID, user.Email, uc.config.JWT.Secret)
	if err != nil {
		return nil, "", "", err
	}

	return user, accessToken, refreshToken, nil
}

func (uc *AuthUseCase) LoginEmployee(ctx context.Context, pin string, initialCash float64, establishmentID uuid.UUID) (*models.User, string, string, error) { // Изменена сигнатура
	user, err := uc.userRepo.GetByPIN(ctx, pin, establishmentID) // Передаем establishmentID
	if err != nil {
		return nil, "", "", repositories.ErrUserNotFound
	}

	// Check if user has an establishment (this check is now redundant but kept for safety)
	if user.EstablishmentID == nil || *user.EstablishmentID != establishmentID {
		return nil, "", "", errors.New("employee not found in this establishment") // Более точное сообщение об ошибке
	}

	// Create a new shift
	_, err = uc.shiftUseCase.StartShift(ctx, user.ID, *user.EstablishmentID, initialCash)
	if err != nil {
		return nil, "", "", fmt.Errorf("failed to start shift: %w", err)
	}

	// Generate tokens
	accessToken, err := auth.GenerateToken(user.ID, user.Email, uc.config.JWT.Secret, uc.config.JWT.Expiration)
	if err != nil {
		return nil, "", "", err
	}

	refreshToken, err := auth.GenerateRefreshToken(user.ID, user.Email, uc.config.JWT.Secret)
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
	accessToken, err := auth.GenerateToken(user.ID, user.Email, uc.config.JWT.Secret, uc.config.JWT.Expiration)
	if err != nil {
		return "", "", err
	}

	newRefreshToken, err := auth.GenerateRefreshToken(user.ID, user.Email, uc.config.JWT.Secret)
	if err != nil {
		return "", "", err
	}

	return accessToken, newRefreshToken, nil
}

// ValidateSubscription проверяет, активна ли подписка пользователя
func (uc *AuthUseCase) ValidateSubscription(ctx context.Context, userID uuid.UUID) (bool, error) {
	subscription, err := uc.subscriptionRepo.GetSubscriptionByUserID(ctx, userID)
	if err != nil {
		return false, err
	}

	if subscription == nil {
		return false, nil
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
