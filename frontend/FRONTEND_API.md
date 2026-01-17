# API Документация для фронтенд-разработчиков

## Базовый URL
```
http://localhost:8080/api/v1
```

## Аутентификация

Все защищенные эндпоинты требуют JWT токен в заголовке:
```
Authorization: Bearer <access_token>
```

---

## 1. Аутентификация и Onboarding

### 1.1. Регистрация

**POST** `/auth/register`

Создание нового пользователя.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "Иван Иванов"
}
```

**Response:** `201 Created`
```json
{
  "message": "user registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Иван Иванов"
  }
}
```

---

### 1.2. Вход в систему

**POST** `/auth/login`

Авторизация пользователя. Возвращает access и refresh токены.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Иван Иванов",
    "establishment_id": "uuid",
    "onboarding_completed": true
  }
}
```

**Логика:**
- Если `onboarding_completed = false`, пользователю нужно пройти onboarding
- После успешного логина сохраняйте `access_token` в localStorage/sessionStorage
- Используйте `refresh_token` для обновления токенов

---

### 1.3. Обновление токена

**POST** `/auth/refresh`

Обновление access токена по refresh токену.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "access_token": "новый_access_token",
  "refresh_token": "новый_refresh_token"
}
```

**Важно:** Обновляйте токены автоматически перед истечением срока действия.

---

### 1.4. Выход из системы

**POST** `/auth/logout`

Выход пользователя. Требует авторизации.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "message": "logged out successfully"
}
```

---

### 1.5. Onboarding - Получить вопросы

**GET** `/auth/onboarding/questions`

Получить список вопросов для onboarding (публичный endpoint).

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "question_text": "Название вашего заведения",
      "question_type": "text",
      "required": true,
      "order": 1
    },
    {
      "id": "uuid",
      "question_text": "Тип заведения",
      "question_type": "select",
      "options": ["restaurant", "cafe", "fast_food", "bar"],
      "required": true,
      "order": 2
    },
    {
      "id": "uuid",
      "question_text": "Есть ли сидячие места?",
      "question_type": "boolean",
      "required": true,
      "order": 3
    },
    {
      "id": "uuid",
      "question_text": "Количество столов",
      "question_type": "number",
      "required": false,
      "depends_on": {
        "question_id": "uuid",
        "value": true
      },
      "order": 4
    }
  ]
}
```

---

### 1.6. Onboarding - Отправить ответы

**POST** `/auth/onboarding/submit`

Отправка ответов на вопросы onboarding. Требует авторизации.

**Request Body:**
```json
{
  "answers": {
    "establishment_name": "Ресторан Москва",
    "type": "restaurant",
    "has_seating_places": true,
    "table_count": 10,
    "address": "ул. Тверская, 1",
    "phone": "+7 (495) 123-45-67",
    "email": "info@restaurant.ru"
  }
}
```

**Response:** `200 OK`
```json
{
  "message": "onboarding completed",
  "establishment": {
    "id": "uuid",
    "name": "Ресторан Москва",
    "address": "ул. Тверская, 1",
    "phone": "+7 (495) 123-45-67",
    "email": "info@restaurant.ru",
    "type": "restaurant",
    "has_seating_places": true,
    "table_count": 10,
    "tables": [
      {
        "id": "uuid",
        "number": 1,
        "capacity": 4,
        "position_x": 0,
        "position_y": 0,
        "status": "available"
      }
      // ... еще 9 столов
    ]
  }
}
```

**Логика:**
- После отправки ответов автоматически создается заведение
- Если `has_seating_places = true`, автоматически создаются столы
- Пользователю присваивается `establishment_id`
- `onboarding_completed` становится `true`

---

### 1.7. Onboarding - Получить ответы пользователя

**GET** `/auth/onboarding/response`

Получить сохраненные ответы пользователя. Требует авторизации.

**Response:** `200 OK`
```json
{
  "data": {
    "answers": {
      "establishment_name": "Ресторан Москва",
      "type": "restaurant",
      // ...
    }
  }
}
```

---

## 2. Заведения (Establishments)

**Важно:** Все операции с заведениями требуют авторизации и проверки доступа через `RequireEstablishment` middleware.

### 2.1. Получить список заведений

**GET** `/establishments`

Получить заведение текущего пользователя (обычно возвращает 0 или 1 элемент).

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "owner_id": "uuid",
      "name": "Ресторан Москва",
      "address": "ул. Тверская, 1",
      "phone": "+7 (495) 123-45-67",
      "email": "info@restaurant.ru",
      "type": "restaurant",
      "has_seating_places": true,
      "table_count": 10,
      "active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 2.2. Получить заведение по ID

**GET** `/establishments/:id`

Получить информацию о конкретном заведении.

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "name": "Ресторан Москва",
    // ... остальные поля
  }
}
```

