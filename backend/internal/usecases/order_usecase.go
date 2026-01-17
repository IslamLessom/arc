package usecases

import (
	"github.com/yourusername/arc/backend/internal/repositories"
)

type OrderUseCase struct {
	orderRepo    repositories.OrderRepository
	warehouseRepo repositories.WarehouseRepository
}

func NewOrderUseCase(
	orderRepo repositories.OrderRepository,
	warehouseRepo repositories.WarehouseRepository,
) *OrderUseCase {
	return &OrderUseCase{
		orderRepo:    orderRepo,
		warehouseRepo: warehouseRepo,
	}
}