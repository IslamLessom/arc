# OpenAPI/Swagger Documentation

## Установка

Для генерации Swagger документации используется `swag`:

```bash
go install github.com/swaggo/swag/cmd/swag@latest
```

## Генерация документации

```bash
cd backend
swag init -g cmd/api/main.go
```

Это создаст файлы в директории `docs/`:
- `swagger.json`
- `swagger.yaml`
- `docs.go`

## Использование в коде

Для добавления Swagger аннотаций к handlers используйте комментарии:

```go
// @Summary Создать ингредиент
// @Description Создает новый ингредиент и автоматически создает остатки на складе
// @Tags ingredients
// @Accept json
// @Produce json
// @Param ingredient body CreateIngredientRequest true "Данные ингредиента"
// @Success 201 {object} models.Ingredient
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /menu/ingredients [post]
// @Security Bearer
func (h *MenuHandler) CreateIngredient(c *gin.Context) {
    // ...
}
```

## Интеграция с Gin

Для отображения Swagger UI добавьте в router:

```go
import (
    swaggerFiles "github.com/swaggo/files"
    ginSwagger "github.com/swaggo/gin-swagger"
    _ "github.com/yourusername/arc/backend/docs" // импорт сгенерированной документации
)

// В NewRouter:
router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
```

## Доступ к документации

После запуска сервера документация будет доступна по адресу:
- Swagger UI: `http://localhost:8080/swagger/index.html`
- JSON: `http://localhost:8080/swagger/doc.json`
- YAML: `http://localhost:8080/swagger/doc.yaml`

## Основные аннотации

### Endpoint аннотации:
- `@Summary` - краткое описание
- `@Description` - подробное описание
- `@Tags` - группа endpoints
- `@Accept` - принимаемый Content-Type
- `@Produce` - возвращаемый Content-Type
- `@Param` - параметры запроса
- `@Success` - успешный ответ
- `@Failure` - ошибки
- `@Router` - путь и метод
- `@Security` - требования безопасности

### Примеры параметров:
```go
// Query параметр
// @Param category_id query string false "ID категории"

// Path параметр
// @Param id path string true "ID ингредиента"

// Body параметр
// @Param ingredient body CreateIngredientRequest true "Данные ингредиента"
```

## Фильтрация

Все endpoints списков поддерживают фильтрацию через query параметры:

- `category_id` - фильтр по категории
- `workshop_id` - фильтр по цеху
- `search` - поиск по названию
- `active` - фильтр по активности (true/false)
- `unit` - фильтр по единице измерения (только для ингредиентов)

Пример:
```
GET /api/v1/menu/ingredients?category_id=123&search=мука&active=true
```
