package repositories

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/yourusername/arc/backend/internal/models"
)

type RoleRepository interface {
	GetByName(ctx context.Context, name string) (*models.Role, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Role, error)
}

type roleRepository struct {
	db *gorm.DB
}

func NewRoleRepository(db *gorm.DB) RoleRepository {
	return &roleRepository{db: db}
}

func (r *roleRepository) GetByName(ctx context.Context, name string) (*models.Role, error) {
	var role models.Role
	err := r.db.WithContext(ctx).Where("name = ?", name).First(&role).Error
	return &role, err
}

func (r *roleRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Role, error) {
	var role models.Role
	err := r.db.WithContext(ctx).First(&role, "id = ?", id).Error
	return &role, err
}
