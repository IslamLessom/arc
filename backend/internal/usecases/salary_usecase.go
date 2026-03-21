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

type SalaryPercentageRule struct {
	CategoryID *string `json:"category_id"`
	Percentage float64 `json:"percentage"`
}

// PositionPermissions представляет парсимые разрешения должности
type PositionPermissions struct {
	CashAccess struct {
		WorkWithCash bool `json:"work_with_cash"`
		AdminHall    bool `json:"admin_hall"`
	} `json:"cash_access"`
	AdminPanelAccess   interface{} `json:"admin_panel_access"` // может быть map или array
	ApplicationsAccess struct {
		ConfirmInstallation bool `json:"confirm_installation"`
	} `json:"applications_access"`
	SalaryCalculation struct {
		FixedRate *struct {
			PerHour  *float64 `json:"per_hour"`
			PerShift *float64 `json:"per_shift"`
			PerMonth *float64 `json:"per_month"`
		} `json:"fixed_rate"`
		PersonalSalesPercentage  *SalaryPercentageRule  `json:"personal_sales_percentage"`
		ShiftSalesPercentage     *SalaryPercentageRule  `json:"shift_sales_percentage"`
		PersonalSalesPercentages []SalaryPercentageRule `json:"personal_sales_percentages"`
		ShiftSalesPercentages    []SalaryPercentageRule `json:"shift_sales_percentages"`
	} `json:"salary_calculation"`
}

func normalizeSalaryRules(single *SalaryPercentageRule, multiple []SalaryPercentageRule) []SalaryPercentageRule {
	if len(multiple) > 0 {
		return multiple
	}
	if single != nil {
		return []SalaryPercentageRule{*single}
	}
	return []SalaryPercentageRule{}
}

func calculateSalesByCategory(orders []*models.Order, categoryID *string) float64 {
	includeAllCategories := categoryID == nil || *categoryID == "" || *categoryID == "all"
	if !includeAllCategories {
		if _, err := uuid.Parse(*categoryID); err != nil {
			includeAllCategories = true
		}
	}

	var total float64
	for _, order := range orders {
		if includeAllCategories {
			if len(order.Items) == 0 {
				total += order.TotalAmount
				continue
			}
			for _, item := range order.Items {
				total += item.TotalPrice
			}
			continue
		}

		for _, item := range order.Items {
			if item.Product != nil && item.Product.CategoryID.String() == *categoryID {
				total += item.TotalPrice
				continue
			}
			if item.TechCard != nil && item.TechCard.CategoryID.String() == *categoryID {
				total += item.TotalPrice
			}
		}
	}
	return total
}

// SalaryEntry представляет запись зарплаты сотрудника за период
type SalaryEntry struct {
	EmployeeID              uuid.UUID `json:"employee_id"`
	EmployeeName            string    `json:"employee_name"`
	PositionID              uuid.UUID `json:"position_id"`
	PositionName            string    `json:"position_name"`
	MonthlyRate             *float64  `json:"monthly_rate"`
	HoursWorked             float64   `json:"hours_worked"`
	ShiftsWorked            int       `json:"shifts_worked"`
	HourlyRate              *float64  `json:"hourly_rate"`
	ShiftRate               *float64  `json:"shift_rate"`
	ShiftSalesAmount        float64   `json:"shift_sales_amount"`
	ShiftSalesPercentage    *float64  `json:"shift_sales_percentage"`
	ShiftSalesCommission    float64   `json:"shift_sales_commission"`
	PersonalSalesAmount     float64   `json:"personal_sales_amount"`
	PersonalSalesPercentage *float64  `json:"personal_sales_percentage"`
	PersonalSalesCommission float64   `json:"personal_sales_commission"`
	TotalSalary             float64   `json:"total_salary"`
	// Авансы полученные за период
	AdvancesGiven float64 `json:"advances_given"`
	// Уже выплачено зарплаты за выбранный период
	PaidSalary float64 `json:"paid_salary"`
	// Сумма к выплате после вычета авансов
	TotalToPayAfterAdvances float64 `json:"total_to_pay_after_advances"`
}

// SalaryReport представляет отчет по зарплатам за период
type SalaryReport struct {
	StartDate   time.Time     `json:"start_date"`
	EndDate     time.Time     `json:"end_date"`
	Entries     []SalaryEntry `json:"entries"`
	TotalSalary float64       `json:"total_salary"`
}

type SalaryUseCase struct {
	userRepo        repositories.UserRepository
	roleRepo        repositories.RoleRepository
	shiftRepo       repositories.ShiftRepository
	orderRepo       repositories.OrderRepository
	advanceRepo     repositories.AdvanceRepository
	paymentRepo     repositories.SalaryPaymentRepository
	transactionRepo repositories.TransactionRepository
	accountRepo     repositories.AccountRepository
}

