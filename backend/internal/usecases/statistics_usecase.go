package usecases

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/models"
	"github.com/yourusername/arc/backend/internal/repositories"
)

type StatisticsUseCase struct {
	orderRepo      repositories.OrderRepository
	productRepo     repositories.ProductRepository
	categoryRepo    repositories.CategoryRepository
	clientRepo      repositories.ClientRepository
	userRepo        repositories.UserRepository
	workshopRepo    repositories.WorkshopRepository
	tableRepo       repositories.TableRepository
	shiftRepo       repositories.ShiftRepository
	logger          *zap.Logger
}

func NewStatisticsUseCase(
	orderRepo repositories.OrderRepository,
	productRepo repositories.ProductRepository,
	categoryRepo repositories.CategoryRepository,
	clientRepo repositories.ClientRepository,
	userRepo repositories.UserRepository,
	workshopRepo repositories.WorkshopRepository,
	tableRepo repositories.TableRepository,
	shiftRepo repositories.ShiftRepository,
	logger *zap.Logger,
) *StatisticsUseCase {
	return &StatisticsUseCase{
		orderRepo:     orderRepo,
		productRepo:    productRepo,
		categoryRepo:   categoryRepo,
		clientRepo:     clientRepo,
		userRepo:       userRepo,
		workshopRepo:   workshopRepo,
		tableRepo:      tableRepo,
		shiftRepo:      shiftRepo,
		logger:         logger,
	}
}

// GetSalesStatistics возвращает статистику продаж
func (uc *StatisticsUseCase) GetSalesStatistics(ctx context.Context, establishmentID uuid.UUID, startDate, endDate time.Time) (*models.SalesStatistics, error) {
	// Получаем заказы за период
	orders, err := uc.orderRepo.ListByEstablishmentIDAndDateRange(ctx, establishmentID, startDate, endDate)
	if err != nil {
		uc.logger.Error("Failed to get orders for sales statistics",
			zap.String("establishment_id", establishmentID.String()),
			zap.String("start_date", startDate.Format(time.RFC3339)),
			zap.String("end_date", endDate.Format(time.RFC3339)),
			zap.Error(err))
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}

	uc.logger.Info("Retrieved orders for sales statistics",
		zap.String("establishment_id", establishmentID.String()),
		zap.Int("order_count", len(orders)))

	stats := &models.SalesStatistics{}

	// Считаем общие метрики - только оплаченные заказы
	var totalRevenue float64
	var totalGuests int

	// Для расчета по категориям
	categoryRevenueMap := make(map[string]*CategoryRevenueData)
	categoryOrdersMap := make(map[string]int)

	// Для расчета по методам оплаты
	paymentStats := &PaymentStats{}

	for _, order := range orders {
		// Считаем только оплаченные заказы
		if order.Status == "paid" {
			totalRevenue += order.TotalAmount
			stats.TotalOrders++

			// Собираем статистику по методам оплаты
			paymentStats.CardAmount += order.CardAmount
			paymentStats.CashAmount += order.CashAmount
		}

		// Считаем количество гостей (берем максимальный номер гостя из всех заказов)
		for _, item := range order.Items {
			if item.GuestNumber != nil {
				if *item.GuestNumber > totalGuests {
					totalGuests = *item.GuestNumber
				}
			}

			// Собираем статистику по категориям
			if item.Product != nil {
				categoryID := item.Product.CategoryID.String()
				if categoryRevenueMap[categoryID] == nil {
					categoryRevenueMap[categoryID] = &CategoryRevenueData{
						CategoryID:   categoryID,
						CategoryName: item.Product.Category.Name,
					}
				}
				categoryRevenueMap[categoryID].Revenue += item.TotalPrice
				if order.Status == "paid" {
					categoryOrdersMap[categoryID]++
				}
			}
		}
	}

	stats.TotalRevenue = totalRevenue
	stats.TotalGuests = totalGuests

	if stats.TotalOrders > 0 {
		stats.AverageOrder = totalRevenue / float64(stats.TotalOrders)
	}

	// Группируем по дням
	dailyMap := make(map[string]*models.DailySalesData)
	for _, order := range orders {
		if order.Status != "paid" {
			continue
		}

		dateKey := order.CreatedAt.Format("2006-01-02")
		if dailyMap[dateKey] == nil {
			dailyMap[dateKey] = &models.DailySalesData{
				Date: dateKey,
			}
		}
		dailyMap[dateKey].Revenue += order.TotalAmount
		dailyMap[dateKey].Orders++
	}

	// Преобразуем мапу в слайс
	for _, data := range dailyMap {
		stats.DailyData = append(stats.DailyData, *data)
	}

	// Формируем данные по категориям
	totalRevenueForPercent := totalRevenue
	if totalRevenueForPercent > 0 {
		for _, catData := range categoryRevenueMap {
			percentage := (catData.Revenue / totalRevenueForPercent) * 100
			stats.RevenueByCategory = append(stats.RevenueByCategory, models.CategoryRevenueData{
				CategoryID:   catData.CategoryID,
				CategoryName: catData.CategoryName,
				Revenue:      catData.Revenue,
				OrdersCount:  categoryOrdersMap[catData.CategoryID],
				Percentage:   percentage,
			})
		}
	}

	// Формируем данные по методам оплаты
	if paymentStats.CardAmount > 0 || paymentStats.CashAmount > 0 {
		stats.RevenueByPaymentMethod = &models.PaymentMethodStats{
			Card:   paymentStats.CardAmount,
			Cash:   paymentStats.CashAmount,
			Online: 0, // TODO: добавить когда будет электронная оплата
		}
	}

	return stats, nil
}

