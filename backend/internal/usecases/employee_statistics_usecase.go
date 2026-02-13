package usecases

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/yourusername/arc/backend/internal/repositories"
)

// EmployeeStatistics represents statistics for an employee
type EmployeeStatistics struct {
	UserID            uuid.UUID `json:"user_id"`
	UserName          string    `json:"user_name"`
	TotalHoursWorked  float64   `json:"total_hours_worked"`
	TotalShifts       int        `json:"total_shifts"`
	TotalSales        float64   `json:"total_sales"`
	StartDate         time.Time `json:"start_date"`
	EndDate           time.Time `json:"end_date"`
}

type EmployeeStatisticsUseCase struct {
	userRepo  repositories.UserRepository
	shiftRepo repositories.ShiftRepository
}

func NewEmployeeStatisticsUseCase(
	userRepo repositories.UserRepository,
	shiftRepo repositories.ShiftRepository,
) *EmployeeStatisticsUseCase {
	return &EmployeeStatisticsUseCase{
		userRepo:  userRepo,
		shiftRepo: shiftRepo,
	}
}

// GetEmployeeStatistics returns statistics for a specific employee within a date range
func (uc *EmployeeStatisticsUseCase) GetEmployeeStatistics(
	ctx context.Context,
	userID, establishmentID uuid.UUID,
	startDate, endDate time.Time,
) (*EmployeeStatistics, error) {
	// Get user
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Get shifts for user in date range
	shifts, err := uc.shiftRepo.GetByUserIDAndDateRange(ctx, userID, establishmentID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get shifts: %w", err)
	}

	// Calculate total hours worked
	var totalHours float64
	for _, shift := range shifts {
		if shift.EndTime != nil {
			duration := shift.EndTime.Sub(shift.StartTime)
			totalHours += duration.Hours()
		}
	}

	// Note: TotalSales is not calculated because orders are not directly linked to users
	// TODO: Add shift_id to orders table to track sales per employee
	var totalSales float64 = 0

	return &EmployeeStatistics{
		UserID:           user.ID,
		UserName:         user.Name,
		TotalHoursWorked: totalHours,
		TotalShifts:      len(shifts),
		TotalSales:       totalSales,
		StartDate:        startDate,
		EndDate:          endDate,
	}, nil
}

// GetAllEmployeesStatistics returns statistics for all employees within a date range
func (uc *EmployeeStatisticsUseCase) GetAllEmployeesStatistics(
	ctx context.Context,
	establishmentID uuid.UUID,
	startDate, endDate time.Time,
) ([]EmployeeStatistics, error) {
	// Get all users for establishment
	users, err := uc.userRepo.GetAllByEstablishmentID(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get users: %w", err)
	}

	var stats []EmployeeStatistics

	for _, user := range users {
		stat, err := uc.GetEmployeeStatistics(ctx, user.ID, establishmentID, startDate, endDate)
		if err != nil {
			continue // Skip users with errors
		}
		stats = append(stats, *stat)
	}

	return stats, nil
}
