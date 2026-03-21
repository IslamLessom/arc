# Load .env file if it exists
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

.PHONY: build run test clean docker-build docker-up docker-down migrate-up migrate-down lint

# Build application
build:
	cd backend && go build -o bin/api ./cmd/api

# Run application
run:
	cd backend && go run ./cmd/api

# Run tests
test:
	cd backend && go test -v -race -coverprofile=coverage.out ./...

# Clean build artifacts
clean:
	cd backend && rm -rf bin/ coverage.out

# Docker commands
docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f app

docker-restart:
	docker-compose build app
	docker-compose up -d app

docker-rebuild:
	docker-compose build --no-cache app
	docker-compose up -d app

# Database migrations
# Reads credentials from .env file. Override with environment variables if needed.
migrate-up:
	migrate -path ./backend/migrations -database "postgres://$(DB_USER):$(DB_PASSWORD)@localhost:15433/$(DB_NAME)?sslmode=$(or $(DB_SSLMODE),disable)" up

migrate-down:
	migrate -path ./backend/migrations -database "postgres://$(DB_USER):$(DB_PASSWORD)@localhost:15433/$(DB_NAME)?sslmode=$(or $(DB_SSLMODE),disable)" down

# Linting
lint:
	cd backend && golangci-lint run

# Generate swagger docs
swagger:
	@command -v swag > /dev/null || go install github.com/swaggo/swag/cmd/swag@latest
	@SWAG_PATH=$$(command -v swag 2>/dev/null || echo "$$(go env GOPATH)/bin/swag"); \
	cd backend && $$SWAG_PATH init -g cmd/api/main.go

# Install dependencies
deps:
	cd backend && go mod download
	cd backend && go mod tidy

# Production: use .env.prod
prod-up:
	@cp .env.prod .env.deploy.tmp
	docker-compose --env-file .env.prod up -d --build
	@rm -f .env.deploy.tmp

prod-down:
	docker-compose --env-file .env.prod down

prod-logs:
	docker-compose --env-file .env.prod logs -f