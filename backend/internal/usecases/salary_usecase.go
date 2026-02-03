package usecases

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

// PositionPermissions представляет парсимые разрешения должности
type PositionPermissions struct {
	CashAccess struct {
		WorkWithCash bool `json:"work_with_cash"`
		AdminHall    bool `json:"admin_hall"`
	} `json:"cash_access"`
	AdminPanelAccess map[string]string `json:"admin_panel_access"`
	ApplicationsAccess struct {
		ConfirmInstallation bool `json:"confirm_installation"`
	} `json:"applications_access"`
	SalaryCalculation struct {
		FixedRate *struct {
			PerHour  *float64 `json:"per_hour"`
			PerShift *float64 `json:"per_shift"`
			PerMonth *float64 `json:"per_month"`
		} `json:"fixed_rate"`
		PersonalSalesPercentage *struct {
			CategoryID *string  `json:"category_id"`
			Percentage  float64 `json:"percentage"`
		} `json:"personal_sales_percentage"`
		ShiftSalesPercentage *struct {
			CategoryID *string  `json:"category_id"`
			Percentage  float64 `json:"percentage"`
		} `json:"shift_sales_percentage"`
	} `json:"salary_calculation"`
}

// SalaryEntry представляет запись зарплаты сотрудника за период
type SalaryEntry struct {
	EmployeeID              uuid.UUID  `json:"employee_id"`
	EmployeeName            string     `json:"employee_name"`
	PositionID              uuid.UUID  `json:"position_id"`
	PositionName            string     `json:"position_name"`
	MonthlyRate             *float64   `json:"monthly_rate"`
	HoursWorked             float64    `json:"hours_worked"`
	ShiftsWorked            int        `json:"shifts_worked"`
	HourlyRate              *float64   `json:"hourly_rate"`
	ShiftRate               *float64   `json:"shift_rate"`
	ShiftSalesAmount        float64    `json:"shift_sales_amount"`
	ShiftSalesPercentage    *float64   `json:"shift_sales_percentage"`
	ShiftSalesCommission    float64    `json:"shift_sales_commission"`
	PersonalSalesAmount     float64    `json:"personal_sales_amount"`
	PersonalSalesPercentage *float64   `json:"personal_sales_percentage"`
	PersonalSalesCommission float64    `json:"personal_sales_commission"`
	TotalSalary             float64    `json:"total_salary"`
}

// SalaryReport представляет отчет по зарплатам за период
type SalaryReport struct {
	StartDate     time.Time      `json:"start_date"`
	EndDate       time.Time      `json:"end_date"`
	Entries       []SalaryEntry  `json:"entries"`
	TotalSalary   float64        `json:"total_salary"`
}

type SalaryUseCase struct {
	userRepo  repositories.UserRepository
	roleRepo  repositories.RoleRepository
	shiftRepo repositories.ShiftRepository
	orderRepo repositories.OrderRepository
}

func NewSalaryUseCase(
	userRepo repositories.UserRepository,
	roleRepo repositories.RoleRepository,
	shiftRepo repositories.ShiftRepository,
	orderRepo repositories.OrderRepository,
) *SalaryUseCase {
	return &SalaryUseCase{
		userRepo:  userRepo,
		roleRepo:  roleRepo,
		shiftRepo: shiftRepo,
		orderRepo: orderRepo,
	}
}

