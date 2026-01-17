# API для работы с опросником (Onboarding)

## Обзор

Система опросника позволяет:
1. Хранить вопросы на бэкенде
2. Отправлять вопросы фронтенду
3. Получать ответы от пользователя
4. Автоматически создавать заведение на основе ответов

## Endpoints

### 1. Получить вопросы опросника

**GET** `/api/v1/auth/onboarding/questions`

Публичный endpoint (не требует авторизации).

**Response:**
```json
{
  "data": {
    "1": [
      {
        "id": "uuid",
        "key": "establishment_name",
        "type": "text",
        "label": "Название заведения",
        "placeholder": "Например: Кафе Москва",
        "required": true,
        "default_value": "",
        "condition": "",
        "validation": ""
      },
      {
        "id": "uuid",
        "key": "address",
        "type": "text",
        "label": "Адрес заведения",
        "placeholder": "Например: ул. Тверская, д. 1",
        "required": true
      }
    ],
    "2": [
      {
        "id": "uuid",
        "key": "type",
        "type": "select",
        "label": "Какой тип заведения?",
        "required": true,
        "options": [
          {"value": "restaurant", "label": "Ресторан"},
          {"value": "cafe", "label": "Кафе"},
          {"value": "fast_food", "label": "Фаст-фуд"}
        ]
      }
    ],
    "3": [
      {
        "id": "uuid",
        "key": "has_seating_places",
        "type": "boolean",
        "label": "Есть ли сидячие места?",
        "required": true,
        "default_value": "false"
      },
      {
        "id": "uuid",
        "key": "table_count",
        "type": "number",
        "label": "Количество столов",
        "condition": "has_seating_places=true",
        "required": false
      }
    ]
  },
  "steps": 3
}
```

### 2. Отправить ответы опросника

**POST** `/api/v1/auth/onboarding/submit`

Требует авторизации (Bearer token).

**Request:**
```json
{
  "answers": {
    "establishment_name": "Кафе Москва",
    "address": "ул. Тверская, д. 1",
    "phone": "+7 999 123-45-67",
    "email": "info@cafe-moscow.ru",
    "type": "cafe",
    "has_seating_places": true,
    "table_count": 10,
    "has_takeaway": true,
    "has_delivery": false,
    "has_reservations": true
  }
}
```

**Response:**
```json
{
  "message": "onboarding completed successfully",
  "establishment": {
    "id": "uuid",
    "name": "Кафе Москва",
    "address": "ул. Тверская, д. 1",
    "phone": "+7 999 123-45-67",
    "email": "info@cafe-moscow.ru",
    "type": "cafe",
    "has_seating_places": true,
    "table_count": 10,
    "tables": [
      {
        "id": "uuid",
        "number": 1,
        "capacity": 4,
        "status": "available"
      }
    ]
  }
}
```

**Что происходит:**
1. Валидируются обязательные поля
2. Создается `Establishment` с настройками из ответов
3. Если `has_seating_places = true`, создаются столы
4. Сохраняются ответы в `OnboardingResponse`
5. Устанавливается `User.OnboardingCompleted = true`
6. Связывается `User.EstablishmentID` с созданным заведением

### 3. Получить ответы пользователя

**GET** `/api/v1/auth/onboarding/response`

Требует авторизации.

**Response:**
```json
{
  "data": {
    "establishment_name": "Кафе Москва",
    "address": "ул. Тверская, д. 1",
    "type": "cafe",
    "has_seating_places": true,
    "table_count": 10
  },
  "completed": true
}
```

Если пользователь еще не прошел опросник:
```json
{
  "data": null,
  "completed": false
}
```

## Типы вопросов

### text
Обычное текстовое поле.

### email
Поле для email с валидацией.

### phone
Поле для телефона.

### number
Числовое поле.

### boolean
Чекбокс (true/false).

### select
Выпадающий список с вариантами ответов.

## Условные вопросы

Вопросы могут иметь поле `condition`, которое определяет, когда показывать вопрос:

- `"has_seating_places=true"` - показывать только если `has_seating_places` равно `true`
- `"has_delivery=false"` - показывать только если `has_delivery` равно `false`

## Валидация

Обязательные поля проверяются на бэкенде:
- `establishment_name`
- `address`
- `phone`
- `type`
- `has_seating_places`
- `has_takeaway`
- `has_delivery`
- `table_count` (если `has_seating_places = true`)

## Структура данных

### OnboardingQuestion
- Хранит вопросы опросника
- Поддерживает группировку по шагам (`step`)
- Поддерживает условную логику (`condition`)

### OnboardingResponse
- Хранит ответы пользователя
- Связывается с `User` (один к одному)
- Содержит массив `OnboardingAnswer`

### OnboardingAnswer
- Хранит ответ на конкретный вопрос
- Значение хранится как JSON строка для поддержки разных типов

## Seed данные

Для заполнения вопросов опросника используется скрипт:
```bash
go run backend/internal/scripts/seed_onboarding_questions.go
```

Или можно создать миграцию для автоматического заполнения при инициализации БД.
