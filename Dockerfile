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

FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app

# Create logs directory
RUN mkdir -p /app/logs

COPY --from=builder /app/main .
RUN chmod +x main

EXPOSE 8080

CMD ["./main"]