**Ошибка:** `403 Forbidden` - если пытаетесь получить не свое заведение

---

### 2.3. Обновить заведение

**PUT** `/establishments/:id`

Обновить информацию о заведении. Можно передать только изменяемые поля.

**Request Body:**
```json
{
  "name": "Новое название",
  "address": "Новый адрес",
  "phone": "+7 (495) 999-99-99",
  "email": "new@restaurant.ru",
  "type": "cafe",
  "has_seating_places": false,
  "table_count": null,
  "active": true
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "name": "Новое название",
    // ... обновленные поля
  }
}
```

**Важно:** `POST /establishments` не используется - заведение создается при onboarding.

---

## 3. Меню

Все эндпоинты меню требуют авторизации и принадлежности к заведению.

### 3.1. Товары (Products)

#### Получить список товаров

**GET** `/menu/products`

Получить список товаров с фильтрацией.

**Query Parameters:**
- `search` - поиск по названию
- `category_id` - фильтр по категории
- `workshop_id` - фильтр по цеху
- `active` - фильтр по активности (true/false)

**Пример:** `/menu/products?search=салат&category_id=uuid&active=true`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "establishment_id": "uuid",
      "category_id": "uuid",
      "category": {
        "id": "uuid",
        "name": "Салаты"
      },
      "name": "Цезарь",
      "description": "Салат цезарь с курицей",
      "cover_image": "https://example.com/image.jpg",
      "is_weighted": false,
      "exclude_from_discounts": false,
      "has_modifications": false,
      "barcode": "1234567890",
      "cost_price": 150.0,
      "markup": 100.0,
      "price": 300.0,
      "active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### Получить товар по ID