// CategoryRevenueData временная структура для расчета
type CategoryRevenueData struct {
	CategoryID   string
	CategoryName string
	Revenue      float64
}

// PaymentStats временная структура для расчета
type PaymentStats struct {
	CardAmount float64
	CashAmount float64
}

// GetCustomerStatistics возвращает статистику клиентов
func (uc *StatisticsUseCase) GetCustomerStatistics(ctx context.Context, establishmentID uuid.UUID, startDate, endDate time.Time) (*models.CustomerStatistics, error) {
	// Получаем всех клиентов
	clients, err := uc.clientRepo.GetAllByEstablishmentID(ctx, establishmentID)
	if err != nil {
		uc.logger.Error("Failed to get clients for statistics", zap.Error(err))
		return nil, fmt.Errorf("failed to get clients: %w", err)
	}

	// Получаем заказы за период
	orders, err := uc.orderRepo.ListByEstablishmentIDAndDateRange(ctx, establishmentID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}

	stats := &models.CustomerStatistics{
		TotalCustomers: len(clients),
	}

	// Создаем мапы для отслеживания статистики по клиентам
	clientOrderCount := make(map[uuid.UUID]int)
	clientRevenue := make(map[uuid.UUID]float64)
	clientLastVisit := make(map[uuid.UUID]time.Time)
	newClientsSet := make(map[uuid.UUID]bool)
	dailyNewClients := make(map[string]int)

	// Считаем количество заказов на клиента
	for _, order := range orders {
		if order.ClientID != nil {
			clientOrderCount[*order.ClientID]++

			// Считаем выручку
			if order.Status == "paid" {
				clientRevenue[*order.ClientID] += order.TotalAmount
			}

			// Запоминаем последний визит
			if order.CreatedAt.After(clientLastVisit[*order.ClientID]) {
				clientLastVisit[*order.ClientID] = order.CreatedAt
			}

			// Если клиент создан в периоде - новый
			for _, client := range clients {
				if client.ID == *order.ClientID {
					if (client.CreatedAt.After(startDate) || client.CreatedAt.Equal(startDate)) &&
						client.CreatedAt.Before(endDate) {
						newClientsSet[*order.ClientID] = true
						dateKey := client.CreatedAt.Format("2006-01-02")
						dailyNewClients[dateKey]++
					}
					break
				}
			}
		}
	}

	stats.NewCustomers = len(newClientsSet)

	// Постоянные клиенты (более 5 заказов)
	returningSet := make(map[uuid.UUID]bool)
	for clientID, count := range clientOrderCount {
		if count >= 5 {
			stats.ReturningCustomers++
			returningSet[clientID] = true
		}
	}

	// VIP клиенты (более 20 заказов)
	for _, count := range clientOrderCount {
		if count >= 20 {
			stats.VipCustomers++
		}
	}

	// Группируем по дням для новых и постоянных клиентов
	dailyMap := make(map[string]*models.DailyCustomerData)
	for _, order := range orders {
		if order.ClientID == nil {
			continue
		}

		dateKey := order.CreatedAt.Format("2006-01-02")
		if dailyMap[dateKey] == nil {
			dailyMap[dateKey] = &models.DailyCustomerData{
				Date: dateKey,
			}
		}

		// Проверяем, является ли клиент постоянным
		if returningSet[*order.ClientID] {
			dailyMap[dateKey].ReturningCount++
		}
	}

	// Добавляем данные о новых клиентах
	for date, count := range dailyNewClients {
		if dailyMap[date] == nil {
			dailyMap[date] = &models.DailyCustomerData{
				Date:           date,
				NewCustomers:   count,
				ReturningCount: 0,
			}
		} else {
			dailyMap[date].NewCustomers = count
		}
	}

	// Преобразуем мапу в слайс
	for _, data := range dailyMap {
		stats.DailyData = append(stats.DailyData, *data)
	}

	// Топ-10 клиентов по выручке
	type ClientRevenue struct {
		ClientID uuid.UUID
		Revenue  float64
		Orders   int
	}
	var sortedClients []ClientRevenue
	for clientID := range clientRevenue {
		sortedClients = append(sortedClients, ClientRevenue{
			ClientID: clientID,
			Revenue:  clientRevenue[clientID],
			Orders:   clientOrderCount[clientID],
		})
	}

	// Сортировка по выручке (пузырьком для простоты)
	for i := 0; i < len(sortedClients); i++ {
		for j := i + 1; j < len(sortedClients); j++ {
			if sortedClients[j].Revenue > sortedClients[i].Revenue {
				sortedClients[i], sortedClients[j] = sortedClients[j], sortedClients[i]
			}
		}
	}

	// Берем топ-10
	maxClients := 10
	if len(sortedClients) < maxClients {
		maxClients = len(sortedClients)
	}

	for i := 0; i < maxClients; i++ {
		customerID := sortedClients[i].ClientID
		var customerName string
		for _, client := range clients {
			if client.ID == customerID {
				customerName = client.Name
				break
			}
		}

		avgCheck := 0.0
		if clientOrderCount[customerID] > 0 {
			avgCheck = clientRevenue[customerID] / float64(clientOrderCount[customerID])
		}

		stats.TopCustomers = append(stats.TopCustomers, models.CustomerPerformanceData{
			CustomerID:   customerID.String(),
			CustomerName: customerName,
			TotalOrders:  clientOrderCount[customerID],
			TotalRevenue: clientRevenue[customerID],
			AverageCheck: avgCheck,
			LastVisit:    clientLastVisit[customerID].Format("2006-01-02"),
		})
	}

	return stats, nil
}

