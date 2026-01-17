# Arc - Restaurant Management System

Система управления рестораном/кафе с PWA интерфейсом для операций и админ-панелью для управления инвентарем, финансами и статистикой.

## Архитектура

Проект построен на принципах **Clean Architecture** с четким разделением на слои:

- **Presentation Layer** (handlers) - HTTP обработчики
- **Application Layer** (usecases) - Бизнес-логика
- **Domain Layer** (models) - Доменные модели
- **Infrastructure Layer** (repositories) - Доступ к данным

## Технологический стек

- **Backend**: Go 1.21+
- **Database**: PostgreSQL 16
- **ORM**: GORM
- **Authentication**: JWT
- **Monitoring**: Prometheus, Grafana, Loki
- **Containerization**: Docker & Docker Compose

## Структура проекта

```
arc/
├── backend/              # Backend приложение (Go)
│   ├── cmd/api/          # Точка входа приложения
│   ├── internal/
│   │   ├── handlers/     # HTTP handlers
│   │   ├── usecases/     # Бизнес-логика
│   │   ├── repositories/ # Доступ к данным
│   │   ├── models/       # Доменные модели
│   │   ├── middleware/   # HTTP middleware (auth, logging, metrics)
│   │   └── config/       # Конфигурация
│   ├── pkg/              # Переиспользуемые пакеты
│   ├── migrations/       # Миграции БД
│   ├── logs/             # Логи приложения
│   └── docs/             # Документация
├── frontend/             # Frontend приложение (будущее)
├── config/               # Конфигурационные файлы (общие)
│   ├── prometheus/
│   ├── grafana/
│   └── loki/
├── docker-compose.yml     # Docker Compose конфигурация
├── Dockerfile            # Docker образ для backend
└── Makefile              # Команды для разработки
```

## Быстрый старт

### Предварительные требования

- Go 1.21 или выше
- Docker и Docker Compose
- Make (опционально)

### Установка и запуск

1. **Клонируйте репозиторий**

```bash
git clone <repository-url>
cd arc
```

2. **Настройте переменные окружения**

```bash
cp .env.example .env
# Отредактируйте .env файл при необходимости
```

3. **Запустите с Docker Compose**

```bash
make docker-up
# или
docker-compose up -d
```

4. **Примените миграции**

```bash
make migrate-up
```

5. **Запустите приложение локально (опционально)**

```bash
make run
# или
cd backend && go run ./cmd/api
```

Приложение будет доступно на `http://localhost:8080`

## Мониторинг

- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100

## API Endpoints

### Авторизация

- `POST /api/v1/auth/login` - Вход в систему
- `POST /api/v1/auth/refresh` - Обновление токена
- `POST /api/v1/auth/logout` - Выход из системы

### Заведения (Establishments)

- `GET /api/v1/establishments` - Список заведений
- `GET /api/v1/establishments/:id` - Детали заведения
- `POST /api/v1/establishments` - Создание заведения
- `PUT /api/v1/establishments/:id` - Обновление заведения
- `DELETE /api/v1/establishments/:id` - Удаление заведения

### Меню

- `GET /api/v1/menu/products` - Список товаров
- `GET /api/v1/menu/tech-cards` - Список тех-карт
- `GET /api/v1/menu/ingredients` - Список ингредиентов
- `GET /api/v1/menu/semi-finished` - Список полуфабрикатов

### Склад

- `GET /api/v1/warehouse/stock` - Остатки на складе
- `POST /api/v1/warehouse/supplies` - Создание поставки
- `POST /api/v1/warehouse/write-offs` - Списание товаров
- `GET /api/v1/warehouse/movements` - Перемещения товаров

### Финансы

- `GET /api/v1/finance/transactions` - Список транзакций
- `GET /api/v1/finance/shifts` - Кассовые смены
- `GET /api/v1/finance/pnl` - Profit & Loss отчет
- `GET /api/v1/finance/cash-flow` - Cash Flow отчет

### Статистика

- `GET /api/v1/statistics/sales` - Статистика продаж
- `GET /api/v1/statistics/products` - Статистика по товарам
- `GET /api/v1/statistics/abc-analysis` - ABC анализ

Подробная документация API доступна после запуска Swagger на `/swagger/index.html`

## Разработка

### Запуск тестов

```bash
make test
```

### Линтинг

```bash
make lint
```

### Миграции

```bash
# Применить миграции
make migrate-up

# Откатить миграции
make migrate-down
```

### Сборка

```bash
make build
```

## Конфигурация

Основные настройки задаются через переменные окружения (см. `.env.example`):

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - настройки БД
- `JWT_SECRET` - секретный ключ для JWT
- `APP_ENV` - окружение (development, production)
- `LOG_LEVEL` - уровень логирования

## Документация

- [Style Guide](./backend/STYLE.md) - руководство по стилю кода
- [API Documentation](./backend/docs/API.md) - документация API
- [Architecture](./backend/docs/ARCHITECTURE.md) - описание архитектуры

## Лицензия

MIT