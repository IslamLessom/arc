package usecases

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

type RoleUseCase struct {
	roleRepo repositories.RoleRepository
}

func NewRoleUseCase(roleRepo repositories.RoleRepository) *RoleUseCase {
	return &RoleUseCase{
		roleRepo: roleRepo,
	}
}

// CreateRole создает новую роль
func (uc *RoleUseCase) CreateRole(ctx context.Context, name string, permissions string) (*models.Role, error) {
	// Проверяем, существует ли роль с таким именем
	existingRole, err := uc.roleRepo.GetByName(ctx, name)
	if err == nil && existingRole != nil && existingRole.ID != uuid.Nil {
		return nil, errors.New("role with this name already exists")
	}

	role := &models.Role{
		Name:        name,
		Permissions: permissions,
	}

	if err := uc.roleRepo.Create(ctx, role); err != nil {
		return nil, fmt.Errorf("failed to create role: %w", err)
	}

	return role, nil
}

// GetRoleByID возвращает роль по ID
func (uc *RoleUseCase) GetRoleByID(ctx context.Context, id uuid.UUID) (*models.Role, error) {
	role, err := uc.roleRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get role: %w", err)
	}
	return role, nil
}

// GetRoleByName возвращает роль по имени
func (uc *RoleUseCase) GetRoleByName(ctx context.Context, name string) (*models.Role, error) {
	role, err := uc.roleRepo.GetByName(ctx, name)
	if err != nil {
		return nil, fmt.Errorf("failed to get role by name: %w", err)
	}
	return role, nil
}

// UpdateRole обновляет роль
func (uc *RoleUseCase) UpdateRole(ctx context.Context, role *models.Role) (*models.Role, error) {
	existingRole, err := uc.roleRepo.GetByID(ctx, role.ID)
	if err != nil {
		return nil, errors.New("role not found")
	}

	// Проверяем уникальность имени, если оно изменилось
	if role.Name != existingRole.Name {
		if r, _ := uc.roleRepo.GetByName(ctx, role.Name); r != nil && r.ID != existingRole.ID {
			return nil, errors.New("role with this name already exists")
		}
		existingRole.Name = role.Name
	}
	if role.Permissions != "" {
		existingRole.Permissions = role.Permissions
	}

	if err := uc.roleRepo.Update(ctx, existingRole); err != nil {
		return nil, fmt.Errorf("failed to update role: %w", err)
	}

	return existingRole, nil
}

// DeleteRole удаляет роль (мягкое удаление)
func (uc *RoleUseCase) DeleteRole(ctx context.Context, id uuid.UUID) error {
	if err := uc.roleRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete role: %w", err)
	}
	return nil
}

// ListRoles возвращает список всех ролей
func (uc *RoleUseCase) ListRoles(ctx context.Context) ([]*models.Role, error) {
	// TODO: Add a List method to RoleRepository
	// For now, let's assume there is a GetAll method that returns all roles.
	roles, err := uc.roleRepo.GetAll(ctx) // Предполагаем, что такой метод есть или будет
	if err != nil {
		return nil, fmt.Errorf("failed to list roles: %w", err)
	}
	return roles, nil
}