// GetEmployeeStatistics возвращает статистику сотрудников
func (uc *StatisticsUseCase) GetEmployeeStatistics(ctx context.Context, establishmentID uuid.UUID, startDate, endDate time.Time) (*models.EmployeeStatistics, error) {
	// Получаем всех сотрудников
	users, err := uc.userRepo.GetAllByEstablishmentID(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get users: %w", err)
	}

	// Получаем заказы для расчета эффективности
	orders, err := uc.orderRepo.ListByEstablishmentIDAndDateRange(ctx, establishmentID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}

	// Получаем смены для расчета отработанных часов
	shifts, err := uc.shiftRepo.ListByFilter(ctx, &repositories.ShiftFilter{
		EstablishmentID: &establishmentID,
		StartDate:       &startDate,
		EndDate:         &endDate,
	})
	if err != nil {
		uc.logger.Warn("Failed to get shifts for hours calculation", zap.Error(err))
		// Продолжаем без данных о сменах
		shifts = nil
	}

	stats := &models.EmployeeStatistics{
		TotalEmployees: len(users),
	}

	// Вычисляем общее количество отработанных часов
	var totalHoursWorked float64
	if shifts != nil {
		for _, shift := range shifts {
			if shift.EndTime != nil {
				duration := shift.EndTime.Sub(shift.StartTime)
				totalHoursWorked += duration.Hours()
			}
		}
	}
	stats.TotalHoursWorked = totalHoursWorked

	// TODO: Добавить расчет зарплаты когда будет поле hourly_rate
	stats.TotalSalaryPaid = 0

	// Статистика по сотрудникам
	employeeOrders := make(map[uuid.UUID]int)
	employeeRevenue := make(map[uuid.UUID]float64)
	employeeHours := make(map[uuid.UUID]float64)
	activeEmployeesSet := make(map[string]bool)

	// Группируем часы по сотрудникам
	if shifts != nil {
		for _, shift := range shifts {
			if shift.EndTime != nil {
				duration := shift.EndTime.Sub(shift.StartTime)
				employeeHours[shift.UserID] += duration.Hours()
			}
		}
	}

	// Группируем по дням - сначала создаем структуру для всех дней в периоде
	dailyMap := make(map[string]*models.DailyEmployeeData)

	// Заполняем данные по дням из заказов
	for _, order := range orders {
		// Считаем только оплаченные заказы
		if order.Status != "paid" {
			continue
		}

		if order.WaiterID != nil {
			employeeOrders[*order.WaiterID]++
			employeeRevenue[*order.WaiterID] += order.TotalAmount
			activeEmployeesSet[order.WaiterID.String()] = true

			// Группируем по дням
			dateKey := order.CreatedAt.Format("2006-01-02")
			if dailyMap[dateKey] == nil {
				dailyMap[dateKey] = &models.DailyEmployeeData{
					Date: dateKey,
				}
			}
			dailyMap[dateKey].OrdersHandled++
			dailyMap[dateKey].Revenue += order.TotalAmount
		}
	}

	// Количество активных сотрудников каждый день
	for date, data := range dailyMap {
		dateActiveEmployees := make(map[string]bool)
		for _, order := range orders {
			if order.Status != "paid" || order.WaiterID == nil {
				continue
			}
			orderDateKey := order.CreatedAt.Format("2006-01-02")
			if orderDateKey == date {
				dateActiveEmployees[order.WaiterID.String()] = true
			}
		}
		data.ActiveEmployees = len(dateActiveEmployees)
	}

	// Преобразуем мапу в слайс и сортируем по дате
	var dailySlice []models.DailyEmployeeData
	for _, data := range dailyMap {
		dailySlice = append(dailySlice, *data)
	}
	// Сортировка по дате
	for i := 0; i < len(dailySlice); i++ {
		for j := i + 1; j < len(dailySlice); j++ {
			if dailySlice[j].Date < dailySlice[i].Date {
				dailySlice[i], dailySlice[j] = dailySlice[j], dailySlice[i]
			}
		}
	}
	stats.DailyData = dailySlice

	stats.ActiveOnShift = len(activeEmployeesSet)

	// Сортировка сотрудников по выручке
	type EmployeeRevenue struct {
		EmployeeID uuid.UUID
		Revenue    float64
		Orders     int
	}
	var sortedEmployees []EmployeeRevenue
	for employeeID := range employeeRevenue {
		sortedEmployees = append(sortedEmployees, EmployeeRevenue{
			EmployeeID: employeeID,
			Revenue:    employeeRevenue[employeeID],
			Orders:     employeeOrders[employeeID],
		})
	}

	// Сортировка по выручке
	for i := 0; i < len(sortedEmployees); i++ {
		for j := i + 1; j < len(sortedEmployees); j++ {
			if sortedEmployees[j].Revenue > sortedEmployees[i].Revenue {
				sortedEmployees[i], sortedEmployees[j] = sortedEmployees[j], sortedEmployees[i]
			}
		}
	}

	// Берем топ-10
	maxEmployees := 10
	if len(sortedEmployees) < maxEmployees {
		maxEmployees = len(sortedEmployees)
	}

	for i := 0; i < maxEmployees; i++ {
		employeeID := sortedEmployees[i].EmployeeID
		var employeeName string
		for _, user := range users {
			if user.ID == employeeID {
				employeeName = user.Name
				break
			}
		}

		avgCheck := 0.0
		if employeeOrders[employeeID] > 0 {
			avgCheck = employeeRevenue[employeeID] / float64(employeeOrders[employeeID])
		}

		hoursWorked := employeeHours[employeeID]

		stats.TopEmployees = append(stats.TopEmployees, models.EmployeePerformanceData{
			EmployeeID:    employeeID.String(),
			EmployeeName:  employeeName,
			OrdersHandled: employeeOrders[employeeID],
			Revenue:       employeeRevenue[employeeID],
			HoursWorked:   hoursWorked,
			AverageCheck:  avgCheck,
		})
	}

	return stats, nil
}

