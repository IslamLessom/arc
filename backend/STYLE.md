# Style Guide для проекта Arc

## Общие принципы

1. **Чистая архитектура**: Соблюдаем принципы Clean Architecture с четким разделением слоев
2. **SOLID принципы**: Все код должен следовать принципам SOLID
3. **Go best practices**: Следуем официальным рекомендациям Go и эффективному Go
4. **Документирование**: Все публичные функции и типы должны быть задокументированы

## Структура проекта

```
arc/
├── cmd/              # Точки входа приложения
├── internal/         # Внутренний код приложения
│   ├── handlers/     # HTTP handlers (presentation layer)
│   ├── usecases/     # Бизнес-логика (application layer)
│   ├── repositories/ # Доступ к данным (infrastructure layer)
│   ├── models/       # Доменные модели (domain layer)
│   ├── middleware/   # HTTP middleware
│   └── config/       # Конфигурация
├── pkg/              # Переиспользуемые пакеты
├── migrations/       # Миграции БД
└── config/           # Конфигурационные файлы (docker-compose, prometheus и т.д.)
```

## Именование

### Файлы и пакеты

- **Файлы**: lowercase с подчеркиваниями для множественных слов: `user_repository.go`
- **Пакеты**: lowercase, короткие и понятные: `user`, `auth`, `warehouse`
- Один файл на один основной тип или группу связанных типов

### Переменные и функции

- **Экспортируемые**: PascalCase: `GetUser`, `UserRepository`
- **Неэкспортируемые**: camelCase: `getUser`, `userRepository`
- **Константы**: PascalCase для экспортируемых, camelCase для неэкспортируемых
- **Имена должны быть описательными**: `u` → `user`, `id` допустимо только если контекст очевиден

### Типы и структуры

- **Экспортируемые типы**: PascalCase: `User`, `OrderItem`
- **Неэкспортируемые**: camelCase: `userCache`, `orderValidator`
- Суффиксы:
  - `Repository` для репозиториев
  - `Service` для сервисов (если используются)
  - `UseCase` для use cases
  - `Handler` для HTTP handlers

```go
// ✅ Правильно
type UserRepository interface {
    GetByID(ctx context.Context, id int64) (*User, error)
}

type CreateUserRequest struct {
    Email    string `json:"email" validate:"required,email"`
    Password string `json:"password" validate:"required,min=8"`
}

// ❌ Неправильно
type userRepo interface {
    get(id int64) *User
}
```

## Форматирование кода

- Используем `gofmt` или `goimports` для форматирования
- Максимальная длина строки: 120 символов
- Вложенность не более 4 уровней

### Структуры

```go
// ✅ Правильно: поля сгруппированы логически
type User struct {
    ID        int64     `json:"id" db:"id"`
    Email     string    `json:"email" db:"email"`
    CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// ✅ Правильно: конструкторы
func NewUser(email, password string) (*User, error) {
    // validation
    return &User{
        Email: email,
    }, nil
}
```

## Обработка ошибок

- **Всегда обрабатываем ошибки**, не игнорируем
- Возвращаем ошибки наверх, не логируем на каждом уровне
- Используем `errors.Is()` и `errors.As()` для проверки ошибок
- Создаем собственные типы ошибок для доменных ошибок

```go
// ✅ Правильно
var (
    ErrUserNotFound = errors.New("user not found")
    ErrInvalidCredentials = errors.New("invalid credentials")
)

func (r *userRepository) GetByID(ctx context.Context, id int64) (*User, error) {
    var user User
    err := r.db.GetContext(ctx, &user, "SELECT * FROM users WHERE id = $1", id)
    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return nil, ErrUserNotFound
        }
        return nil, fmt.Errorf("failed to get user: %w", err)
    }
    return &user, nil
}

// ❌ Неправильно
func (r *userRepository) GetByID(ctx context.Context, id int64) (*User, error) {
    var user User
    err := r.db.GetContext(ctx, &user, "SELECT * FROM users WHERE id = $1", id)
    return &user, err // не обработали случай когда пользователь не найден
}
```

## Контекст

- **Всегда передаем `context.Context`** как первый параметр в функциях, которые делают I/O
- Проверяем отмену контекста в длительных операциях
- Используем `context.WithTimeout` или `context.WithDeadline` для операций с БД

```go
// ✅ Правильно
func (r *userRepository) GetByID(ctx context.Context, id int64) (*User, error) {
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
    
    // ...
}

// ❌ Неправильно
func (r *userRepository) GetByID(id int64) (*User, error) {
    // нет контекста
}
```

## Логирование

- Используем структурированное логирование (zap)
- Уровни логирования: Debug, Info, Warn, Error
- Логируем только на границах слоев (handlers, repositories)
- Не логируем в use cases (если нет специальных требований)

```go
// ✅ Правильно
logger.Info("User created",
    zap.Int64("user_id", user.ID),
    zap.String("email", user.Email),
)

logger.Error("Failed to create user",
    zap.Error(err),
    zap.String("email", email),
)

// ❌ Неправильно
log.Printf("User created: %d", user.ID) // неструктурированное логирование
```

## Тестирование

- Все тесты в файлах с суффиксом `_test.go`
- Используем табличные тесты для множественных сценариев
- Мокируем зависимости через интерфейсы
- Используем testify для assertions

```go
// ✅ Правильно
func TestUserRepository_GetByID(t *testing.T) {
    tests := []struct {
        name    string
        id      int64
        want    *User
        wantErr error
    }{
        {
            name: "success",
            id:   1,
            want: &User{ID: 1, Email: "test@example.com"},
        },
        {
            name:    "not found",
            id:      999,
            wantErr: ErrUserNotFound,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // test implementation
        })
    }
}
```

## Документирование

### Комментарии к функциям

```go
// GetUserByID возвращает пользователя по идентификатору.
// Если пользователь не найден, возвращает ErrUserNotFound.
func (r *userRepository) GetUserByID(ctx context.Context, id int64) (*User, error) {
    // ...
}
```

### Комментарии к типам

```go
// User представляет пользователя системы.
// Содержит базовую информацию для авторизации и профиля.
type User struct {
    // ...
}
```

## Зависимости и интерфейсы

- **Интерфейсы определяем рядом с использованием**, а не с реализацией
- Интерфейсы должны быть маленькими (Interface Segregation Principle)
- Зависимости через конструкторы, не глобальные переменные

```go
// ✅ Правильно: интерфейс в usecase
package usecase

type UserRepository interface {
    GetByID(ctx context.Context, id int64) (*User, error)
}

type CreateUserUseCase struct {
    repo UserRepository
}

// ❌ Неправильно: интерфейс в repository
package repository

type UserRepository interface {
    // ...
}
```

## Безопасность

- **Никогда не логируем пароли, токены, секреты**
- Валидируем все пользовательские входные данные
- Используем prepared statements для SQL запросов
- Хешируем пароли (bcrypt, argon2)

## Производительность

- Избегаем преждевременной оптимизации
- Используем пулы соединений для БД
- Кешируем только при необходимости
- Профилируем перед оптимизацией

## Git коммиты

Используем conventional commits:

```
feat: add user authentication
fix: resolve database connection issue
docs: update API documentation
refactor: improve repository structure
test: add unit tests for user service
```

## Дополнительные инструменты

- `golangci-lint` для линтинга
- `go vet` для статического анализа
- `goimports` для форматирования импортов
- `staticcheck` для дополнительных проверок