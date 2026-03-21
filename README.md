# ☕ ARC - Система автоматизации ресторана/кафе

<div align="center">
  <img src="https://via.placeholder.com/200x200/8B4513/FFFFFF?text=ARC" alt="ARC Logo" width="200"/>
  
  ## 🚀 Инновационные решения для автоматизации ресторанного бизнеса
  
  [![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://golang.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
  [![Gin](https://img.shields.io/badge/Gin-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://gin-gonic.com/)
</div>

---

## 🎯 Наша миссия

**ARC** - это современная платформа для автоматизации и управления процессами в ресторанном и кафе-бизнесе. Мы помогаем заведениям повысить эффективность, качество обслуживания и прибыльность через инновационные технологические решения.

## 🏗️ Архитектура проекта

Проект построен на принципах **Clean Architecture** с четким разделением на слои:

- **Presentation Layer** (handlers) - HTTP обработчики (Gin)
- **Application Layer** (usecases) - Бизнес-логика
- **Domain Layer** (models) - Доменные модели
- **Infrastructure Layer** (repositories) - Доступ к данным (GORM)

### Структура проекта

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
│   │   ├── config/       # Конфигурация
│   │   └── scripts/      # Seed скрипты для БД
│   ├── pkg/              # Переиспользуемые пакеты
│   ├── migrations/       # Миграции БД
│   ├── tests/            # E2E тесты
│   └── docs/             # Документация
├── config/               # Конфигурационные файлы
│   ├── prometheus/
│   ├── grafana/
│   └── loki/
├── docker-compose.yml    # Docker Compose конфигурация
├── Dockerfile            # Docker образ для backend
└── Makefile              # Команды для разработки
```

## 🛠️ Технологический стек

| Компонент | Технологии |
|-----------|------------|
| **Backend** | Go 1.21+, Gin, GORM, JWT |
| **База данных** | PostgreSQL 16 |
| **ORM** | GORM |
| **Аутентификация** | JWT (JSON Web Tokens) |
| **Мониторинг** | Prometheus, Grafana, Loki |
| **Контейнеризация** | Docker & Docker Compose |
| **Тестирование** | Go testing package |

## 🚀 Быстрый старт

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
# Скопируйте шаблон и заполните своими данными
cp .env.example .env
# Отредактируйте .env файл
nano .env
```

3. **Запустите с Docker Compose**

```bash
make docker-up
# или
docker-compose up -d
```

4. **Засеять начальные данные в базу данных**

⚠️ **ВАЖНО:** Перед первым запуском приложения необходимо засеять начальные данные:

```bash
cd backend

# Засеять роли и подписки (автоматически создаст таблицы)
go run internal/scripts/seed_roles_and_subscriptions.go
# ✅ Убедитесь, что в конце вы видите: "✅ Owner role verified"

# Засеять вопросы onboarding (автоматически создаст таблицы)
go run internal/scripts/seed_onboarding_questions.go
# ✅ Убедитесь, что в конце вы видите: "✅ Questions verified successfully"
```

**Примечания:**
- Скрипты автоматически создают таблицы, если их нет (используют GORM AutoMigrate)
- Скрипты идемпотентны - их можно запускать многократно
- По умолчанию скрипты подключаются к БД на порту **15432** (внешний порт из docker-compose)

5. **Запустите приложение**

```bash
# Если используете Docker:
docker-compose up -d --build app
# или
make docker-restart

# Если запускаете локально:
make run
# или
cd backend && go run ./cmd/api
```

Приложение будет доступно на `http://localhost:8080`

## 🚀 Основные возможности

### ☕ Управление заведениями
- **Onboarding процесс** с настраиваемыми вопросами
- **Автоматическое создание заведения** при регистрации
- **Настройка типов заведений** (ресторан, кафе, фаст-фуд, бар и т.д.)
- **Управление столами** с визуальным расположением

### 📋 Управление меню
- **Категории товаров** и тех-карт
- **Ингредиенты** с категориями
- **Тех-карты** (рецепты) с расчетом себестоимости
- **Товары** с ценообразованием и наценками
- **Модификаторы** для товаров

### 📦 Управление складом
- **Учет остатков** ингредиентов и товаров
- **Поставки** от поставщиков
- **Списания** товаров
- **История движений** по складу
- **Уведомления о низких остатках**

### 💰 Финансы
- **Транзакции** и кассовые смены
- **Profit & Loss отчеты**
- **Cash Flow анализ**
- **Финансовая аналитика**

### 📊 Аналитика и отчеты
- **Статистика продаж**
- **Анализ популярных позиций**
- **ABC анализ товаров**
- **KPI дашборды**

## 📡 API Endpoints

### Авторизация
- `POST /api/v1/auth/register` - Регистрация пользователя
- `POST /api/v1/auth/login` - Вход в систему
- `POST /api/v1/auth/refresh` - Обновление токена
- `POST /api/v1/auth/logout` - Выход из системы

### Onboarding
- `GET /api/v1/auth/onboarding/questions` - Получить вопросы опросника
- `POST /api/v1/auth/onboarding/submit` - Отправить ответы и создать заведение
- `GET /api/v1/auth/onboarding/response` - Получить ответы пользователя

### Заведения
- `GET /api/v1/establishments` - Список заведений
- `GET /api/v1/establishments/:id` - Детали заведения
- `PUT /api/v1/establishments/:id` - Обновление заведения
- `DELETE /api/v1/establishments/:id` - Удаление заведения

### Меню
- `GET /api/v1/menu/products` - Список товаров
- `GET /api/v1/menu/tech-cards` - Список тех-карт
- `GET /api/v1/menu/ingredients` - Список ингредиентов
- `GET /api/v1/menu/categories` - Список категорий

### Загрузка файлов
- `POST /api/v1/upload/image` - Загрузить изображение (multipart/form-data)
- `POST /api/v1/upload/image/base64` - Загрузить изображение из base64

### Склад
- `GET /api/v1/warehouse/stock` - Остатки на складе
- `POST /api/v1/warehouse/supplies` - Создание поставки
- `POST /api/v1/warehouse/write-offs` - Списание товаров
- `GET /api/v1/warehouse/movements` - История движений

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

## 📊 Мониторинг

После запуска доступны следующие сервисы:

- **Grafana**: http://localhost:3000 (credentials в .env)
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100
- **MinIO Console**: http://localhost:9001 (credentials в .env)
- **Swagger UI**: http://localhost:8080/swagger/index.html

## 🧪 Тестирование

### E2E тесты

Для запуска end-to-end тестов необходимо сначала засеять базу данных:

```bash
# 1. Засеять данные
cd backend
go run internal/scripts/seed_roles_and_subscriptions.go
go run internal/scripts/seed_onboarding_questions.go

# 2. Убедиться, что сервер запущен
docker-compose ps

# 3. Запустить тесты
cd tests
go test -v -short=false -run TestEstablishmentCreationE2E ./e2e_test.go
```

Подробная документация по тестам: [backend/tests/README.md](./backend/tests/README.md)

### Запуск всех тестов

```bash
make test
```

## 🛠️ Разработка

### Команды Makefile

```bash
# Сборка приложения
make build

# Запуск локально
make run

# Запуск тестов
make test

# Линтинг
make lint

# Docker команды
make docker-up          # Запустить все сервисы
make docker-down        # Остановить все сервисы
make docker-restart     # Пересобрать и перезапустить app
make docker-logs        # Просмотр логов

# Миграции (опционально, если используете миграции)
make migrate-up         # Применить миграции
make migrate-down       # Откатить миграции
```

### Миграции и Seed скрипты

```bash
# Seed скрипты (рекомендуется - автоматически создают таблицы)
cd backend
go run internal/scripts/seed_roles_and_subscriptions.go
go run internal/scripts/seed_onboarding_questions.go

# Или использовать миграции (если не используете seed скрипты)
make migrate-up
```

**Примечание:** Seed скрипты автоматически создают все необходимые таблицы через GORM AutoMigrate, поэтому миграции не обязательны при использовании скриптов.

### Переменные окружения

Основные настройки задаются через переменные окружения:

- `DB_HOST` - хост БД
- `DB_PORT` - порт БД
- `DB_USER` - пользователь БД
- `DB_PASSWORD` - пароль БД
- `DB_NAME` - имя БД
- `JWT_SECRET` - секретный ключ для JWT
- `APP_ENV` - окружение (development, production)
- `LOG_LEVEL` - уровень логирования
- `MINIO_ENDPOINT` - адрес MinIO
- `MINIO_ACCESS_KEY` - ключ доступа MinIO
- `MINIO_SECRET_KEY` - секретный ключ MinIO
- `MINIO_BUCKET_NAME` - имя bucket для изображений
- `MINIO_PUBLIC_URL` - публичный URL MinIO

См. `.env.example` для полного списка переменных с описаниями.

## 🌟 Преимущества

- ✅ **Clean Architecture** - поддерживаемый и масштабируемый код
- ✅ **Автоматическая миграция** - seed скрипты создают таблицы автоматически
- ✅ **Идемпотентные скрипты** - безопасный повторный запуск
- ✅ **E2E тесты** - полное покрытие функционала
- ✅ **Мониторинг** - встроенная интеграция с Prometheus, Grafana, Loki
- ✅ **Swagger документация** - автоматическая генерация API документации
- ✅ **JWT аутентификация** - безопасная система доступа
- ✅ **Ролевая модель** - гибкая система прав доступа
- ✅ **MinIO Storage** - хранение изображений для товаров и тех-карт
- ✅ **Загрузка файлов** - поддержка multipart и base64 загрузки изображений

## 📚 Документация

- [📖 Style Guide](./backend/STYLE.md) - руководство по стилю кода
- [📖 API Documentation](./backend/docs/md/API.md) - документация API
- [🏗️ Architecture](./backend/docs/md/ARCHITECTURE.md) - описание архитектуры
- [🧪 E2E Tests](./backend/tests/README.md) - документация по тестам
- [📋 Onboarding API](./backend/docs/md/ONBOARDING_API.md) - API onboarding процесса
- [🔄 Registration Flow](./backend/docs/md/REGISTRATION_FLOW.md) - процесс регистрации

## 🤝 Вклад в проект

Мы приветствуем вклад в развитие проекта! Пожалуйста:

1. Создайте fork проекта
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit ваши изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📈 Статистика проекта

<div align="center">
  
  ![GitHub Repo Size](https://img.shields.io/github/repo-size/yourusername/arc)
  ![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/arc)
  ![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?style=flat&logo=go)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=flat&logo=postgresql)
  
</div>

## 🌍 Лицензия

Этот проект распространяется под лицензией MIT. См. файл [LICENSE](LICENSE) для получения дополнительной информации.

---

<div align="center">
  
  **Сделано с ❤️ командой ARC**
  
  *Автоматизация ресторанного бизнеса начинается здесь*
  
</div>
