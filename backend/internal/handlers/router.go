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
			auth.POST("/refresh", authHandler.Refresh)  // Публичный endpoint
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
			// Establishments (заведение создаётся при onboarding; здесь — просмотр/редактирование)
			establishmentHandler := NewEstablishmentHandler(usecases.Establishment, logger)
			establishments := protected.Group("/establishments")
			establishments.Use(middleware.RequireEstablishment(usecases.Auth))
			{
				establishments.GET("", establishmentHandler.List)
				establishments.GET("/:id", establishmentHandler.Get)
				establishments.POST("", establishmentHandler.Create)
				establishments.PUT("/:id", establishmentHandler.Update)
				establishments.DELETE("/:id", establishmentHandler.Delete)
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
				// Categories (для товаров и тех-карт)
				categories := menu.Group("/categories")
				{
					categories.GET("", menuHandler.GetCategories)
					categories.GET("/:id", menuHandler.GetCategory)
					categories.POST("", menuHandler.CreateCategory)
					categories.PUT("/:id", menuHandler.UpdateCategory)
					categories.DELETE("/:id", menuHandler.DeleteCategory)
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
				// Semi-finished (полуфабрикаты — пока пустой список)
				menu.GET("/semi-finished", menuHandler.GetSemiFinished)
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
			warehouse := protected.Group("/warehouse")
			warehouse.Use(middleware.RequireEstablishment(usecases.Auth))
			{
				warehouse.GET("/stock", warehouseHandler.GetStock)
				warehouse.PUT("/stock/:id/limit", warehouseHandler.UpdateStockLimit)
				warehouse.GET("/supplies", warehouseHandler.GetSuppliesByItem) // ?ingredient_id=xxx или ?product_id=xxx
				warehouse.POST("/supplies", warehouseHandler.CreateSupply)
				warehouse.POST("/write-offs", warehouseHandler.CreateWriteOff)
				warehouse.GET("/movements", warehouseHandler.GetMovements)
				warehouse.GET("/suppliers", warehouseHandler.ListSuppliers)
				warehouse.POST("/suppliers", warehouseHandler.CreateSupplier)
				warehouse.GET("/suppliers/:id", warehouseHandler.GetSupplier)
				warehouse.PUT("/suppliers/:id", warehouseHandler.UpdateSupplier)
				warehouse.DELETE("/suppliers/:id", warehouseHandler.DeleteSupplier)
			}

			// Finance
			financeHandler := NewFinanceHandler(usecases.Finance, logger)
			finance := protected.Group("/finance")
			{
				finance.GET("/transactions", financeHandler.GetTransactions)
				finance.GET("/shifts", financeHandler.GetShifts)
				finance.GET("/pnl", financeHandler.GetPNL)
				finance.GET("/cash-flow", financeHandler.GetCashFlow)
			}

			// Statistics
			statisticsHandler := NewStatisticsHandler(usecases.Statistics, logger)
			statistics := protected.Group("/statistics")
			{
				statistics.GET("/sales", statisticsHandler.GetSales)
				statistics.GET("/products", statisticsHandler.GetProducts)
				statistics.GET("/abc-analysis", statisticsHandler.GetABCAnalysis)
			}

			// Orders
			orderHandler := NewOrderHandler(usecases.Order, logger)
			orders := protected.Group("/orders")
			{
				orders.GET("", orderHandler.List)
				orders.GET("/:id", orderHandler.Get)
				orders.POST("", orderHandler.Create)
				orders.PUT("/:id", orderHandler.Update)
				orders.POST("/:id/pay", orderHandler.Pay)
			}
		}
	}

	return router
}