**GET** `/menu/products/:id`

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "name": "Цезарь",
    // ... все поля товара
  }
}
```

---

#### Создать товар

**POST** `/menu/products`

**Request Body:**
```json
{
  "category_id": "uuid",
  "workshop_id": "uuid",
  "name": "Цезарь",
  "description": "Салат цезарь с курицей",
  "cover_image": "https://example.com/image.jpg",
  "is_weighted": false,
  "exclude_from_discounts": false,
  "has_modifications": false,
  "barcode": "1234567890",
  "cost_price": 150.0,
  "markup": 100.0,
  "active": true
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "name": "Цезарь",
    "price": 300.0, // Автоматически рассчитывается: cost_price * (1 + markup/100)
    // ... остальные поля
  }
}
```

**Логика:**
- `price` рассчитывается автоматически: `cost_price * (1 + markup/100)`
- При создании товара автоматически создается запись в остатках (`Stock`) с количеством 0

---

#### Обновить товар

**PUT** `/menu/products/:id`

**Request Body:** (только изменяемые поля)
```json
{
  "name": "Новое название",
  "price": 350.0,
  "markup": 120.0
}
```

**Response:** `200 OK`

---

#### Удалить товар

**DELETE** `/menu/products/:id`

**Response:** `200 OK`
```json
{
  "message": "product deleted"
}
```

**Логика:** Soft delete - товар помечается как удаленный, но остается в БД.

---

### 3.2. Тех-карты (Tech Cards)

#### Получить список тех-карт

**GET** `/menu/tech-cards`

**Query Parameters:**
- `category_id` - фильтр по категории
- `workshop_id` - фильтр по цеху
- `search` - поиск по названию
- `active` - фильтр по активности

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Борщ",
      "category_id": "uuid",
      "workshop_id": "uuid",
      "ingredients": [
        {
          "ingredient_id": "uuid",
          "ingredient": {
            "id": "uuid",
            "name": "Свекла"
          },
          "quantity": 0.5,
          "unit": "кг",
          "loss_percentage": 10.0
        }
      ],
      "active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### Создать тех-карту

**POST** `/menu/tech-cards`

**Request Body:**
```json
{
  "name": "Борщ",
  "category_id": "uuid",
  "workshop_id": "uuid",
  "ingredients": [
    {
      "ingredient_id": "uuid",
      "quantity": 0.5,
      "unit": "кг",
      "loss_percentage": 10.0
    }
  ],
  "active": true
}
```

**Response:** `201 Created`

---

### 3.3. Ингредиенты (Ingredients)

#### Получить список ингредиентов

**GET** `/menu/ingredients`

**Query Parameters:**
- `search` - поиск по названию
- `category_id` - фильтр по категории
- `unit` - фильтр по единице измерения (шт, л, кг)
- `active` - фильтр по активности

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "establishment_id": "uuid",
      "category_id": "uuid",
      "category": {
        "id": "uuid",
        "name": "Овощи"
      },
      "name": "Помидор",
      "unit": "кг",
      "barcode": "1234567890",
      "loss_cleaning": 5.0,
      "loss_boiling": 10.0,
      "loss_frying": 15.0,
      "loss_stewing": 8.0,
      "loss_baking": 12.0,
      "active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### Создать ингредиент

**POST** `/menu/ingredients`

**Request Body:**
```json
{
  "category_id": "uuid",
  "name": "Помидор",
  "unit": "кг",
  "barcode": "1234567890",
  "loss_cleaning": 5.0,
  "loss_boiling": 10.0,
  "loss_frying": 15.0,
  "loss_stewing": 8.0,
  "loss_baking": 12.0,
  "active": true
}
```

**Допустимые единицы измерения:** `шт`, `л`, `кг`

**Response:** `201 Created`

**Логика:** При создании ингредиента можно автоматически создать запись в остатках, если передать дополнительные параметры (реализовано в usecase).

---

### 3.4. Категории (Categories)

#### Получить список категорий товаров

**GET** `/menu/categories`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "establishment_id": "uuid",
      "name": "Салаты",
      "order": 1,
      "active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### Создать категорию

**POST** `/menu/categories`

**Request Body:**
```json
{
  "name": "Салаты",
  "order": 1,
  "active": true
}
```

---

### 3.5. Категории ингредиентов (Ingredient Categories)

**GET** `/menu/ingredient-categories` - список категорий ингредиентов

**POST** `/menu/ingredient-categories` - создать категорию

Аналогично категориям товаров.

---

### 3.6. Полуфабрикаты

**GET** `/menu/semi-finished`

Получить список полуфабрикатов (пока возвращает пустой список).

---

## 4. Склад

Все эндпоинты склада требуют авторизации и принадлежности к заведению.

### 4.1. Склады (Warehouses)

#### Получить список складов

**GET** `/warehouses`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "establishment_id": "uuid",
      "name": "Склад 1",
      "address": "ул. Складская, 1",
      "active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### Создать склад

**POST** `/warehouses`

**Request Body:**
```json
{
  "name": "Склад 1",
  "address": "ул. Складская, 1"
}
```

**Response:** `201 Created`

---

#### Обновить склад

**PUT** `/warehouses/:id`

**Request Body:**
```json
{
  "name": "Новое название",
  "address": "Новый адрес",
  "active": true
}
```

---

#### Удалить склад

**DELETE** `/warehouses/:id`

**Response:** `200 OK`
```json
{
  "message": "warehouse deleted"
}
```

---

### 4.2. Остатки (Stock)

#### Получить остатки

**GET** `/warehouse/stock`

Получить список остатков с фильтрацией.

**Query Parameters:**
- `warehouse_id` - фильтр по складу
- `search` - поиск по названию ингредиента/товара
- `type` - фильтр по типу: `"ingredient"` или `"product"`
- `category_id` - фильтр по категории

**Примеры:**
- `/warehouse/stock` - все остатки
- `/warehouse/stock?warehouse_id=uuid` - остатки на конкретном складе
- `/warehouse/stock?type=ingredient&search=томат` - только ингредиенты с поиском
- `/warehouse/stock?category_id=uuid` - по категории

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "warehouse_id": "uuid",
      "warehouse": {
        "id": "uuid",
        "name": "Склад 1"
      },
      "ingredient_id": "uuid",
      "ingredient": {
        "id": "uuid",
        "name": "Помидор",
        "category": {
          "id": "uuid",
          "name": "Овощи"
        }
      },
      "product_id": null,
      "product": null,
      "quantity": 100.5,
      "unit": "кг",
      "price_per_unit": 0.20,
      "limit": 10.0,
      "updated_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "warehouse_id": "uuid",
      "product_id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Цезарь",
        "category": {
          "id": "uuid",
          "name": "Салаты"
        }
      },
      "ingredient_id": null,
      "ingredient": null,
      "quantity": 50.0,
      "unit": "шт",
      "price_per_unit": 300.0,
      "limit": 5.0,
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Логика:**
- Остаток может быть для ингредиента (`ingredient_id`) или товара (`product_id`)
- `price_per_unit` - себестоимость за единицу измерения
- `limit` - минимальный остаток (можно редактировать)
- **Сумма** вычисляется на фронтенде: `quantity * price_per_unit`

---

#### Обновить лимит остатка

**PUT** `/warehouse/stock/:id/limit`

Обновить только лимит остатка.

**Request Body:**
```json
{
  "limit": 20.0
}
```

**Response:** `200 OK`
```json
{
  "message": "stock limit updated"
}
```

---

### 4.3. Поставки (Supplies)

#### Получить поставки по ингредиенту/товару

**GET** `/warehouse/supplies`

Получить список поставок, содержащих конкретный ингредиент или товар.

**Query Parameters:**
- `ingredient_id` - фильтр по ингредиенту
- `product_id` - фильтр по товару

**Примеры:**
- `/warehouse/supplies?ingredient_id=uuid` - поставки с конкретным ингредиентом
- `/warehouse/supplies?product_id=uuid` - поставки с конкретным товаром

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "warehouse_id": "uuid",
      "warehouse": {
        "id": "uuid",
        "name": "Склад 1"
      },
      "supplier_id": "uuid",
      "supplier": {
        "id": "uuid",
        "name": "Закупка"
      },
      "delivery_date_time": "2024-01-16T21:34:00Z",
      "status": "completed",
      "comment": "Поставка помидоров",
      "items": [
        {
          "id": "uuid",
          "ingredient_id": "uuid",
          "ingredient": {
            "id": "uuid",
            "name": "Помидор"
          },
          "product_id": null,
          "product": null,
          "quantity": 100.0,
          "unit": "кг",
          "price_per_unit": 0.20,
          "total_amount": 20.0,
          "created_at": "2024-01-16T21:34:00Z"
        }
      ],
      "created_at": "2024-01-16T21:34:00Z",
      "updated_at": "2024-01-16T21:34:00Z"
    }
  ]
}
```

