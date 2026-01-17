package usecases

import (
	"github.com/yourusername/arc/backend/internal/repositories"
)

type StatisticsUseCase struct {
	orderRepo repositories.OrderRepository
}

func NewStatisticsUseCase(orderRepo repositories.OrderRepository) *StatisticsUseCase {
	return &StatisticsUseCase{
		orderRepo: orderRepo,
	}
}