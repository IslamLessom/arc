# Поток регистрации и onboarding

## Текущая структура и проблемы

### Что отсутствует:
1. ❌ Нет модели SubscriptionPlan (тарифы)
2. ❌ Нет модели Subscription (подписки пользователей)
3. ❌ Нет endpoint для регистрации
4. ❌ Нет endpoint для опросника
5. ❌ Нет автоматического создания подписки
6. ❌ Нет проверки подписки при доступе
7. ❌ Нет связи User -> Establishment (один к одному)
8. ❌ Нет отслеживания состояния onboarding

## Предлагаемый flow

### 1. Регистрация пользователя
```
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Иван Иванов"
}
```

**Что происходит:**
- Создается пользователь
- Автоматически создается подписка на бесплатный тариф (14 дней)
- Устанавливается OnboardingCompleted = false
- Возвращается access_token и refresh_token

### 2. Прохождение опросника
```
POST /api/v1/auth/onboarding
{
  "establishment_name": "Мой ресторан",
  "address": "ул. Примерная, 1",
  "phone": "+7 999 123-45-67",
  "type": "restaurant",
  "has_seating_places": true,
  "table_count": 10,
  "has_delivery": true,
  "has_takeaway": true
}
```

**Что происходит:**
- Создается Establishment с настройками из опросника
- Если has_seating_places = true, создаются столы
- Устанавливается OnboardingCompleted = true
- User связывается с Establishment

### 3. Проверка подписки
- Middleware проверяет активную подписку перед доступом к защищенным endpoints
- Если подписка истекла - возвращается 403 Forbidden

## Модели данных

### SubscriptionPlan
```go
type SubscriptionPlan struct {
    ID          uuid.UUID
    Name        string  // "Free Trial", "Basic", "Pro", "Business"
    Duration    int     // Длительность в днях (14 для trial)
    Price       float64 // 0 для бесплатного
    Features    []string // Список доступных функций
    Active      bool
}
```

### Subscription
```go
type Subscription struct {
    ID              uuid.UUID
    UserID          uuid.UUID
    PlanID          uuid.UUID
    StartDate       time.Time
    EndDate         time.Time
    IsActive        bool
    AutoRenew       bool
    CreatedAt       time.Time
}
```

### User (обновления)
```go
type User struct {
    // ... существующие поля
    EstablishmentID *uuid.UUID  // Связь с заведением (один к одному)
    Establishment   *Establishment
    OnboardingCompleted bool    // Прошел ли опросник
    SubscriptionID  *uuid.UUID  // Текущая подписка
    Subscription    *Subscription
}
```

## Endpoints

### Публичные (без авторизации)
- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/login` - Вход

### Защищенные (требуют авторизации)
- `POST /api/v1/auth/onboarding` - Прохождение опросника
- `GET /api/v1/auth/subscription` - Получить информацию о подписке
- `POST /api/v1/auth/subscription/upgrade` - Обновить подписку

## Middleware

### SubscriptionCheck
Проверяет активную подписку перед доступом:
```go
func SubscriptionCheck() gin.HandlerFunc {
    return func(c *gin.Context) {
        userID := c.GetString("user_id")
        // Проверяем подписку
        if !hasActiveSubscription(userID) {
            c.JSON(403, gin.H{"error": "subscription expired"})
            c.Abort()
            return
        }
        c.Next()
    }
}
```

## Логика создания подписки

При регистрации:
1. Создается пользователь
2. Находится план "Free Trial" (14 дней)
3. Создается Subscription:
   - StartDate = now()
   - EndDate = now() + 14 days
   - IsActive = true
4. User.SubscriptionID устанавливается

## Проверка подписки

При каждом запросе:
1. Получаем User по user_id из токена
2. Проверяем Subscription.EndDate > now()
3. Если истекла - блокируем доступ