// GetWorkshopStatistics возвращает статистику цехов
func (uc *StatisticsUseCase) GetWorkshopStatistics(ctx context.Context, establishmentID uuid.UUID, startDate, endDate time.Time) (*models.WorkshopStatistics, error) {
	workshops, err := uc.workshopRepo.ListWorkshops(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get workshops: %w", err)
	}

	stats := &models.WorkshopStatistics{
		TotalWorkshops: len(workshops),
	}

	for _, workshop := range workshops {
		stats.WorkshopData = append(stats.WorkshopData, models.WorkshopData{
			WorkshopID:   workshop.ID.String(),
			WorkshopName: workshop.Name,
		})
	}

	return stats, nil
}

// GetTableStatistics возвращает статистику столов
func (uc *StatisticsUseCase) GetTableStatistics(ctx context.Context, establishmentID uuid.UUID, startDate, endDate time.Time) (*models.TableStatistics, error) {
	// Получаем активные заказы
	activeOrders, err := uc.orderRepo.ListActiveByEstablishmentID(ctx, establishmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get active orders: %w", err)
	}

	// Получаем заказы за период для статистики по столам
	orders, err := uc.orderRepo.ListByEstablishmentIDAndDateRange(ctx, establishmentID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}

	stats := &models.TableStatistics{
		OccupiedTables: len(activeOrders),
	}

	// Группируем по столам и считаем общее количество
	tableSet := make(map[int]bool)
	for _, order := range orders {
		if order.TableNumber != nil {
			tableSet[*order.TableNumber] = true
		}
	}
	stats.TotalTables = len(tableSet)

	stats.AvailableTables = stats.TotalTables - stats.OccupiedTables

	if stats.TotalTables > 0 {
		stats.OccupancyRate = float64(stats.OccupiedTables) / float64(stats.TotalTables) * 100
	}

	// Группируем выручку по столам
	tableStats := make(map[int]*models.TableData)
	for _, order := range orders {
		if order.TableID != nil && order.TableNumber != nil {
			if tableStats[*order.TableNumber] == nil {
				tableStats[*order.TableNumber] = &models.TableData{
					TableID:     order.TableID.String(),
					TableNumber:  *order.TableNumber,
				}
			}
			tableStats[*order.TableNumber].OrdersCount++
			tableStats[*order.TableNumber].Revenue += order.TotalAmount
		}
	}

	// Вычисляем средний чек
	for _, data := range tableStats {
		if data.OrdersCount > 0 {
			data.AverageCheck = data.Revenue / float64(data.OrdersCount)
		}
		stats.TableData = append(stats.TableData, *data)
	}

	return stats, nil
}

