# Миграция на UUID

Все модели теперь используют UUID вместо int64 для ID.

## Изменения

- Все `ID int64` заменены на `ID uuid.UUID`
- Все foreign keys (`*ID int64`) заменены на `*ID uuid.UUID`
- Репозитории обновлены для работы с UUID
- Handlers обновлены для парсинга UUID из URL параметров

## Библиотека

Используется `github.com/google/uuid` версии 1.5.0

## GORM настройка

GORM автоматически генерирует UUID через PostgreSQL функцию `gen_random_uuid()`:
```go
gorm:"type:uuid;primaryKey;default:gen_random_uuid()"
```

## Пример использования

```go
import "github.com/google/uuid"

// Создание нового UUID
id := uuid.New()

// Парсинг UUID из строки
id, err := uuid.Parse("123e4567-e89b-12d3-a456-426614174000")

// Проверка на nil UUID
if id == uuid.Nil {
    // UUID не установлен
}
```