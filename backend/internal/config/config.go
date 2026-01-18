package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	App      AppConfig
}

type ServerConfig struct {
	Port int
	Host string
}

type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	Name     string
	SSLMode  string
}

type JWTConfig struct {
	Secret     string
	Expiration int // in hours
}

type AppConfig struct {
	Environment string
	LogLevel    string
}

func Load() (*Config, error) {
	// Load .env file if exists
	_ = godotenv.Load()

	viper.SetDefault("SERVER_PORT", 8080)
	viper.SetDefault("SERVER_HOST", "0.0.0.0")
	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", 15432) // Порт из docker-compose (внешний порт PostgreSQL)
	viper.SetDefault("DB_USER", "arc_user")
	viper.SetDefault("DB_PASSWORD", "arc_password")
	viper.SetDefault("DB_NAME", "arc_db")
	viper.SetDefault("DB_SSLMODE", "disable")
	viper.SetDefault("JWT_SECRET", "your-secret-key-change-in-production")
	viper.SetDefault("JWT_EXPIRATION", 24)
	viper.SetDefault("APP_ENV", "development")
	viper.SetDefault("LOG_LEVEL", "info")

	// Read from environment variables
	viper.AutomaticEnv()

	serverPort, err := getIntEnv("SERVER_PORT", viper.GetInt("SERVER_PORT"))
	if err != nil {
		return nil, fmt.Errorf("invalid SERVER_PORT: %w", err)
	}

	dbPort, err := getIntEnv("DB_PORT", viper.GetInt("DB_PORT"))
	if err != nil {
		return nil, fmt.Errorf("invalid DB_PORT: %w", err)
	}

	jwtExpiration, err := getIntEnv("JWT_EXPIRATION", viper.GetInt("JWT_EXPIRATION"))
	if err != nil {
		return nil, fmt.Errorf("invalid JWT_EXPIRATION: %w", err)
	}

	cfg := &Config{
		Server: ServerConfig{
			Port: serverPort,
			Host: getEnv("SERVER_HOST", viper.GetString("SERVER_HOST")),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", viper.GetString("DB_HOST")),
			Port:     dbPort,
			User:     getEnv("DB_USER", viper.GetString("DB_USER")),
			Password: getEnv("DB_PASSWORD", viper.GetString("DB_PASSWORD")),
			Name:     getEnv("DB_NAME", viper.GetString("DB_NAME")),
			SSLMode:  getEnv("DB_SSLMODE", viper.GetString("DB_SSLMODE")),
		},
		JWT: JWTConfig{
			Secret:     getEnv("JWT_SECRET", viper.GetString("JWT_SECRET")),
			Expiration: jwtExpiration,
		},
		App: AppConfig{
			Environment: getEnv("APP_ENV", viper.GetString("APP_ENV")),
			LogLevel:    getEnv("LOG_LEVEL", viper.GetString("LOG_LEVEL")),
		},
	}

	return cfg, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getIntEnv(key string, defaultValue int) (int, error) {
	if value := os.Getenv(key); value != "" {
		port, err := strconv.Atoi(value)
		if err != nil {
			return 0, err
		}
		return port, nil
	}
	return defaultValue, nil
}