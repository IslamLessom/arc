# API Documentation

## База URL

```
http://localhost:8080/api/v1
```

## Аутентификация

Большинство endpoints требуют JWT токен в заголовке:

```
Authorization: Bearer <token>
```

## Endpoints

### Авторизация

#### POST /auth/login

Вход в систему.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/refresh

Обновление токена.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/logout

Выход из системы. Требует аутентификации.

---

### Заведения (Establishments)

#### GET /establishments

Получить список заведений.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Ресторан Москва",
      "address": "ул. Тверская, 1",
      "phone": "+7 (495) 123-45-67",
      "active": true
    }
  ]
}
```

#### GET /establishments/:id

Получить заведение по ID.

#### POST /establishments

Создать заведение.

#### PUT /establishments/:id

Обновить заведение.

#### DELETE /establishments/:id

Удалить заведение.

---

### Меню

#### GET /menu/products

Получить список товаров.

#### GET /menu/tech-cards

Получить список тех-карт.

#### GET /menu/ingredients

Получить список ингредиентов.

#### GET /menu/semi-finished

Получить список полуфабрикатов.

---

### Склад

#### GET /warehouse/stock

Получить остатки на складе.

#### POST /warehouse/supplies

Создать поставку.

**Request:**
```json
{
  "warehouse_id": 1,
  "supplier_id": 1,
  "items": [
    {
      "ingredient_id": 1,
      "quantity": 10.5,
      "unit": "кг",
      "price": 500.0
    }
  ]
}
```

#### POST /warehouse/write-offs

Создать списание товаров.

#### GET /warehouse/movements

Получить перемещения товаров.

---

### Финансы

#### GET /finance/transactions

Получить список транзакций.

#### GET /finance/shifts

Получить кассовые смены.

#### GET /finance/pnl

Получить Profit & Loss отчет.

**Query parameters:**
- `from` - дата начала (ISO 8601)
- `to` - дата окончания (ISO 8601)

#### GET /finance/cash-flow

Получить Cash Flow отчет.

---

### Статистика

#### GET /statistics/sales

Получить статистику продаж.

#### GET /statistics/products

Получить статистику по товарам.

#### GET /statistics/abc-analysis

Получить ABC анализ товаров.

---

### Заказы

#### GET /orders

Получить список заказов.

#### GET /orders/:id

Получить заказ по ID.

#### POST /orders

Создать заказ.

**Request:**
```json
{
  "establishment_id": 1,
  "table_number": 5,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 500.0
    },
    {
      "tech_card_id": 1,
      "quantity": 1,
      "price": 750.0
    }
  ]
}
```

#### PUT /orders/:id

Обновить заказ.

#### POST /orders/:id/pay

Оплатить заказ.

---

## Коды ошибок

- `400` - Bad Request (невалидные данные)
- `401` - Unauthorized (требуется аутентификация)
- `403` - Forbidden (недостаточно прав)
- `404` - Not Found (ресурс не найден)
- `500` - Internal Server Error (внутренняя ошибка)

## Формат ошибок

```json
{
  "error": "описание ошибки",
  "details": {
    "field": "сообщение об ошибке поля"
  }
}
```