// GetCategoryStatistics возвращает статистику категорий
func (uc *StatisticsUseCase) GetCategoryStatistics(ctx context.Context, establishmentID uuid.UUID, startDate, endDate time.Time) (*models.CategoryStatistics, error) {
	categories, err := uc.categoryRepo.List(ctx, &repositories.CategoryFilter{
		EstablishmentID: &establishmentID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get categories: %w", err)
	}

	products, err := uc.productRepo.List(ctx, &repositories.ProductFilter{
		EstablishmentID: &establishmentID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get products: %w", err)
	}

	stats := &models.CategoryStatistics{
		TotalCategories:     len(categories),
		ProductsInCategories: len(products),
	}

	// Получаем заказы за период
	orders, err := uc.orderRepo.ListByEstablishmentIDAndDateRange(ctx, establishmentID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}

	// Группируем выручку по категориям
	categoryRevenue := make(map[uuid.UUID]float64)
	maxRevenue := 0.0
	var topCategoryUUID uuid.UUID

	for _, order := range orders {
		for _, item := range order.Items {
			if item.Product != nil {
				categoryRevenue[item.Product.CategoryID] += item.TotalPrice
				if categoryRevenue[item.Product.CategoryID] > maxRevenue {
					maxRevenue = categoryRevenue[item.Product.CategoryID]
					topCategoryUUID = item.Product.CategoryID
				}
			}
		}
	}

	// Находим название топ категории
	for _, category := range categories {
		stats.CategoryRevenue += categoryRevenue[category.ID]
		if category.ID == topCategoryUUID {
			stats.TopCategory = category.Name
		}

		stats.CategoryData = append(stats.CategoryData, models.CategoryData{
			CategoryID:   category.ID.String(),
			CategoryName: category.Name,
			Revenue:      categoryRevenue[category.ID],
		})
	}

	return stats, nil
}

// GetProductStatistics возвращает статистику товаров
func (uc *StatisticsUseCase) GetProductStatistics(ctx context.Context, establishmentID uuid.UUID, startDate, endDate time.Time) (*models.ProductStatistics, error) {
	products, err := uc.productRepo.List(ctx, &repositories.ProductFilter{
		EstablishmentID: &establishmentID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get products: %w", err)
	}

	stats := &models.ProductStatistics{
		TotalProducts: len(products),
	}

	// Получаем заказы за период
	orders, err := uc.orderRepo.ListByEstablishmentIDAndDateRange(ctx, establishmentID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}

	// Группируем продажи по товарам
	productStats := make(map[uuid.UUID]*models.ProductData)
	maxRevenue := 0.0
	var topProductUUID uuid.UUID

	for _, order := range orders {
		for _, item := range order.Items {
			if item.ProductID != nil {
				if productStats[*item.ProductID] == nil {
					productStats[*item.ProductID] = &models.ProductData{
						ProductID: item.ProductID.String(),
					}
				}
				productStats[*item.ProductID].QuantitySold += item.Quantity
				productStats[*item.ProductID].Revenue += item.TotalPrice
				productStats[*item.ProductID].OrdersCount++

				if productStats[*item.ProductID].Revenue > maxRevenue {
					maxRevenue = productStats[*item.ProductID].Revenue
					topProductUUID = *item.ProductID
				}
			}
		}
	}

	// Заполняем данными
	for _, product := range products {
		if data, exists := productStats[product.ID]; exists {
			stats.ProductsSold += data.QuantitySold
			stats.TotalRevenue += data.Revenue
		}

		if product.ID == topProductUUID {
			stats.TopProduct = product.Name
		}
	}

	// Преобразуем мапу в слайс
	for _, data := range productStats {
		// Находим название товара
		for _, product := range products {
			if product.ID.String() == data.ProductID {
				data.ProductName = product.Name
				break
			}
		}
		stats.ProductData = append(stats.ProductData, *data)
	}

	return stats, nil
}

// GetABCAnalysis выполняет ABC анализ товаров
func (uc *StatisticsUseCase) GetABCAnalysis(ctx context.Context, establishmentID uuid.UUID, startDate, endDate time.Time) (*models.ABCAnalysisData, error) {
	// Получаем товары
	products, err := uc.productRepo.List(ctx, &repositories.ProductFilter{
		EstablishmentID: &establishmentID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get products: %w", err)
	}

	// Получаем заказы за период
	orders, err := uc.orderRepo.ListByEstablishmentIDAndDateRange(ctx, establishmentID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}

	stats := &models.ABCAnalysisData{
		TotalProducts: len(products),
	}

	// Группируем выручку по товарам
	productRevenue := make(map[uuid.UUID]float64)
	for _, order := range orders {
		for _, item := range order.Items {
			if item.ProductID != nil {
				productRevenue[*item.ProductID] += item.TotalPrice
			}
		}
	}

	// Сортируем товары по выручке
	type ProductRevenue struct {
		ProductID uuid.UUID
		Revenue   float64
	}
	var sortedProducts []ProductRevenue
	for productID, revenue := range productRevenue {
		sortedProducts = append(sortedProducts, ProductRevenue{
			ProductID: productID,
			Revenue:   revenue,
		})
	}

	// Сортировка по убыванию выручки (пузырьком для простоты)
	for i := 0; i < len(sortedProducts); i++ {
		for j := i + 1; j < len(sortedProducts); j++ {
			if sortedProducts[j].Revenue > sortedProducts[i].Revenue {
				sortedProducts[i], sortedProducts[j] = sortedProducts[j], sortedProducts[i]
			}
		}
	}

	// Вычисляем общую выручку
	var totalRevenue float64
	for _, pr := range sortedProducts {
		totalRevenue += pr.Revenue
	}

	// Распределяем по группам A (80%), B (15%), C (5%)
	var currentRevenue float64
	aThreshold := totalRevenue * 0.8
	bThreshold := totalRevenue * 0.95

	for _, pr := range sortedProducts {
		currentRevenue += pr.Revenue
		group := "C"
		if currentRevenue <= aThreshold {
			group = "A"
			stats.GroupAProducts++
			stats.GroupARevenue += pr.Revenue
		} else if currentRevenue <= bThreshold {
			group = "B"
			stats.GroupBProducts++
			stats.GroupBRevenue += pr.Revenue
		} else {
			stats.GroupCProducts++
			stats.GroupCRevenue += pr.Revenue
		}

		// Находим название товара
		var productName string
		for _, product := range products {
			if product.ID == pr.ProductID {
				productName = product.Name
				break
			}
		}

		contribution := (pr.Revenue / totalRevenue) * 100

		stats.Products = append(stats.Products, models.ABCProductData{
			ProductID:    pr.ProductID.String(),
			ProductName:  productName,
			Revenue:      pr.Revenue,
			Contribution: contribution,
			Group:        group,
		})
	}

	return stats, nil
}

// GetCheckStatistics возвращает статистику чеков
func (uc *StatisticsUseCase) GetCheckStatistics(ctx context.Context, establishmentID uuid.UUID, startDate, endDate time.Time) (*models.CheckStatistics, error) {
	orders, err := uc.orderRepo.ListByEstablishmentIDAndDateRange(ctx, establishmentID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}

	stats := &models.CheckStatistics{
		TotalChecks: len(orders),
	}

	var totalAmount float64
	var totalItems int

	for _, order := range orders {
		if order.Status == "paid" || order.Status == "completed" {
			totalAmount += order.TotalAmount
			totalItems += len(order.Items)
		}
	}

	stats.TotalAmount = totalAmount

	if stats.TotalChecks > 0 {
		stats.AverageCheck = totalAmount / float64(stats.TotalChecks)
		stats.AverageItems = totalItems / stats.TotalChecks
	}

	// Группируем по дням
	dailyMap := make(map[string]*models.DailyCheckData)
	for _, order := range orders {
		if order.Status != "paid" && order.Status != "completed" {
			continue
		}

		dateKey := order.CreatedAt.Format("2006-01-02")
		if dailyMap[dateKey] == nil {
			dailyMap[dateKey] = &models.DailyCheckData{
				Date: dateKey,
			}
		}
		dailyMap[dateKey].CheckCount++
		dailyMap[dateKey].TotalAmount += order.TotalAmount
	}

	for _, data := range dailyMap {
		if data.CheckCount > 0 {
			data.AverageCheck = data.TotalAmount / float64(data.CheckCount)
		}
		stats.DailyData = append(stats.DailyData, *data)
	}

	return stats, nil
}

// GetReviewStatistics возвращает статистику отзывов
func (uc *StatisticsUseCase) GetReviewStatistics(ctx context.Context, establishmentID uuid.UUID, startDate, endDate time.Time) (*models.ReviewStatistics, error) {
	// TODO: Реализовать после добавления модели отзывов
	// Сейчас возвращаем заглушку

	stats := &models.ReviewStatistics{
		AverageRating:   0.0,
		TotalReviews:    0,
		PositiveReviews: 0,
		NegativeReviews: 0,
	}

	return stats, nil
}

// GetPaymentStatistics возвращает статистику оплат
func (uc *StatisticsUseCase) GetPaymentStatistics(ctx context.Context, establishmentID uuid.UUID, startDate, endDate time.Time) (*models.PaymentStatistics, error) {
	orders, err := uc.orderRepo.ListByEstablishmentIDAndDateRange(ctx, establishmentID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}

	stats := &models.PaymentStatistics{}

	for _, order := range orders {
		if order.Status == "paid" || order.Status == "completed" {
			stats.CardPayments += order.CardAmount
			stats.CashPayments += order.CashAmount
		}
	}

	stats.ElectronicPayments = 0 // TODO: Добавить поле для электронных платежей
	stats.TotalPayments = stats.CardPayments + stats.CashPayments + stats.ElectronicPayments

	total := stats.TotalPayments
	if total > 0 {
		stats.PaymentDistribution = []models.PaymentData{
			{
				PaymentType: "card",
				Amount:      stats.CardPayments,
				Count:       0, // TODO: Подсчитать количество
				Percent:     (stats.CardPayments / total) * 100,
			},
			{
				PaymentType: "cash",
				Amount:      stats.CashPayments,
				Count:       0, // TODO: Подсчитать количество
				Percent:     (stats.CashPayments / total) * 100,
			},
			{
				PaymentType: "electronic",
				Amount:      stats.ElectronicPayments,
				Count:       0,
				Percent:     (stats.ElectronicPayments / total) * 100,
			},
		}
	}

	return stats, nil
}

// GetTaxStatistics возвращает статистику налогов
func (uc *StatisticsUseCase) GetTaxStatistics(ctx context.Context, establishmentID uuid.UUID, startDate, endDate time.Time) (*models.TaxStatistics, error) {
	orders, err := uc.orderRepo.ListByEstablishmentIDAndDateRange(ctx, establishmentID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}

	stats := &models.TaxStatistics{
		FiscalChecksCount: len(orders),
	}

	var totalRevenue float64
	for _, order := range orders {
		if order.Status == "paid" || order.Status == "completed" {
			totalRevenue += order.TotalAmount
		}
	}

	// TODO: Получить реальные ставки НДС из настроек
	// Сейчас используем стандартную ставку 20%
	vatRate := 0.20
	stats.VATAmount = totalRevenue * vatRate / (1 + vatRate)
	stats.SalesTaxAmount = 0 // TODO: Добавить налог с продаж
	stats.TaxableBase = totalRevenue - stats.VATAmount

	stats.TaxByRate = []models.TaxByRate{
		{
			TaxRate:   20.0,
			Amount:     stats.VATAmount,
			BaseAmount: stats.TaxableBase,
		},
	}

	return stats, nil
}
