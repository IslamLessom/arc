package usecases

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
	"github.com/yourusername/arc/backend/pkg/auth"
)

type UserUseCase struct {
	userRepo repositories.UserRepository
	roleRepo repositories.RoleRepository
}

func NewUserUseCase(userRepo repositories.UserRepository, roleRepo repositories.RoleRepository) *UserUseCase {
	return &UserUseCase{
		userRepo: userRepo,
		roleRepo: roleRepo,
	}
}

// CreateEmployee создает нового сотрудника (пользователя) с ролью "employee"
func (uc *UserUseCase) CreateEmployee(ctx context.Context, name, email, pin string, phone *string, roleID uuid.UUID, establishmentID uuid.UUID) (*models.User, error) {
	// Проверяем, существует ли пользователь с таким email или PIN
	if existingUser, _ := uc.userRepo.GetByEmail(ctx, email); existingUser != nil {
		return nil, errors.New("user with this email already exists")
	}
	if existingUser, _ := uc.userRepo.GetByPIN(ctx, pin, establishmentID); existingUser != nil {
		return nil, errors.New("user with this PIN already exists")
	}

	// Получаем роль сотрудника
	role, err := uc.roleRepo.GetByID(ctx, roleID)
	if err != nil || role.Name != "employee"{
		return nil, errors.New("invalid role for employee creation")
	}

	// Хешируем PIN-код
	hashedPIN, err := auth.HashPassword(pin) // Используем хеширование для PIN как для пароля
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Name:            name,
		Email:           email,
		PIN:             &hashedPIN, // Сохраняем хешированный PIN
		Phone:           phone, // Добавлено поле для номера телефона
		RoleID:          roleID,
		EstablishmentID: &establishmentID,
		OnboardingCompleted: true, // Сотрудники не проходят онбординг
	}

	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

// GetEmployeeByID возвращает сотрудника по ID
func (uc *UserUseCase) GetEmployeeByID(ctx context.Context, id, establishmentID uuid.UUID) (*models.User, error) {
	user, err := uc.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	// Проверяем, что пользователь является сотрудником этого заведения
	if user.EstablishmentID == nil || *user.EstablishmentID != establishmentID {
		return nil, errors.New("user not found or not an employee of this establishment")
	}
	return user, nil
}

// ListEmployeesByEstablishment возвращает список сотрудников заведения
func (uc *UserUseCase) ListEmployeesByEstablishment(ctx context.Context, establishmentID uuid.UUID) ([]*models.User, error) {
	users, err := uc.userRepo.GetAllByEstablishmentID(ctx, establishmentID) 
	if err != nil {
		return nil, fmt.Errorf("failed to list employees: %w", err)
	}
	// Дополнительная фильтрация, если GetByEstablishmentID возвращает всех пользователей
	var employees []*models.User
	for _, user := range users {
		if user.Role.Name == "employee" || user.Role.Name == "cashier" { // Расширить, если есть другие роли для сотрудников
			employees = append(employees, user)
		}
	}
	return employees, nil
}

// UpdateEmployee обновляет данные сотрудника
func (uc *UserUseCase) UpdateEmployee(ctx context.Context, user *models.User, establishmentID uuid.UUID) (*models.User, error) {
	existingUser, err := uc.userRepo.GetByID(ctx, user.ID)
	if err != nil {
		return nil, errors.New("employee not found")
	}

	// Проверяем, что пользователь является сотрудником этого заведения
	if existingUser.EstablishmentID == nil || *existingUser.EstablishmentID != establishmentID {
		return nil, errors.New("user not found or not an employee of this establishment")
	}

	// Обновляем только разрешенные поля
	if user.Name != "" {
		existingUser.Name = user.Name
	}
	if user.Email != "" {
		// Проверить уникальность нового email
		if u, _ := uc.userRepo.GetByEmail(ctx, user.Email); u != nil && u.ID != existingUser.ID {
			return nil, errors.New("email already in use by another user")
		}
		existingUser.Email = user.Email
	}
	if user.PIN != nil && *user.PIN != "" {
		// Проверить уникальность нового PIN
				if u, _ := uc.userRepo.GetByPIN(ctx, *user.PIN, establishmentID); u != nil && u.ID != existingUser.ID {
			return nil, errors.New("PIN already in use by another user")
		}
		hashedPIN, err := auth.HashPassword(*user.PIN)
		if err != nil {
			return nil, err
		}
		existingUser.PIN = &hashedPIN
	}
	if user.RoleID != uuid.Nil {
		// Проверить, что новая роль является ролью сотрудника
		newRole, err := uc.roleRepo.GetByID(ctx, user.RoleID)
		if err != nil || (newRole.Name != "employee" && newRole.Name != "cashier") {
			return nil, errors.New("invalid role for employee update")
		}
		existingUser.RoleID = user.RoleID
	}
	if user.Phone != nil { // Добавлено поле для номера телефона
		existingUser.Phone = user.Phone
	}

	if err := uc.userRepo.Update(ctx, existingUser); err != nil {
		return nil, fmt.Errorf("failed to update employee: %w", err)
	}

	return existingUser, nil
}

// DeleteEmployee удаляет сотрудника (мягкое удаление)
func (uc *UserUseCase) DeleteEmployee(ctx context.Context, id, establishmentID uuid.UUID) error {
	user, err := uc.userRepo.GetByID(ctx, id)
	if err != nil {
		return errors.New("employee not found")
	}
	// Проверяем, что пользователь является сотрудником этого заведения
	if user.EstablishmentID == nil || *user.EstablishmentID != establishmentID {
		return errors.New("user not found or not an employee of this establishment")
	}
	
	return uc.userRepo.Delete(ctx, id)
}
