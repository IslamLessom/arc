# Текущая логика и что нужно реализовать

> **Обновлено:** реализованы категории, заведения (List/Get/Update), склады, поставщики, остатки, поставки и списания. Финансы и статистика не трогаем.

## Как сейчас работает логика

### 1. Авторизация и onboarding ✅

**Поток:**
```
POST /auth/register → User + Subscription (Free Trial 14 дн) + JWT
POST /auth/login → JWT (access + refresh)
POST /auth/refresh → новые JWT
POST /auth/logout → токен в blacklist

GET /auth/onboarding/questions → вопросы опросника (публично)
POST /auth/onboarding/submit → создание Establishment + Tables (если has_seating) + сохранение ответов
GET /auth/onboarding/response → ответы пользователя
```

**Middleware:**
- `Auth` — проверка JWT, blacklist, `user_id` и `email` в контекст
- `RequireEstablishment` — `User.EstablishmentID` в контекст как `establishment_id`; 403, если нет заведения
- `SubscriptionCheck` — есть, но **не подключён** к роутеру

---

### 2. Меню (товары, тех-карты, ингредиенты) ✅

**Роуты:** `/api/v1/menu/*` — все с `RequireEstablishment`.

| Сущность   | List | Get | Create | Update | Delete |
|-----------|------|-----|--------|--------|--------|
| Products  | ✅   | ✅  | ✅     | ✅     | ✅     |
| TechCards | ✅   | ✅  | ✅     | ✅     | ✅     |
| Ingredients | ✅ | ✅  | ✅     | ✅     | ✅     |

- Везде: `establishment_id` из контекста, фильтрация и проверка заведения.
- **GetSemiFinished** — TODO, возвращает `[]`.

---

### 3. Заведения (Establishments) ⚠️

**Роуты:** `/api/v1/establishments` — только `Auth`, **без** `RequireEstablishment`.

| Метод | Handler | UseCase | Репозиторий |
|-------|---------|---------|-------------|
| List  | TODO, `[]` | — | `List()` есть |
| Get   | TODO, `{id}` | — | `GetByID()` есть |
| Create| TODO, `created` | — | `Create()` есть; `CreateWithSettings` есть (создание + столы) |
| Update| TODO, `updated` | — | `Update()` есть |
| Delete| TODO, `deleted` | — | `Delete()` есть |

**Не хватает:**
- вызовов use case/repo в handlers;
- фильтрации по пользователю (обычно — только своё заведение, по `user.EstablishmentID`);
- привязки Create к `OwnerID` из JWT.

---

### 4. Склад (Warehouse) ⚠️

**Роуты:** `/api/v1/warehouse/*` — только `Auth`, **без** `RequireEstablishment`.

| Endpoint | Handler | UseCase | Репозиторий |
|----------|---------|---------|-------------|
| GET /stock | TODO, `[]` | методы не вызываются | `GetStock`, `GetStockByWarehouseID` есть |
| POST /supplies | TODO, `supply created` | — | `CreateSupply` есть |
| POST /write-offs | TODO, `write-off created` | — | `CreateWriteOff` есть |
| GET /movements | TODO, `[]` | — | **GetMovements нет** |

**Не хватает:**
- реализации в `WarehouseHandler` с вызовом репозитория/use case;
- фильтрации по заведению (через `Warehouse.EstablishmentID` или `warehouse_id` из складов заведения);
- `GetMovements` в репозитории (или другой источник движений);
- методов в `WarehouseUseCase` (сейчас только структура).

---

### 5. Финансы (Finance) ⚠️

**Роуты:** `/api/v1/finance/*` — только `Auth`, **без** `RequireEstablishment`.

| Endpoint | Handler | UseCase | Репозиторий |
|----------|---------|---------|-------------|
| GET /transactions | TODO, `[]` | — | `List` есть |
| GET /shifts | TODO, `[]` | — | `List` есть |
| GET /pnl | TODO, `{}` | — | — |
| GET /cash-flow | TODO, `{}` | — | — |

**Не хватает:**
- вызовов `TransactionRepository`, `ShiftRepository` в handlers;
- фильтрации по `EstablishmentID` (у `Shift` есть `EstablishmentID`);
- use case для P&L и Cash Flow (агрегация по Transaction/Shift).

---

### 6. Статистика (Statistics) ⚠️

**Роуты:** `/api/v1/statistics/*` — только `Auth`, **без** `RequireEstablishment`.

| Endpoint | Handler | UseCase | Репозиторий |
|----------|---------|---------|-------------|
| GET /sales | TODO, `{}` | — | OrderRepository есть |
| GET /products | TODO, `{}` | — | — |
| GET /abc-analysis | TODO, `{}` | — | — |

**Не хватает:**
- логики в handlers и use case;
- фильтрации по заведению (через заказы/смены);
- формул для продаж, ABC и т.п.

---

### 7. Заказы (Orders) ⚠️

**Роуты:** `/api/v1/orders/*` — только `Auth`, **без** `RequireEstablishment`.