// GetSalaryReport генерирует отчет по зарплатам за указанный период
func (uc *SalaryUseCase) GetSalaryReport(ctx context.Context, establishmentID uuid.UUID, startDate, endDate time.Time) (*SalaryReport, error) {
	// Получаем всех сотрудников заведения
	users, err := uc.userRepo.GetAllByEstablishmentID(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to list users: %w", err)
	}

	// Получаем смены за период
	shifts, err := uc.shiftRepo.ListByFilter(ctx, &repositories.ShiftFilter{
		EstablishmentID: &establishmentID,
		StartDate:       &startDate,
		EndDate:         &endDate,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list shifts: %w", err)
	}

	// Группируем смены по сотрудникам
	shiftsByUser := make(map[uuid.UUID][]*models.Shift)
	for _, shift := range shifts {
		shiftsByUser[shift.UserID] = append(shiftsByUser[shift.UserID], shift)
	}

	var entries []SalaryEntry
	var totalSalary float64

	// Для каждого сотрудника вычисляем зарплату
	for _, user := range users {
		// Получаем роль сотрудника с настройками зарплаты
		role, err := uc.roleRepo.GetByID(ctx, user.RoleID)
		if err != nil {
			continue // Пропускаем сотрудников без роли
		}

		// Парсим permissions
		var permissions PositionPermissions
		if err := json.Unmarshal([]byte(role.Permissions), &permissions); err != nil {
			continue // Пропускаем если не удалось распарсить
		}

		entry := SalaryEntry{
			EmployeeID:   user.ID,
			EmployeeName: user.Name,
			PositionID:   role.ID,
			PositionName: role.Name,
		}

		// Получаем смены сотрудника
		userShifts := shiftsByUser[user.ID]
		entry.ShiftsWorked = len(userShifts)

		var totalHours float64
		var shiftSalesAmount float64
		var personalSalesAmount float64

		// Вычисляем часы и продажи
		for _, shift := range userShifts {
			// Вычисляем часы
			if shift.EndTime != nil {
				duration := shift.EndTime.Sub(shift.StartTime)
				totalHours += duration.Hours()
			}

			// Получаем заказы за смену для расчета процентов от продаж
			shiftEndTime := shift.EndTime
			if shiftEndTime == nil {
				shiftEndTime = &endDate
			}

			orders, err := uc.orderRepo.ListByShiftIDAndEstablishmentIDAndDateRange(
				ctx, shift.ID, establishmentID, shift.StartTime, *shiftEndTime,
			)
			if err == nil {
				for _, order := range orders {
					// Продажи за смену (все продажи смены)
					shiftSalesAmount += order.TotalAmount

					// Личные продажи (продажи совершенные сотрудником)
					// Для этого нужно проверить что заказ оформлен именно этим сотрудником
					// Пока берем все продажи смены как личные
					personalSalesAmount += order.TotalAmount
				}
			}
		}

		entry.HoursWorked = totalHours
		entry.ShiftSalesAmount = shiftSalesAmount
		entry.PersonalSalesAmount = personalSalesAmount

		// Фиксированная ставка
		if permissions.SalaryCalculation.FixedRate != nil {
			fixed := permissions.SalaryCalculation.FixedRate

			// Месячная ставка
			if fixed.PerMonth != nil && *fixed.PerMonth > 0 {
				entry.MonthlyRate = fixed.PerMonth
				entry.TotalSalary += *fixed.PerMonth
			}

			// Почасовая оплата
			if fixed.PerHour != nil && *fixed.PerHour > 0 {
				entry.HourlyRate = fixed.PerHour
				entry.TotalSalary += *fixed.PerHour * totalHours
			}

			// Оплата за смену
			if fixed.PerShift != nil && *fixed.PerShift > 0 {
				entry.ShiftRate = fixed.PerShift
				entry.TotalSalary += *fixed.PerShift * float64(entry.ShiftsWorked)
			}
		}

		// Процент от продаж за смены
		if permissions.SalaryCalculation.ShiftSalesPercentage != nil &&
			permissions.SalaryCalculation.ShiftSalesPercentage.Percentage > 0 {
			percentage := permissions.SalaryCalculation.ShiftSalesPercentage.Percentage
			entry.ShiftSalesPercentage = &percentage
			commission := (shiftSalesAmount * percentage) / 100
			entry.ShiftSalesCommission = commission
			entry.TotalSalary += commission
		}

		// Процент от личных продаж
		if permissions.SalaryCalculation.PersonalSalesPercentage != nil &&
			permissions.SalaryCalculation.PersonalSalesPercentage.Percentage > 0 {
			percentage := permissions.SalaryCalculation.PersonalSalesPercentage.Percentage
			entry.PersonalSalesPercentage = &percentage
			commission := (personalSalesAmount * percentage) / 100
			entry.PersonalSalesCommission = commission
			entry.TotalSalary += commission
		}

		entries = append(entries, entry)
		totalSalary += entry.TotalSalary
	}

	return &SalaryReport{
		StartDate:   startDate,
		EndDate:     endDate,
		Entries:     entries,
		TotalSalary: totalSalary,
	}, nil
}
