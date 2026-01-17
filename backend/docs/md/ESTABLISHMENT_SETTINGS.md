# Настройки заведения и опросник

## Обзор

При регистрации заведения владелец заполняет опросник, который определяет функциональность PWA приложения для этого заведения.

## Структура опросника

### Основные вопросы

1. **Есть ли сидячие места?** (`has_seating_places`)
   - `true` - в PWA будут доступны столы
   - `false` - в PWA будет только список товаров для быстрой продажи

2. **Количество столов** (`table_count`)
   - Заполняется только если `has_seating_places = true`
   - Определяет количество автоматически создаваемых столов

3. **Тип заведения** (`type`)
   - `restaurant` - ресторан
   - `cafe` - кафе
   - `fast_food` - фаст-фуд
   - `bar` - бар
   - `takeaway` - на вынос
   - `delivery` - доставка

## Влияние на PWA

### Если `has_seating_places = false`

В PWA приложении:
- **Нет** интерфейса выбора столов
- Отображается **список товаров в ряд** для быстрой продажи
- Заказы создаются **без указания стола** (`table_number = null`)
- Фокус на **быстром обслуживании клиентов**

Пример потока:
```
Выбор сотрудника → Открытие смены → Список товаров → Формирование заказа → Оплата
```

### Если `has_seating_places = true`

В PWA приложении:
- Отображаются **столы визуально на планшете**
- Каждый стол имеет статус: `available`, `occupied`, `reserved`
- Заказы привязываются к столу (`table_number`)
- Можно создавать заказы для разных столов

Пример потока:
```
Выбор сотрудника → Открытие смены → Выбор стола → Список товаров → Формирование заказа → Переход к выбору стола (если есть другие столики)
```

## Модель данных

### Establishment

```go
type Establishment struct {
    ID              int64
    Name            string
    HasSeatingPlaces bool  // Ключевое поле для логики PWA
    TableCount       *int  // Количество столов
    Type            string
    Tables          []Table
    // ...
}
```

### Table

```go
type Table struct {
    ID              int64
    EstablishmentID int64
    Number          int     // Уникален в рамках заведения
    Name            string
    Capacity        int     // Вместимость
    PositionX       float64 // X координата на схеме зала
    PositionY       float64 // Y координата на схеме зала
    Rotation        float64 // Поворот стола в градусах (0-360)
    Status          string  // available, occupied, reserved
    // ...
}
```

**Координаты столов:**
- `PositionX`, `PositionY` - координаты для визуального расположения на схеме зала
- Могут быть в пикселях (если фиксированный размер схемы) или процентах (если адаптивная схема)
- При создании заведения столы создаются с координатами (0, 0)
- Администратор расставляет столы визуально через интерфейс админ-панели
- Координаты сохраняются и используются в PWA для отображения столов на планшете

## API Endpoints

### Получение настроек заведения

```
GET /api/v1/establishments/:id
```

Ответ включает настройки:
```json
{
  "id": 1,
  "name": "Кафе Москва",
  "has_seating_places": true,
  "table_count": 10,
  "type": "cafe",
  "tables": [
    {
      "id": 1,
      "number": 1,
      "capacity": 4,
      "status": "available"
    }
  ]
}
```

### Создание заведения с опросником

```
POST /api/v1/establishments
```

Запрос:
```json
{
  "name": "Кафе Москва",
  "address": "ул. Тверская, 1",
  "has_seating_places": true,
  "table_count": 10,
  "type": "cafe"
}
```

При создании заведения с `has_seating_places = true` и указанным `table_count`, автоматически создаются таблицы с номерами от 1 до `table_count`.

### Управление столами

```
GET /api/v1/establishments/:id/tables     # Список столов с координатами
GET /api/v1/tables/:id                     # Детали стола
PUT /api/v1/tables/:id/status              # Изменить статус стола
PUT /api/v1/tables/:id/position            # Изменить позицию стола на схеме
```

**Изменение позиции стола:**
```json
PUT /api/v1/tables/:id/position
{
  "position_x": 150.5,
  "position_y": 200.3,
  "rotation": 45
}
```

Это позволяет администратору расставлять столы визуально на схеме зала в админ-панели, а затем эти координаты используются в PWA для отображения столов на планшете.

## Логика в Use Cases

### Создание заведения

```go
func (uc *EstablishmentUseCase) Create(ctx context.Context, req CreateEstablishmentRequest) (*models.Establishment, error) {
    // Создаем заведение
    establishment := &models.Establishment{
        Name: req.Name,
        HasSeatingPlaces: req.HasSeatingPlaces,
        TableCount: req.TableCount,
        Type: req.Type,
    }
    
    // Если есть сидячие места, создаем столы
    if req.HasSeatingPlaces && req.TableCount != nil {
        tables := make([]*models.Table, 0, *req.TableCount)
        for i := 1; i <= *req.TableCount; i++ {
            tables = append(tables, &models.Table{
                EstablishmentID: establishment.ID,
                Number: i,
                Capacity: 4, // по умолчанию
                Status: "available",
            })
        }
        // Создаем столы
        uc.tableRepo.CreateBatch(ctx, tables)
    }
    
    return establishment, nil
}
```

### Получение заведения с учетом настроек

При получении заведения для PWA нужно проверить `has_seating_places`:
- Если `true` - возвращать также список столов
- Если `false` - возвращать только товары/тех-карты

## Примеры использования

### Сценарий 1: Кафе с столиками

```json
{
  "has_seating_places": true,
  "table_count": 15
}
```

PWA покажет:
- 15 столов на планшете, расположенных согласно координатам из базы
- Визуальная схема зала с расположением столов
- Выбор стола перед созданием заказа
- Статусы столов (свободен/занят) с визуальной индикацией
- Столы можно перетаскивать и поворачивать в админ-панели для настройки схемы

### Сценарий 2: Фаст-фуд на вынос

```json
{
  "has_seating_places": false,
  "type": "fast_food"
}
```

PWA покажет:
- Список товаров в ряд
- Быстрое формирование заказа
- Без привязки к столу