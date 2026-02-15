package models

import (
	"time"
)

// SalesStatistics представляет статистику продаж
type SalesStatistics struct {
	TotalRevenue             float64                     `json:"total_revenue"`
	TotalOrders              int                         `json:"total_orders"`
	AverageOrder             float64                     `json:"average_order"`
	TotalGuests              int                         `json:"total_guests"`
	DailyData                []DailySalesData            `json:"daily_data,omitempty"`
	RevenueByCategory        []CategoryRevenueData       `json:"revenue_by_category,omitempty"`
	RevenueByPaymentMethod   *PaymentMethodStats         `json:"revenue_by_payment_method,omitempty"`
}

// CategoryRevenueData представляет данные о выручке по категории
type CategoryRevenueData struct {
	CategoryID   string  `json:"category_id"`
	CategoryName string  `json:"category_name"`
	Revenue      float64 `json:"revenue"`
	OrdersCount  int     `json:"orders_count"`
	Percentage   float64 `json:"percentage"`
}

// PaymentMethodStats представляет статистику по методам оплаты
type PaymentMethodStats struct {
	Cash  float64 `json:"cash"`
	Card  float64 `json:"card"`
	Online float64 `json:"online"`
}

// DailySalesData представляет данные продаж за день
type DailySalesData struct {
	Date     string  `json:"date"`
	Revenue  float64 `json:"revenue"`
	Orders   int     `json:"orders"`
	Guests   int     `json:"guests"`
}

// CustomerStatistics представляет статистику клиентов
type CustomerStatistics struct {
	TotalCustomers      int                    `json:"total_customers"`
	NewCustomers       int                    `json:"new_customers"`
	ReturningCustomers int                    `json:"returning_customers"`
	VipCustomers       int                    `json:"vip_customers"`
	DailyData          []DailyCustomerData    `json:"daily_data,omitempty"`
	TopCustomers       []CustomerPerformanceData `json:"top_customers,omitempty"`
}

// DailyCustomerData представляет данные клиентов за день
type DailyCustomerData struct {
	Date           string `json:"date"`
	NewCustomers   int    `json:"new_customers"`
	ReturningCount int    `json:"returning_count"`
}

// CustomerPerformanceData представляет данные эффективности клиента
type CustomerPerformanceData struct {
	CustomerID    string  `json:"customer_id"`
	CustomerName  string  `json:"customer_name"`
	TotalOrders   int     `json:"total_orders"`
	TotalRevenue  float64 `json:"total_revenue"`
	AverageCheck  float64 `json:"average_check"`
	LastVisit     string  `json:"last_visit"`
}

// EmployeeStatistics представляет статистику сотрудников
type EmployeeStatistics struct {
	TotalEmployees      int                     `json:"total_employees"`
	ActiveOnShift       int                     `json:"active_on_shift"`
	TotalHoursWorked    float64                  `json:"total_hours_worked"`
	TotalSalaryPaid     float64                  `json:"total_salary_paid"`
	TopEmployees        []EmployeePerformanceData `json:"top_employees,omitempty"`
}

// EmployeePerformanceData представляет данные эффективности сотрудника
type EmployeePerformanceData struct {
	EmployeeID    string  `json:"employee_id"`
	EmployeeName  string  `json:"employee_name"`
	OrdersHandled int     `json:"orders_handled"`
	Revenue       float64 `json:"revenue"`
	HoursWorked   float64 `json:"hours_worked"`
}

// WorkshopStatistics представляет статистику цехов
type WorkshopStatistics struct {
	TotalWorkshops      int                  `json:"total_workshops"`
	DishesProduced     int                  `json:"dishes_produced"`
	AveragePrepTime     float64              `json:"average_prep_time"`
	OrdersCompleted     int                  `json:"orders_completed"`
	WorkshopData        []WorkshopData       `json:"workshop_data,omitempty"`
}

// WorkshopData представляет данные по цеху
type WorkshopData struct {
	WorkshopID       string  `json:"workshop_id"`
	WorkshopName     string  `json:"workshop_name"`
	DishesProduced  int     `json:"dishes_produced"`
	OrdersCompleted  int     `json:"orders_completed"`
	AverageTime      float64 `json:"average_time"`
}

// TableStatistics представляет статистику столов
type TableStatistics struct {
	TotalTables      int             `json:"total_tables"`
	AvailableTables  int             `json:"available_tables"`
	OccupiedTables   int             `json:"occupied_tables"`
	OccupancyRate    float64         `json:"occupancy_rate"`
	TableData        []TableData     `json:"table_data,omitempty"`
}

// TableData представляет данные по столу
type TableData struct {
	TableID       string  `json:"table_id"`
	TableNumber   int     `json:"table_number"`
	OrdersCount   int     `json:"orders_count"`
	Revenue       float64 `json:"revenue"`
	AverageCheck   float64 `json:"average_check"`
}

