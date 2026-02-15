package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"go.uber.org/zap"

	_ "github.com/yourusername/arc/backend/docs" // импорт сгенерированной документации
	"github.com/yourusername/arc/backend/internal/config"
	"github.com/yourusername/arc/backend/internal/usecases"
	"github.com/yourusername/arc/backend/internal/middleware"
)

// NewRouter создает и настраивает HTTP router
func NewRouter(usecases *usecases.UseCases, cfg *config.Config, logger *zap.Logger) *gin.Engine {
	if cfg.App.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// Middleware
	router.Use(middleware.Logger(logger))
	router.Use(middleware.Recovery(logger))
	router.Use(middleware.CORS())
	router.Use(middleware.Metrics())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Prometheus metrics
	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Swagger UI
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// API v1
	v1 := router.Group("/api/v1")
	{
		// Auth routes
		authHandler := NewAuthHandler(usecases.Auth, logger)
		onboardingHandler := NewOnboardingHandler(usecases.Onboarding, logger)
		auth := v1.Group("/auth")
		{
			auth.POST("/register", authHandler.Register) // Публичный endpoint
			auth.POST("/login", authHandler.Login)      // Публичный endpoint
			auth.POST("/employee/login", authHandler.EmployeeLogin) // Публичный endpoint
			auth.POST("/refresh", authHandler.Refresh)  // Публичный endpoint
			auth.GET("/me", middleware.Auth(cfg.JWT.Secret, usecases.Auth.GetTokenRepo()), authHandler.GetCurrentUser)
			auth.POST("/logout", middleware.Auth(cfg.JWT.Secret, usecases.Auth.GetTokenRepo()), authHandler.Logout)
			
			// Onboarding routes
			onboarding := auth.Group("/onboarding")
			{
				onboarding.GET("/questions", onboardingHandler.GetQuestions) // Публичный endpoint
				onboarding.POST("/submit", middleware.Auth(cfg.JWT.Secret, usecases.Auth.GetTokenRepo()), onboardingHandler.SubmitAnswers)
				onboarding.GET("/response", middleware.Auth(cfg.JWT.Secret, usecases.Auth.GetTokenRepo()), onboardingHandler.GetUserResponse)
			}
		}

		// Protected routes
		protected := v1.Group("")
		protected.Use(middleware.Auth(cfg.JWT.Secret, usecases.Auth.GetTokenRepo()))
		{
			// Upload routes (для загрузки изображений)
			uploadHandler := NewUploadHandler(usecases.Storage, logger)
			shiftHandler := NewShiftHandler(usecases.Shift, logger)
			userHandler := NewUserHandler(usecases.User, usecases.EmployeeStatistics, logger)
			roleHandler := NewRoleHandler(usecases.Role, logger)
			statisticsHandler := NewStatisticsHandler(usecases.Statistics, logger)
			upload := protected.Group("/upload")
			{
				upload.POST("/image", uploadHandler.UploadImage)
				upload.POST("/image/base64", uploadHandler.UploadImageFromBase64)
			}

			// Shift routes
			shifts := protected.Group("/shifts")
			shifts.Use(middleware.RequireEstablishment(usecases.Auth))
			{
				shifts.GET("/me/active", shiftHandler.GetCurrentActiveShift)
				shifts.POST("/start", shiftHandler.StartShift)
				shifts.POST("/end", shiftHandler.EndShift)
			}
			// Statistics routes
			statistics := protected.Group("/statistics")
			statistics.Use(middleware.RequireEstablishment(usecases.Auth))
			{
				statistics.GET("/sales", statisticsHandler.GetSales)
				statistics.GET("/customers", statisticsHandler.GetCustomers)
				statistics.GET("/employees", statisticsHandler.GetEmployees)
				statistics.GET("/workshops", statisticsHandler.GetWorkshops)
				statistics.GET("/tables", statisticsHandler.GetTables)
				statistics.GET("/categories", statisticsHandler.GetCategories)
				statistics.GET("/products", statisticsHandler.GetProducts)
				statistics.GET("/abc", statisticsHandler.GetABCAnalysis)
				statistics.GET("/checks", statisticsHandler.GetChecks)
				statistics.GET("/reviews", statisticsHandler.GetReviews)
				statistics.GET("/payments", statisticsHandler.GetPayments)
				statistics.GET("/taxes", statisticsHandler.GetTaxes)
			}

			// User routes (для управления сотрудниками)
			users := protected.Group("/users")
			users.Use(middleware.RequireEstablishment(usecases.Auth))
			{
				users.POST("", userHandler.CreateEmployee)
				users.GET("", userHandler.ListEmployees)
				users.GET("/:id", userHandler.GetEmployee)
				users.PUT("/:id", userHandler.UpdateEmployee)
				users.DELETE("/:id", userHandler.DeleteEmployee)
				users.GET("/:id/statistics", userHandler.GetEmployeeStatistics)
				users.GET("/statistics", userHandler.GetAllEmployeesStatistics)
			}

			// Access routes (алиас для users, для фронтенда)
			access := protected.Group("/access")
			access.Use(middleware.RequireEstablishment(usecases.Auth))
			{
				employees := access.Group("/employees")
				{
					employees.POST("", userHandler.CreateEmployee)
					employees.GET("", userHandler.ListEmployees)
					employees.GET("/:id", userHandler.GetEmployee)
					employees.PUT("/:id", userHandler.UpdateEmployee)
					employees.DELETE("/:id", userHandler.DeleteEmployee)
					employees.GET("/:id/statistics", userHandler.GetEmployeeStatistics)
					employees.GET("/statistics", userHandler.GetAllEmployeesStatistics)
				}

				// Positions routes (алиас для roles, используется фронтендом как "должности")
				positions := access.Group("/positions")
				{
					positions.POST("", roleHandler.CreateRole)
					positions.GET("", roleHandler.ListRoles)
					positions.GET("/:id", roleHandler.GetRole)
					positions.PUT("/:id", roleHandler.UpdateRole)
					positions.DELETE("/:id", roleHandler.DeleteRole)
				}
			}

			// Role routes (для управления ролями)
			roles := protected.Group("/roles")
			roles.Use(middleware.RequireEstablishment(usecases.Auth))
			{
				roles.POST("", roleHandler.CreateRole)
				roles.GET("", roleHandler.ListRoles)
				roles.GET("/:id", roleHandler.GetRole)
				roles.PUT("/:id", roleHandler.UpdateRole)
				roles.DELETE("/:id", roleHandler.DeleteRole)
			}

			// Establishments (заведение создаётся при onboarding; здесь — просмотр/редактирование)
			establishmentHandler := NewEstablishmentHandler(usecases.Establishment, logger)
			roomHandler := NewRoomHandler(usecases.Room, logger)
			tableHandler := NewTableHandler(usecases.Table, logger)
			establishments := protected.Group("/establishments")
			establishments.Use(middleware.RequireEstablishment(usecases.Auth))
			{
				establishments.GET("", establishmentHandler.List)
				establishments.GET("/:id", establishmentHandler.Get)
				establishments.POST("", establishmentHandler.Create)
				establishments.PUT("/:id", establishmentHandler.Update)
				establishments.DELETE("/:id", establishmentHandler.Delete)
				establishments.GET("/me/settings", establishmentHandler.GetEstablishmentSettings)

				// Tables через rooms
				rooms := protected.Group("/rooms")
				{
					rooms.GET("/:id/tables", tableHandler.ListTables)
					rooms.POST("/:id/tables", tableHandler.CreateTable)
					rooms.GET("/:id/tables/:table_id", tableHandler.GetTable)
					rooms.PUT("/:id/tables/:table_id", tableHandler.UpdateTable)
					rooms.DELETE("/:id/tables/:table_id", tableHandler.DeleteTable)
				}

				// Rooms внутри establishments
				estRooms := establishments.Group("/:id/rooms")
				{
					estRooms.GET("", roomHandler.ListRooms)
					estRooms.POST("", roomHandler.CreateRoom)
					estRooms.GET("/:room_id", roomHandler.GetRoom)
					estRooms.PUT("/:room_id", roomHandler.UpdateRoom)
					estRooms.DELETE("/:room_id", roomHandler.DeleteRoom)
				}
			}

			// Menu / Products (требуется заведение — onboarding завершён)
			menuHandler := NewMenuHandler(usecases.Menu, logger)
			menu := protected.Group("/menu")
			menu.Use(middleware.RequireEstablishment(usecases.Auth))
			{
				// Products
				products := menu.Group("/products")
				{
					products.GET("", menuHandler.GetProducts)
					products.GET("/:id", menuHandler.GetProduct)
					products.POST("", menuHandler.CreateProduct)
					products.PUT("/:id", menuHandler.UpdateProduct)
					products.DELETE("/:id", menuHandler.DeleteProduct)
				}
				// Categories (для товаров и тех-карт)
				categories := menu.Group("/categories")
				{
				categories.GET("", menuHandler.GetCategories) // Маршрут для получения всех категорий
				categories.POST("", menuHandler.CreateCategory) // Маршрут для создания категории

				// Группа маршрутов для операций с конкретной категорией по ID
				categoryByID := categories.Group("/:id")
				{
					categoryByID.GET("", menuHandler.GetCategory)       // GET /api/v1/menu/categories/:id
					categoryByID.PUT("", menuHandler.UpdateCategory)    // PUT /api/v1/menu/categories/:id
					categoryByID.DELETE("", menuHandler.DeleteCategory) // DELETE /api/v1/menu/categories/:id

					// Продукты по категории
					categoryByID.GET("/products", menuHandler.ListProductsByCategory)    // GET /api/v1/menu/categories/:id/products
					categoryByID.GET("/tech-cards", menuHandler.ListTechCardsByCategory) // GET /api/v1/menu/categories/:id/tech-cards
				}
				}

				// Tech Cards
				techCards := menu.Group("/tech-cards")
				{
					techCards.GET("", menuHandler.GetTechCards)
					techCards.GET("/:id", menuHandler.GetTechCard)
					techCards.POST("", menuHandler.CreateTechCard)
					techCards.PUT("/:id", menuHandler.UpdateTechCard)
					techCards.DELETE("/:id", menuHandler.DeleteTechCard)
				}
				// Ingredients
				ingredients := menu.Group("/ingredients")
				{
					ingredients.GET("", menuHandler.GetIngredients)
					ingredients.GET("/:id", menuHandler.GetIngredient)
					ingredients.POST("", menuHandler.CreateIngredient)
					ingredients.PUT("/:id", menuHandler.UpdateIngredient)
					ingredients.DELETE("/:id", menuHandler.DeleteIngredient)
				}
				// Ingredient categories
				ingredientCategories := menu.Group("/ingredient-categories")
				{
					ingredientCategories.GET("", menuHandler.GetIngredientCategories)
					ingredientCategories.GET("/:id", menuHandler.GetIngredientCategory)
					ingredientCategories.POST("", menuHandler.CreateIngredientCategory)
					ingredientCategories.PUT("/:id", menuHandler.UpdateIngredientCategory)
					ingredientCategories.DELETE("/:id", menuHandler.DeleteIngredientCategory)
				}
				// Semi-finished (полуфабрикаты)
				menu.GET("/semi-finished", menuHandler.GetSemiFinished)
				menu.POST("/semi-finished", menuHandler.CreateSemiFinished)
			}

			// Warehouses (склады) + Stock, Supply, WriteOff, Suppliers
			warehouseHandler := NewWarehouseHandler(usecases.Warehouse, logger)
			warehouses := protected.Group("/warehouses")
			warehouses.Use(middleware.RequireEstablishment(usecases.Auth))
			{
				warehouses.GET("", warehouseHandler.ListWarehouses)
				warehouses.GET("/:id", warehouseHandler.GetWarehouse)
				warehouses.POST("", warehouseHandler.CreateWarehouse)
				warehouses.PUT("/:id", warehouseHandler.UpdateWarehouse)
				warehouses.DELETE("/:id", warehouseHandler.DeleteWarehouse)
			}

			// Workshops (цехи)
			workshopHandler := NewWorkshopHandler(usecases.Workshop, logger)
			workshops := protected.Group("/workshops")
			workshops.Use(middleware.RequireEstablishment(usecases.Auth))
			{
				workshops.GET("", workshopHandler.ListWorkshops)
				workshops.GET("/:id", workshopHandler.GetWorkshop)
				workshops.POST("", workshopHandler.CreateWorkshop)
				workshops.PUT("/:id", workshopHandler.UpdateWorkshop)
				workshops.DELETE("/:id", workshopHandler.DeleteWorkshop)
			}
			warehouse := protected.Group("/warehouse")
			warehouse.Use(middleware.RequireEstablishment(usecases.Auth))
			{
				warehouse.GET("/stock", warehouseHandler.GetStock)
				warehouse.PUT("/stock/:id/limit", warehouseHandler.UpdateStockLimit)
				warehouse.GET("/supplies", warehouseHandler.ListSupplies) // Список всех поставок, опционально ?warehouse_id=xxx
				warehouse.GET("/supplies/:id", warehouseHandler.GetSupply) // Получить поставку по ID
				warehouse.GET("/supplies/by-item", warehouseHandler.GetSuppliesByItem) // ?ingredient_id=xxx или ?product_id=xxx
				warehouse.POST("/supplies", warehouseHandler.CreateSupply)
				warehouse.PUT("/supplies/:id", warehouseHandler.UpdateSupply) // Обновить поставку
				warehouse.GET("/write-offs", warehouseHandler.ListWriteOffs)
				warehouse.GET("/write-offs/:id", warehouseHandler.GetWriteOff)
				warehouse.POST("/write-offs", warehouseHandler.CreateWriteOff)
				warehouse.GET("/write-off-reasons", warehouseHandler.ListWriteOffReasons)
				warehouse.GET("/write-off-reasons/:id", warehouseHandler.GetWriteOffReason)
				warehouse.POST("/write-off-reasons", warehouseHandler.CreateWriteOffReason)
				warehouse.PUT("/write-off-reasons/:id", warehouseHandler.UpdateWriteOffReason)
				warehouse.DELETE("/write-off-reasons/:id", warehouseHandler.DeleteWriteOffReason)
				warehouse.GET("/movements", warehouseHandler.GetMovements)
				warehouse.GET("/suppliers", warehouseHandler.ListSuppliers)
				warehouse.POST("/suppliers", warehouseHandler.CreateSupplier)
				warehouse.GET("/suppliers/:id", warehouseHandler.GetSupplier)
				warehouse.PUT("/suppliers/:id", warehouseHandler.UpdateSupplier)
				warehouse.DELETE("/suppliers/:id", warehouseHandler.DeleteSupplier)
			}

			// Inventory (инвентаризация)
			inventoryHandler := NewInventoryHandler(usecases.Inventory, logger)
			inventory := protected.Group("/inventory")
			inventory.Use(middleware.RequireEstablishment(usecases.Auth))
			{
				inventory.GET("", inventoryHandler.List)
				inventory.GET("/:id", inventoryHandler.GetByID)
				inventory.POST("", inventoryHandler.Create)
				inventory.PUT("/:id", inventoryHandler.Update)
				inventory.PUT("/:id/status", inventoryHandler.UpdateStatus)
				inventory.DELETE("/:id", inventoryHandler.Delete)
				inventory.GET("/stock-snapshot", inventoryHandler.GetStockSnapshot)
				inventory.PUT("/:id/items/:item_id", inventoryHandler.UpdateItem)
				inventory.DELETE("/:id/items/:item_id", inventoryHandler.DeleteItem)
			}

			// Finance
			financeHandler := NewFinanceHandler(usecases.Finance, logger)
			accountHandler := NewAccountHandler(usecases.Account, logger)
			salaryHandler := NewSalaryHandler(usecases.Salary, logger)
			finance := protected.Group("/finance")
			finance.Use(middleware.RequireEstablishment(usecases.Auth))
			{
				// Transactions
				transactions := finance.Group("/transactions")
				{
					transactions.GET("", financeHandler.ListTransactions)
					transactions.GET("/:id", financeHandler.GetTransaction)
					transactions.POST("", financeHandler.CreateTransaction)
					transactions.PUT("/:id", financeHandler.UpdateTransaction)
					transactions.DELETE("/:id", financeHandler.DeleteTransaction)
					transactions.GET("/total", financeHandler.GetTotalTransactionsAmount)
				}
				// Accounts
				accounts := finance.Group("/accounts")
				{
					accounts.GET("", accountHandler.ListAccounts)
					accounts.GET("/:id", accountHandler.GetAccount)
					accounts.POST("", accountHandler.CreateAccount)
					accounts.PUT("/:id", accountHandler.UpdateAccount)
					accounts.DELETE("/:id", accountHandler.DeleteAccount)
				}
				// Account Types
				finance.GET("/account-types", accountHandler.GetAccountTypes)
				// Other finance endpoints
				finance.GET("/shifts", financeHandler.GetShifts)
				finance.GET("/pnl", financeHandler.GetPNL)
				finance.GET("/cash-flow", financeHandler.GetCashFlow)
				finance.GET("/reports/shift", financeHandler.GenerateShiftReport)
				// Salary
				finance.GET("/salary", salaryHandler.GetSalaryReport)
			}

			// Orders
			orderHandler := NewOrderHandler(usecases.Order, logger)
			orders := protected.Group("/orders")
			orders.Use(middleware.RequireEstablishment(usecases.Auth))
			{
				orders.GET("", orderHandler.List)
				orders.GET("/active", orderHandler.ListActiveOrdersByEstablishment)
				orders.GET("/:order_id", orderHandler.Get)
				orders.POST("", orderHandler.Create)
				orders.POST("/:order_id/items", orderHandler.AddOrderItem)
				orders.PUT("/:order_id/items/:item_id", orderHandler.UpdateOrderItemQuantity)
				orders.PUT("/:order_id", orderHandler.Update)
				orders.POST("/:order_id/pay", orderHandler.ProcessOrderPayment)
				orders.POST("/:order_id/close-without-payment", orderHandler.CloseOrderWithoutPayment)
			}

			// Marketing
			marketingHandler := NewMarketingHandler(usecases.Marketing, logger)
			marketing := protected.Group("/marketing")
			marketing.Use(middleware.RequireEstablishment(usecases.Auth))
			{
			// Clients
			clients := marketing.Group("/clients")
			{
				clients.GET("", marketingHandler.ListClients)
				clients.POST("", marketingHandler.CreateClient)
				clients.GET("/:id", marketingHandler.GetClient)
				clients.PUT("/:id", marketingHandler.UpdateClient)
				clients.DELETE("/:id", marketingHandler.DeleteClient)
				clients.POST("/:id/loyalty/add", marketingHandler.AddClientLoyaltyPoints)
				clients.POST("/:id/loyalty/redeem", marketingHandler.RedeemClientLoyaltyPoints)
			}
			// Client Groups
			clientGroups := marketing.Group("/customer-groups")
			{
				clientGroups.GET("", marketingHandler.ListClientGroups)
				clientGroups.POST("", marketingHandler.CreateClientGroup)
				clientGroups.GET("/:id", marketingHandler.GetClientGroup)
				clientGroups.PUT("/:id", marketingHandler.UpdateClientGroup)
				clientGroups.DELETE("/:id", marketingHandler.DeleteClientGroup)
			}
			// Loyalty Programs
			loyaltyPrograms := marketing.Group("/loyalty-programs")
			{
				loyaltyPrograms.GET("", marketingHandler.ListLoyaltyPrograms)
				loyaltyPrograms.POST("", marketingHandler.CreateLoyaltyProgram)
				loyaltyPrograms.GET("/:id", marketingHandler.GetLoyaltyProgram)
				loyaltyPrograms.PUT("/:id", marketingHandler.UpdateLoyaltyProgram)
				loyaltyPrograms.DELETE("/:id", marketingHandler.DeleteLoyaltyProgram)
			}
			// Promotions
			promotions := marketing.Group("/promotions")
			{
				promotions.GET("", marketingHandler.ListPromotions)
				promotions.POST("", marketingHandler.CreatePromotion)
				promotions.GET("/:id", marketingHandler.GetPromotion)
				promotions.PUT("/:id", marketingHandler.UpdatePromotion)
				promotions.DELETE("/:id", marketingHandler.DeletePromotion)
			}
			// Exclusions
			exclusions := marketing.Group("/exclusions")
			{
				exclusions.GET("", marketingHandler.ListExclusions)
				exclusions.POST("", marketingHandler.CreateExclusion)
				exclusions.GET("/:id", marketingHandler.GetExclusion)
				exclusions.PUT("/:id", marketingHandler.UpdateExclusion)
				exclusions.DELETE("/:id", marketingHandler.DeleteExclusion)
			}
		}
	}
	}

	return router
}
