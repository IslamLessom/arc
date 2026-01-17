package usecases

import (
	"github.com/yourusername/arc/backend/internal/repositories"
)

type FinanceUseCase struct {
	transactionRepo repositories.TransactionRepository
	shiftRepo       repositories.ShiftRepository
}

func NewFinanceUseCase(
	transactionRepo repositories.TransactionRepository,
	shiftRepo repositories.ShiftRepository,
) *FinanceUseCase {
	return &FinanceUseCase{
		transactionRepo: transactionRepo,
		shiftRepo:       shiftRepo,
	}
}