**Логика:**
- Поставки отсортированы по дате поставки (DESC - самые новые первыми)
- Каждая поставка содержит полную информацию о поставщике, складе и позициях

---

#### Создать поставку

**POST** `/warehouse/supplies`

**Request Body:**
```json
{
  "warehouse_id": "uuid",
  "supplier_id": "uuid",
  "delivery_date_time": "2024-01-17T23:20:00Z",
  "status": "completed",
  "comment": "Поставка овощей",
  "items": [
    {
      "ingredient_id": "uuid",
      "quantity": 100.0,
      "unit": "кг",
      "price_per_unit": 0.20,
      "total_amount": 20.0
    },
    {
      "product_id": "uuid",
      "quantity": 50.0,
      "unit": "шт",
      "price_per_unit": 300.0,
      "total_amount": 15000.0
    }
  ]
}
```

**Поля:**
- `delivery_date_time` - **обязательно**, формат RFC3339 (ISO 8601)
- `status` - опционально, по умолчанию `"completed"` (может быть: `"pending"`, `"completed"`, `"cancelled"`)
- `comment` - опционально
- `items` - массив позиций, **обязательно минимум 1**
- В каждом `item` обязательно указать `ingredient_id` **или** `product_id`
- Если передать только `total_amount`, `price_per_unit` вычисляется автоматически
- Если передать только `price_per_unit`, `total_amount` вычисляется автоматически

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "warehouse_id": "uuid",
    "supplier_id": "uuid",
    "delivery_date_time": "2024-01-17T23:20:00Z",
    "status": "completed",
    "comment": "Поставка овощей",
    "items": [
      // ... позиции
    ],
    "created_at": "2024-01-17T23:20:00Z"
  }
}
```

**Логика:**
- При создании поставки автоматически увеличиваются остатки на складе
- Если остатка нет, создается новая запись
- Обновляется `price_per_unit` в остатках

---

### 4.4. Списания (Write-offs)

#### Создать списание

**POST** `/warehouse/write-offs`

**Request Body:**
```json
{
  "warehouse_id": "uuid",
  "write_off_date_time": "2024-01-17T22:21:00Z",
  "reason": "Порча",
  "comment": "Испорченные помидоры",
  "items": [
    {
      "ingredient_id": "uuid",
      "quantity": 5.0,
      "unit": "кг",
      "details": "Испорченные помидоры, просрочка"
    }
  ]
}
```

**Поля:**
- `write_off_date_time` - **обязательно**, формат RFC3339
- `reason` - причина списания
- `comment` - опционально
- `details` - детали для каждого элемента (опционально)

**Response:** `201 Created`

**Логика:**
- При создании списания автоматически уменьшаются остатки
- Проверяется достаточность остатков (нельзя списать больше, чем есть)
- Если остатка недостаточно, возвращается ошибка

---

### 4.5. Поставщики (Suppliers)

#### Получить список поставщиков

**GET** `/warehouse/suppliers`

**Query Parameters:**
- `search` - поиск по имени, контакту, телефону, email
- `active` - фильтр по активности (true/false)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "establishment_id": "uuid",
      "name": "Закупка",
      "taxpayer_number": "123456789012",
      "phone": "+7 (495) 123-45-67",
      "address": "ул. Поставщиков, 1",
      "comment": "Основной поставщик овощей",
      "contact": "Иван Петров",
      "email": "supplier@example.com",
      "active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### Создать поставщика

**POST** `/warehouse/suppliers`

**Request Body:**
```json
{
  "name": "Закупка",
  "taxpayer_number": "123456789012",
  "phone": "+7 (495) 123-45-67",
  "address": "ул. Поставщиков, 1",
  "comment": "Основной поставщик овощей",
  "contact": "Иван Петров",
  "email": "supplier@example.com"
}
```

**Response:** `201 Created`

---

#### Обновить поставщика

**PUT** `/warehouse/suppliers/:id`

**Request Body:** (только изменяемые поля)
```json
{
  "name": "Новое название",
  "phone": "+7 (495) 999-99-99",
  "active": false
}
```

---

#### Удалить поставщика

**DELETE** `/warehouse/suppliers/:id`

**Response:** `200 OK`

---

## Общие замечания

### Ошибки

**Формат ошибок:**
```json
{
  "error": "описание ошибки"
}
```

**Коды статусов:**
- `200` - OK (успешно)
- `201` - Created (ресурс создан)
- `400` - Bad Request (невалидные данные)
- `401` - Unauthorized (требуется авторизация)
- `403` - Forbidden (доступ запрещен)
- `404` - Not Found (ресурс не найден)
- `500` - Internal Server Error (ошибка сервера)

### Форматы дат

Все даты и время передаются в формате **RFC3339 (ISO 8601)**:
```
2024-01-17T23:20:00Z
2024-01-17T23:20:00+03:00
```

### Изоляция данных

- Все данные изолированы по заведениям
- Пользователь видит только данные своего заведения
- `establishment_id` передается автоматически через middleware
- Не нужно передавать `establishment_id` в запросах

### Пагинация

В текущей версии пагинация не реализована. Все списки возвращают все записи. При необходимости можно добавить фильтрацию через query параметры.

### Обновление токенов

Рекомендуется реализовать автоматическое обновление токенов:
1. Перехватывать ответы `401 Unauthorized`
2. Использовать `refresh_token` для получения нового `access_token`
3. Повторять исходный запрос с новым токеном
