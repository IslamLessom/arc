package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/config"
	"github.com/yourusername/arc/backend/internal/handlers"
	"github.com/yourusername/arc/backend/internal/repositories"
	"github.com/yourusername/arc/backend/internal/usecases"
	"github.com/yourusername/arc/backend/pkg/database"
	"github.com/yourusername/arc/backend/pkg/logger"
)

// @title           Arc Restaurant Management API
// @version         1.0
// @description     API для системы управления рестораном/кафе с функционалом меню, склада, финансов и статистики
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@swagger.io

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api/v1
// @schemes   http https

// @securityDefinitions.apikey Bearer
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	// Initialize logger
	lg, err := logger.New()
	if err != nil {
		panic(fmt.Sprintf("failed to initialize logger: %v", err))
	}
	defer lg.Sync()

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		lg.Fatal("failed to load config", zap.Error(err))
	}

	// Initialize database
	db, err := database.NewPostgres(cfg.Database, lg)
	if err != nil {
		lg.Fatal("failed to connect to database", zap.Error(err))
	}
	
	sqlDB, err := db.DB()
	if err != nil {
		lg.Fatal("failed to get underlying sql.DB", zap.Error(err))
	}
	defer sqlDB.Close()

	// Initialize repositories
	repos := repositories.NewRepositories(db)

	// Initialize use cases
	usecases, err := usecases.NewUseCases(repos, cfg)
	if err != nil {
		lg.Fatal("failed to initialize use cases", zap.Error(err))
	}

	// Initialize handlers
	router := handlers.NewRouter(usecases, cfg, lg)

	// Initialize HTTP server
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Server.Port),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		lg.Info("Starting server", zap.Int("port", cfg.Server.Port))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			lg.Fatal("failed to start server", zap.Error(err))
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	lg.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		lg.Fatal("Server forced to shutdown", zap.Error(err))
	}

	lg.Info("Server exited")
}