// CategoryStatistics представляет статистику категорий
type CategoryStatistics struct {
	TotalCategories     int                   `json:"total_categories"`
	ProductsInCategories int                   `json:"products_in_categories"`
	CategoryRevenue     float64               `json:"category_revenue"`
	TopCategory         string                `json:"top_category"`
	CategoryData        []CategoryData        `json:"category_data,omitempty"`
}

// CategoryData представляет данные по категории
type CategoryData struct {
	CategoryID    string  `json:"category_id"`
	CategoryName  string  `json:"category_name"`
	ProductCount  int     `json:"product_count"`
	Revenue       float64 `json:"revenue"`
	OrdersCount   int     `json:"orders_count"`
}

// ProductStatistics представляет статистику товаров
type ProductStatistics struct {
	TotalProducts    int                  `json:"total_products"`
	ProductsSold     int                  `json:"products_sold"`
	TotalRevenue     float64              `json:"total_revenue"`
	TopProduct       string               `json:"top_product"`
	ProductData      []ProductData       `json:"product_data,omitempty"`
}

// ProductData представляет данные по товару
type ProductData struct {
	ProductID     string  `json:"product_id"`
	ProductName   string  `json:"product_name"`
	QuantitySold  int     `json:"quantity_sold"`
	Revenue       float64 `json:"revenue"`
	OrdersCount   int     `json:"orders_count"`
}

// ABCAnalysisData представляет данные ABC анализа
type ABCAnalysisData struct {
	GroupAProducts     int                 `json:"group_a_products"`
	GroupBProducts     int                 `json:"group_b_products"`
	GroupCProducts     int                 `json:"group_c_products"`
	TotalProducts      int                 `json:"total_products"`
	GroupARevenue      float64             `json:"group_a_revenue"`
	GroupBRevenue      float64             `json:"group_b_revenue"`
	GroupCRevenue      float64             `json:"group_c_revenue"`
	Products           []ABCProductData    `json:"products,omitempty"`
}

// ABCProductData представляет данные товара в ABC анализе
type ABCProductData struct {
	ProductID      string  `json:"product_id"`
	ProductName    string  `json:"product_name"`
	Revenue        float64 `json:"revenue"`
	Contribution   float64 `json:"contribution"` // Процент вклада в общую выручку
	Group          string  `json:"group"`     // A, B, или C
}

// CheckStatistics представляет статистику чеков
type CheckStatistics struct {
	TotalChecks      int                `json:"total_checks"`
	TotalAmount      float64            `json:"total_amount"`
	AverageCheck     float64            `json:"average_check"`
	AverageItems     int                `json:"average_items"`
	DailyData        []DailyCheckData   `json:"daily_data,omitempty"`
}

// DailyCheckData представляет данные чеков за день
type DailyCheckData struct {
	Date          string  `json:"date"`
	CheckCount     int     `json:"check_count"`
	TotalAmount    float64 `json:"total_amount"`
	AverageCheck   float64 `json:"average_check"`
}

// ReviewStatistics представляет статистику отзывов
type ReviewStatistics struct {
	AverageRating     float64            `json:"average_rating"`
	TotalReviews      int                `json:"total_reviews"`
	PositiveReviews   int                `json:"positive_reviews"`
	NegativeReviews   int                `json:"negative_reviews"`
	RatingDistribution []RatingDistribution `json:"rating_distribution,omitempty"`
}

// RatingDistribution представляет распределение оценок
type RatingDistribution struct {
	Rating  int     `json:"rating"`
	Count    int     `json:"count"`
	Percent  float64 `json:"percent"`
}

// PaymentStatistics представляет статистику оплат
type PaymentStatistics struct {
	CardPayments       float64            `json:"card_payments"`
	CashPayments       float64            `json:"cash_payments"`
	ElectronicPayments  float64            `json:"electronic_payments"`
	TotalPayments      float64            `json:"total_payments"`
	PaymentDistribution []PaymentData     `json:"payment_distribution,omitempty"`
}

// PaymentData представляет данные по способу оплаты
type PaymentData struct {
	PaymentType string  `json:"payment_type"` // card, cash, electronic
	Amount      float64 `json:"amount"`
	Count       int     `json:"count"`
	Percent     float64 `json:"percent"`
}

// TaxStatistics представляет статистику налогов
type TaxStatistics struct {
	VATAmount           float64         `json:"vat_amount"`
	SalesTaxAmount      float64         `json:"sales_tax_amount"`
	TaxableBase         float64         `json:"taxable_base"`
	FiscalChecksCount   int             `json:"fiscal_checks_count"`
	TaxByRate           []TaxByRate     `json:"tax_by_rate,omitempty"`
}

// TaxByRate представляет налоги по ставкам
type TaxByRate struct {
	TaxRate   float64 `json:"tax_rate"`   // 20%, 10%, etc.
	Amount     float64 `json:"amount"`
	BaseAmount float64 `json:"base_amount"`
}

// StatisticsRequest представляет запрос на получение статистики
type StatisticsRequest struct {
	StartDate   time.Time `json:"start_date" binding:"required"`
	EndDate     time.Time `json:"end_date" binding:"required"`
	EstablishmentID string    `json:"establishment_id,omitempty"`
}
