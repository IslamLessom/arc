# Структура проекта Arc

## Обзор

Проект разделен на две основные части:
- **backend/** - Go приложение (API сервер)
- **frontend/** - Frontend приложение (будет добавлено позже)

## Структура директорий

```
arc/
├── backend/                    # Backend приложение
│   ├── cmd/
│   │   └── api/                # Точка входа приложения
│   │       └── main.go
│   ├── internal/               # Внутренний код приложения
│   │   ├── handlers/           # HTTP handlers (presentation layer)
│   │   ├── usecases/           # Бизнес-логика (application layer)
│   │   ├── repositories/       # Доступ к данным (infrastructure layer)
│   │   ├── models/             # Доменные модели (domain layer)
│   │   ├── middleware/         # HTTP middleware
│   │   └── config/              # Конфигурация
│   ├── pkg/                    # Переиспользуемые пакеты
│   │   ├── database/           # Работа с БД
│   │   └── logger/             # Логирование
│   ├── migrations/             # Миграции БД
│   ├── logs/                   # Логи приложения
│   ├── docs/                   # Документация
│   ├── go.mod                  # Go модуль
│   └── STYLE.md                # Руководство по стилю
│
├── frontend/                   # Frontend приложение (будущее)
│
├── config/                     # Конфигурационные файлы (общие)
│   ├── prometheus/            # Prometheus конфигурация
│   ├── grafana/               # Grafana конфигурация
│   ├── loki/                  # Loki конфигурация
│   └── promtail/              # Promtail конфигурация
│
├── docker-compose.yml          # Docker Compose конфигурация
├── Dockerfile                  # Docker образ для backend
├── Makefile                    # Команды для разработки
├── README.md                   # Основная документация
└── .gitignore                  # Git ignore правила
```

## Модуль Go

Модуль Go находится в `backend/` и имеет путь:
```
github.com/yourusername/arc/backend
```

Все импорты в коде используют этот путь:
```go
import "github.com/yourusername/arc/backend/internal/models"
```

## Команды разработки

Все команды из Makefile выполняются относительно корня проекта, но работают с backend:

```bash
# Сборка
make build          # cd backend && go build

# Запуск
make run            # cd backend && go run ./cmd/api

# Тесты
make test           # cd backend && go test

# Docker
make docker-up      # docker-compose up -d
```

## Docker

- **Dockerfile** собирает backend приложение из `backend/`
- **docker-compose.yml** управляет всеми сервисами (postgres, prometheus, grafana, loki, app)
- Конфигурационные файлы находятся в `config/` (общие для всего проекта)

## Логи

Логи backend приложения сохраняются в `backend/logs/` и монтируются в Docker контейнер для сбора через Promtail.

## Миграции

Миграции БД находятся в `backend/migrations/` и монтируются в PostgreSQL контейнер при инициализации.

## Документация

- **README.md** - основная документация проекта
- **backend/STYLE.md** - руководство по стилю кода
- **backend/docs/** - детальная документация (API, Architecture, Recommendations)