func NewSalaryUseCase(
	userRepo repositories.UserRepository,
	roleRepo repositories.RoleRepository,
	shiftRepo repositories.ShiftRepository,
	orderRepo repositories.OrderRepository,
	advanceRepo repositories.AdvanceRepository,
	paymentRepo repositories.SalaryPaymentRepository,
	transactionRepo repositories.TransactionRepository,
	accountRepo repositories.AccountRepository,
) *SalaryUseCase {
	return &SalaryUseCase{
		userRepo:        userRepo,
		roleRepo:        roleRepo,
		shiftRepo:       shiftRepo,
		orderRepo:       orderRepo,
		advanceRepo:     advanceRepo,
		paymentRepo:     paymentRepo,
		transactionRepo: transactionRepo,
		accountRepo:     accountRepo,
	}
}

// GetSalaryReport генерирует отчет по зарплатам за указанный период
func (uc *SalaryUseCase) GetSalaryReport(ctx context.Context, establishmentID uuid.UUID, startDate, endDate time.Time) (*SalaryReport, error) {
	// Получаем всех сотрудников заведения
	users, err := uc.userRepo.GetAllByEstablishmentID(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to list users: %w", err)
	}
	fmt.Printf("DEBUG GetSalaryReport: Found %d users in establishment\n", len(users))

	// Получаем смены за период
	shifts, err := uc.shiftRepo.ListByFilter(ctx, &repositories.ShiftFilter{
		EstablishmentID: &establishmentID,
		StartDate:       &startDate,
		EndDate:         &endDate,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list shifts: %w", err)
	}
	fmt.Printf("DEBUG GetSalaryReport: Found %d shifts in period %v to %v\n", len(shifts), startDate, endDate)

	// Группируем смены по сотрудникам
	shiftsByUser := make(map[uuid.UUID][]*models.Shift)
	for _, shift := range shifts {
		shiftsByUser[shift.UserID] = append(shiftsByUser[shift.UserID], shift)
	}

	var entries []SalaryEntry
	var totalSalary float64

	// Для каждого сотрудника вычисляем зарплату
	for _, user := range users {
		fmt.Printf("DEBUG GetSalaryReport: Processing user %s (%s)\n", user.Name, user.ID)

		// Получаем роль сотрудника с настройками зарплаты
		role, err := uc.roleRepo.GetByID(ctx, user.RoleID)
		if err != nil {
			fmt.Printf("DEBUG GetSalaryReport: User %s - failed to get role: %v\n", user.Name, err)
			continue // Пропускаем сотрудников без роли
		}

		// Парсим permissions
		var permissions PositionPermissions
		if err := json.Unmarshal([]byte(role.Permissions), &permissions); err != nil {
			fmt.Printf("DEBUG GetSalaryReport: User %s - failed to parse permissions: %v\n", user.Name, err)
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
		fmt.Printf("DEBUG GetSalaryReport: User %s - has %d shifts\n", user.Name, len(userShifts))

		var totalHours float64
		var userOrders []*models.Order

		// Вычисляем часы и продажи
		for i, shift := range userShifts {
			shiftEndTime := shift.EndTime
			// Если смена не закрыта - используем текущее время (конец периода)
			if shiftEndTime == nil {
				shiftEndTime = &endDate
			}

			// Вычисляем часы
			duration := shiftEndTime.Sub(shift.StartTime)
			totalHours += duration.Hours()
			fmt.Printf("DEBUG GetSalaryReport: User %s - Shift %d: %v to %v = %.2f hours\n",
				user.Name, i+1, shift.StartTime, *shiftEndTime, duration.Hours())

			// Получаем заказы за смену по shift_id (обновленная схема)
			// или по фильтру времени + WaiterID для старых заказов
			var shiftOrders []*models.Order

			// Сначала пытаемся получить по shift_id
			ordersFromShiftID, err := uc.orderRepo.ListByShiftID(ctx, shift.ID, establishmentID)
			if err == nil && len(ordersFromShiftID) > 0 {
				shiftOrders = append(shiftOrders, ordersFromShiftID...)
				fmt.Printf("DEBUG GetSalaryReport: User %s - Shift %d: found %d orders by shift_id\n",
					user.Name, i+1, len(ordersFromShiftID))
			}

			// Если нет результатов по shift_id, ищем по времени + WaiterID (для старых заказов)
			if len(shiftOrders) == 0 {
				allOrders, err := uc.orderRepo.ListByEstablishmentIDAndDateRange(
					ctx, establishmentID, shift.StartTime, *shiftEndTime,
				)

				if err != nil {
					fmt.Printf("DEBUG GetSalaryReport: User %s - Shift %d: error getting orders: %v\n", user.Name, i+1, err)
				} else {
					// Фильтруем только заказы текущего сотрудника (если WaiterID совпадает)
					for _, order := range allOrders {
						if order.WaiterID != nil && *order.WaiterID == user.ID {
							shiftOrders = append(shiftOrders, order)
						}
					}
					fmt.Printf("DEBUG GetSalaryReport: User %s - Shift %d: found %d orders by time+waiter (filtered from %d total)\n",
						user.Name, i+1, len(shiftOrders), len(allOrders))
				}
			}

			userOrders = append(userOrders, shiftOrders...)
		}

		// Fallback: если у сотрудника нет смен, но есть заказы с waiter_id за период,
		// учитываем их в отчёте (например, когда заказы были проведены без открытия смены).
		if len(userShifts) == 0 {
			allOrders, err := uc.orderRepo.ListByEstablishmentIDAndDateRange(ctx, establishmentID, startDate, endDate)
			if err != nil {
				fmt.Printf("DEBUG GetSalaryReport: User %s - no shifts fallback error getting orders: %v\n", user.Name, err)
			} else {
				for _, order := range allOrders {
					if order.WaiterID != nil && *order.WaiterID == user.ID {
						userOrders = append(userOrders, order)
					}
				}
				fmt.Printf("DEBUG GetSalaryReport: User %s - no shifts fallback found %d orders by waiter_id (filtered from %d total)\n",
					user.Name, len(userOrders), len(allOrders))
			}
		}

		// Обе суммы используют все заказы сотрудника за период
		// Различие используется в процентах (может быть разные проценты для каждого типа)
		salesAmount := calculateSalesByCategory(userOrders, nil)
		shiftSalesAmount := salesAmount
		personalSalesAmount := salesAmount

		fmt.Printf("DEBUG GetSalaryReport: User %s - TOTALS: %.2f hours, %.2f sales from %d orders\n",
			user.Name, totalHours, shiftSalesAmount, len(userOrders))

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
		shiftRules := normalizeSalaryRules(
			permissions.SalaryCalculation.ShiftSalesPercentage,
			permissions.SalaryCalculation.ShiftSalesPercentages,
		)
		for _, rule := range shiftRules {
			if rule.Percentage <= 0 {
				continue
			}
			percentage := rule.Percentage
			if entry.ShiftSalesPercentage == nil {
				entry.ShiftSalesPercentage = &percentage
			}
			categorySales := calculateSalesByCategory(userOrders, rule.CategoryID)
			commission := (categorySales * percentage) / 100
			entry.ShiftSalesCommission += commission
			entry.TotalSalary += commission
		}

		// Процент от личных продаж
		personalRules := normalizeSalaryRules(
			permissions.SalaryCalculation.PersonalSalesPercentage,
			permissions.SalaryCalculation.PersonalSalesPercentages,
		)
		for _, rule := range personalRules {
			if rule.Percentage <= 0 {
				continue
			}
			percentage := rule.Percentage
			if entry.PersonalSalesPercentage == nil {
				entry.PersonalSalesPercentage = &percentage
			}
			categorySales := calculateSalesByCategory(userOrders, rule.CategoryID)
			commission := (categorySales * percentage) / 100
			entry.PersonalSalesCommission += commission
			entry.TotalSalary += commission
		}

		// Получаем авансы за период
		advances, err := uc.advanceRepo.ListByUserIDAndDateRange(ctx, user.ID, startDate, endDate)
		if err == nil {
			for _, advance := range advances {
				entry.AdvancesGiven += advance.Amount
			}
		}

		// Получаем уже выплаченные суммы за выбранный период
		payments, err := uc.paymentRepo.ListByUserID(ctx, user.ID)
		if err == nil {
			for _, payment := range payments {
				if payment.PeriodStart.Before(startDate) || payment.PeriodEnd.After(endDate) {
					continue
				}
				entry.PaidSalary += payment.AmountPaid
			}
		}

		// Вычисляем сумму к выплате после вычета авансов и ранее выплаченных сумм
		entry.TotalToPayAfterAdvances = entry.TotalSalary - entry.AdvancesGiven - entry.PaidSalary
		if entry.TotalToPayAfterAdvances < 0 {
			entry.TotalToPayAfterAdvances = 0
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

// PaySalaryRequest представляет запрос на выплату зарплаты
type PaySalaryRequest struct {
	UserID      uuid.UUID  `json:"user_id"`
	AccountID   uuid.UUID  `json:"account_id"`
	PeriodStart time.Time  `json:"period_start"`
	PeriodEnd   time.Time  `json:"period_end"`
	Notes       *string    `json:"notes,omitempty"`
	PaidBy      *uuid.UUID `json:"paid_by,omitempty"`
}

// PaySalary выплачивает зарплату сотруднику за период
func (uc *SalaryUseCase) PaySalary(ctx context.Context, establishmentID uuid.UUID, req *PaySalaryRequest) (*models.SalaryPayment, error) {
	// 1. Проверяем, не была ли уже выплачена зарплата за этот период
	alreadyPaid, err := uc.paymentRepo.CheckIfPaid(ctx, req.UserID, req.PeriodStart, req.PeriodEnd)
	if err != nil {
		return nil, fmt.Errorf("failed to check if salary already paid: %w", err)
	}
	if alreadyPaid {
		return nil, repositories.ErrSalaryAlreadyPaid
	}

	// 2. Проверяем что счёт принадлежит заведению
	account, err := uc.accountRepo.GetByID(ctx, req.AccountID, &establishmentID)
	if err != nil || account == nil {
		return nil, fmt.Errorf("account not found or access denied")
	}

	// 3. Получаем данные о зарплате сотрудника за период
	report, err := uc.GetSalaryReport(ctx, establishmentID, req.PeriodStart, req.PeriodEnd)
	if err != nil {
		return nil, fmt.Errorf("failed to get salary report: %w", err)
	}

	// 4. Находим запись сотрудника в отчёте
	var entry *SalaryEntry
	for i := range report.Entries {
		if report.Entries[i].EmployeeID == req.UserID {
			entry = &report.Entries[i]
			break
		}
	}

	if entry == nil {
		return nil, fmt.Errorf("employee not found in salary report")
	}

	if entry.TotalToPayAfterAdvances <= 0 {
		return nil, fmt.Errorf("no salary amount available for payment in selected period")
	}

	// 5. Проверяем достаточность средств на счёте
	if account.Balance < entry.TotalToPayAfterAdvances {
		return nil, fmt.Errorf("insufficient balance on account")
	}

	// 6. Создаём расходную транзакцию
	transaction := &models.Transaction{
		EstablishmentID: establishmentID,
		AccountID:       req.AccountID,
		Type:            "expense",
		Category:        "salary",
		Amount:          entry.TotalToPayAfterAdvances,
		Description:     fmt.Sprintf("Выплата зарплаты: %s за период %s - %s", entry.EmployeeName, req.PeriodStart.Format("02.01.2006"), req.PeriodEnd.Format("02.01.2006")),
		TransactionDate: time.Now(),
	}

	if err := uc.transactionRepo.Create(ctx, transaction); err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	// 7. Помечаем авансы как применённые
	_, err = uc.advanceRepo.ListByUserIDAndDateRange(ctx, req.UserID, req.PeriodStart, req.PeriodEnd)
	if err == nil {
		// Используем существующий AdvanceUseCase метод через advanceRepo
		advances, err := uc.advanceRepo.ListByUserIDAndStatus(ctx, req.UserID, "pending")
		if err == nil {
			for _, advance := range advances {
				// Проверяем, что аванс выдан в нашем периоде
				if advance.GivenDate.After(req.PeriodStart) && advance.GivenDate.Before(req.PeriodEnd) || advance.GivenDate.Equal(req.PeriodStart) {
					advance.Status = "applied"
					advance.AppliedToSalaryPeriodStart = &req.PeriodStart
					advance.AppliedToSalaryPeriodEnd = &req.PeriodEnd
					if err := uc.advanceRepo.Update(ctx, advance); err != nil {
						// Логируем ошибку, но не прерываем процесс
						fmt.Printf("Warning: failed to update advance %s: %v\n", advance.ID, err)
					}
				}
			}
		}
	}

	// 8. Создаём запись о выплате
	payment := &models.SalaryPayment{
		EstablishmentID:  establishmentID,
		UserID:           req.UserID,
		PeriodStart:      req.PeriodStart,
		PeriodEnd:        req.PeriodEnd,
		TotalSalary:      entry.TotalSalary,
		AdvancesDeducted: entry.AdvancesGiven,
		AmountPaid:       entry.TotalToPayAfterAdvances,
		AccountID:        req.AccountID,
		TransactionID:    &transaction.ID,
		PaymentDate:      time.Now(),
		PaidBy:           req.PaidBy,
		Notes:            req.Notes,
	}

	if err := uc.paymentRepo.Create(ctx, payment); err != nil {
		return nil, fmt.Errorf("failed to create salary payment record: %w", err)
	}

	return payment, nil
}
