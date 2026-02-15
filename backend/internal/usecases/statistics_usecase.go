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

	for _, order := range orders {
		// Считаем только оплаченные заказы
		if order.Status == "paid" {
			totalRevenue += order.TotalAmount
			stats.TotalOrders++
		}
		// Считаем количество гостей (берем максимальный номер гостя из всех заказов)
		for _, item := range order.Items {
			if item.GuestNumber != nil {
				if *item.GuestNumber > totalGuests {
					totalGuests = *item.GuestNumber
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

	return stats, nil
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

	// Создаем мапу для отслеживания новых и постоянных клиентов
	clientOrderCount := make(map[uuid.UUID]int)
	newClientsSet := make(map[uuid.UUID]bool)

	// Считаем количество заказов на клиента
	for _, order := range orders {
		if order.ClientID != nil {
			clientOrderCount[*order.ClientID]++

			// Если клиент создан в периоде - новый
			for _, client := range clients {
				if client.ID == *order.ClientID {
					if (client.CreatedAt.After(startDate) || client.CreatedAt.Equal(startDate)) &&
						client.CreatedAt.Before(endDate) {
						newClientsSet[*order.ClientID] = true
					}
					break
				}
			}
		}
	}

	stats.NewCustomers = len(newClientsSet)

	// Постоянные клиенты (более 5 заказов)
	for _, count := range clientOrderCount {
		if count >= 5 {
			stats.ReturningCustomers++
		}
	}

	// VIP клиенты (более 20 заказов)
	for _, count := range clientOrderCount {
		if count >= 20 {
			stats.VipCustomers++
		}
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

	stats := &models.EmployeeStatistics{
		TotalEmployees: len(users),
	}

	// Получаем заказы для расчета эффективности
	orders, err := uc.orderRepo.ListByEstablishmentIDAndDateRange(ctx, establishmentID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}

	// Топ сотрудники по количеству заказов
	employeeOrders := make(map[string]int)
	for _, order := range orders {
		if order.WaiterID != nil {
			employeeOrders[order.WaiterID.String()]++
		}
	}

	// Преобразуем в топ-10
	for empID, count := range employeeOrders {
		for _, user := range users {
			if user.ID.String() == empID {
				stats.TopEmployees = append(stats.TopEmployees, models.EmployeePerformanceData{
					EmployeeID:    empID,
					EmployeeName:  user.Name,
					OrdersHandled: count,
				})
				break
			}
		}
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