| Метод | Handler | UseCase | Репозиторий |
|-------|---------|---------|-------------|
| List | TODO, `[]` | — | `List` есть |
| Get | TODO, `{}` | — | `GetByID` есть |
| Create | TODO, `created` | — | `Create` есть |
| Update | TODO, `updated` | — | `Update` есть |
| Pay | TODO | — | — |

**Не хватает:**
- вызовов репозитория в handlers;
- бизнес-логики в `OrderUseCase` (создание, смена статуса, Pay);
- `establishment_id` при Create и фильтрации List/Get по заведению.

---

### 8. Инфраструктура и данные

- **Миграции БД:** нет авто-миграций в коде; `establishment_id` и др. новые поля нужно добавлять миграциями.
- **Seed:**
  - `seed_roles_and_subscriptions.go` — есть, в коде TODO «раскомментировать когда будет БД»;
  - `seed_onboarding_questions.go` — есть.
- **SubscriptionCheck:** middleware есть, в `router` не используется.

---

## Что нужно реализовать (по приоритету)

### Высокий приоритет

1. **Establishments (handlers + привязка к user)**  
   - List: фильтр по `user.EstablishmentID` (или `owner_id`).  
   - Get: проверка, что заведение своё.  
   - Create: `OwnerID` из JWT, при необходимости вызов `CreateWithSettings`.  
   - Update/Delete: проверка доступа и вызов репозитория.

2. **Warehouse (handlers + use case + establishment)**  
   - GetStock: фильтр по `warehouse_id` (query) и/или по складам заведения.  
   - CreateSupply / CreateWriteOff: body + `establishment_id`, вызов репо.  
   - GetMovements: либо новый метод в репо (по Supply/WriteOff/Stock и т.п.), либо отчёты на их основе.  
   - Добавить `RequireEstablishment` на группу `/warehouse` и прокидывать `establishment_id`.

3. **Orders (handlers + use case + establishment)**  
   - List/Get: фильтр по `EstablishmentID`.  
   - Create: `EstablishmentID` из контекста, позиции (Product/TechCard), пересчёт `TotalAmount`.  
   - Update: статус, состав.  
   - Pay: смена статуса, при необходимости создание транзакции/привязка к смене.  
   - `RequireEstablishment` на `/orders`.

### Средний приоритет

4. **Finance (handlers + use case + establishment)**  
   - GetTransactions: фильтр по сменам заведения (или по `establishment_id` через Shift).  
   - GetShifts: фильтр по `EstablishmentID`.  
   - GetPNL / GetCashFlow: агрегация по Transaction/Shift.  
   - `RequireEstablishment` на `/finance`.

5. **Statistics (handlers + use case + establishment)**  
   - GetSales, GetProducts, GetABCAnalysis: расчёты по Order (и при необходимости по сменам) с фильтром по заведению.  
   - `RequireEstablishment` на `/statistics`.

### Низкий приоритет / точечные доработки

6. **GetSemiFinished** (`/menu/semi-finished`)  
   - Определить, что считается «полуфабрикатом» (например, тех-карты без продукта или флаг), и вернуть список.

7. **SubscriptionCheck**  
   - Подключить к `protected` или к нужным группам и возвращать 403 при неактивной подписке.

8. **CRUD складов (Warehouses)**  
   - Сейчас склады задаются `warehouse_id` извне. При необходимости: List/Create/Update/Delete складов с `EstablishmentID` и `RequireEstablishment`.

9. **Миграции и seed**  
   - Миграции для `establishment_id` и новых таблиц.  
   - Запуск seed (роли, тарифы, вопросы) при первом старте или отдельной командой.

---

## Сводка: что уже есть и что заглушки

| Модуль       | Repo (реализация) | UseCase (логика) | Handler (вызовы) | Establishment |
|-------------|--------------------|------------------|------------------|---------------|
| Auth        | ✅                 | ✅               | ✅               | —             |
| Onboarding  | ✅                 | ✅               | ✅               | —             |
| Menu        | ✅                 | ✅               | ✅               | ✅            |
| Establishment | ✅               | ✅ (CreateWithSettings) | ❌ TODO  | ⚠️ нужно     |
| Warehouse   | ✅ (нет GetMovements) | ❌ пустой  | ❌ TODO          | ❌            |
| Finance     | ✅                 | ❌ пустой        | ❌ TODO          | ❌            |
| Statistics  | — (Order)          | ❌ пустой        | ❌ TODO          | ❌            |
| Order       | ✅                 | ❌ пустой        | ❌ TODO          | ❌            |

---

## Рекомендуемый порядок реализации

1. **Establishment** — handlers вызывают repo + use case, фильтр по `user.EstablishmentID` / `OwnerID`.  
2. **Warehouse** — GetStock, CreateSupply, CreateWriteOff в handlers + use case; при необходимости GetMovements в repo.  
3. **Order** — полный CRUD + Pay, `EstablishmentID`, use case.  
4. **Finance** — GetTransactions, GetShifts, затем P&L и Cash Flow.  
5. **Statistics** — отчёты по заказам/сменам.  
6. **RequireEstablishment** для warehouse, orders, finance, statistics.  
7. **SubscriptionCheck** в роутер.  
8. **GetSemiFinished** и, при необходимости, CRUD складов и миграции/seed.
