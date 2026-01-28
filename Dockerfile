FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git make

# Copy go mod files
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copy source code
COPY backend/ .

# Build application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/api

# Build seed scripts
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o seed_roles_and_subscriptions ./scripts/seed-roles
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o seed_onboarding_questions ./scripts/seed-onboarding-questions
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o seed_account_types ./scripts/seed-account-types

FROM alpine:latest

# Install postgresql-client for database health check
RUN apk --no-cache add ca-certificates tzdata postgresql-client

WORKDIR /app

# Create logs directory
RUN mkdir -p /app/logs

# Copy binaries
COPY --from=builder /app/main .
COPY --from=builder /app/seed_roles_and_subscriptions .
COPY --from=builder /app/seed_onboarding_questions .
COPY --from=builder /app/seed_account_types .

# Copy entrypoint script
COPY backend/docker-entrypoint.sh .
RUN chmod +x main seed_roles_and_subscriptions seed_onboarding_questions seed_account_types docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["./docker-entrypoint.sh"]