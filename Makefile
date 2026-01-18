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
# Note: Uses port 15432 (external port from docker-compose)
migrate-up:
	migrate -path ./backend/migrations -database "postgres://arc_user:arc_password@localhost:15432/arc_db?sslmode=disable" up

migrate-down:
	migrate -path ./backend/migrations -database "postgres://arc_user:arc_password@localhost:15432/arc_db?sslmode=disable" down

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