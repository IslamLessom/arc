# Готовый flow: регистрация → опросник → категории → склад → меню

## Что реализовано для «главного функционала»

### 1. Авторизация ✅
- `POST /api/v1/auth/register` — регистрация, создание User + Subscription (Free Trial 14 дней)
- `POST /api/v1/auth/login` — логин, JWT (access + refresh)
- `POST /api/v1/auth/refresh` — обновление токенов
- `POST /api/v1/auth/logout` — выход, токен в blacklist

### 2. Onboarding (создание заведения) ✅
- `GET /api/v1/auth/onboarding/questions` — вопросы опросника
- `POST /api/v1/auth/onboarding/submit` — ответы → **создание Establishment** + Tables (если есть сидячие места), привязка к User
- `GET /api/v1/auth/onboarding/response` — ответы пользователя

**Заведение создаётся только здесь.** Отдельного «Create Establishment» нет — только просмотр и редактирование.

### 3. Заведения (просмотр/редактирование) ✅
- `GET /api/v1/establishments` — список «моё заведение» (0 или 1 элемент)
- `GET /api/v1/establishments/:id` — просмотр (только своего)
- `PUT /api/v1/establishments/:id` — обновление (имя, адрес, телефон, тип и т.д.)
- `POST /api/v1/establishments` — **400**: «Establishment is created during onboarding»
- `DELETE /api/v1/establishments/:id` — **400**: «Deletion of establishment is not allowed»

Все роуты с `RequireEstablishment` (onboarding должен быть пройден).

### 4. Категории для меню ✅

**Категории товаров/тех-карт** (`type`: product, tech_card, semi_finished):
- `GET /api/v1/menu/categories` — список (query: `type`, `search`)
- `GET /api/v1/menu/categories/:id`
- `POST /api/v1/menu/categories` — `{"name","type"}`
- `PUT /api/v1/menu/categories/:id`
- `DELETE /api/v1/menu/categories/:id`

**Категории ингредиентов:**
- `GET /api/v1/menu/ingredient-categories` — список (query: `search`)
- `GET /api/v1/menu/ingredient-categories/:id`
- `POST /api/v1/menu/ingredient-categories` — `{"name"}`
- `PUT /api/v1/menu/ingredient-categories/:id`
- `DELETE /api/v1/menu/ingredient-categories/:id`

С `RequireEstablishment`. Всё привязано к заведению.

### 5. Склады (Warehouses) ✅
- `GET /api/v1/warehouses` — список складов заведения
- `GET /api/v1/warehouses/:id`
- `POST /api/v1/warehouses` — `{"name","address"}`
- `PUT /api/v1/warehouses/:id`
- `DELETE /api/v1/warehouses/:id`

С `RequireEstablishment`.

### 6. Поставщики (Suppliers) ✅
- `GET /api/v1/warehouse/suppliers` — список (query: `search`, `active`)
- `GET /api/v1/warehouse/suppliers/:id`
- `POST /api/v1/warehouse/suppliers` — `{"name","contact","phone","email"}`
- `PUT /api/v1/warehouse/suppliers/:id`
- `DELETE /api/v1/warehouse/suppliers/:id`

С `RequireEstablishment`.

### 7. Остатки, поставки, списания ✅
- `GET /api/v1/warehouse/stock` — остатки (query: `warehouse_id` — опционально)
- `POST /api/v1/warehouse/supplies` — поставка:
  - `warehouse_id`, `supplier_id`, `status` (optional, default `completed`)
  - `items`: `[{ "ingredient_id"|"product_id", "quantity", "unit", "price" }]`
  - при создании поставки остатки (Stock) увеличиваются
- `POST /api/v1/warehouse/write-offs` — списание:
  - `warehouse_id`, `reason`
  - `items`: `[{ "ingredient_id"|"product_id", "quantity", "unit" }]`
  - остатки уменьшаются; при недостатке — ошибка
- `GET /api/v1/warehouse/movements` — пока пустой массив `[]`

С `RequireEstablishment`.

### 8. Меню (Products, TechCards, Ingredients) ✅
- Products: CRUD, фильтры, привязка к категориям, складу, создание остатков при создании товара
- TechCards: CRUD, ингредиенты, модификаторы, расчёт себестоимости
- Ingredients: CRUD, создание остатков при создании, единицы: шт, л, кг

С `RequireEstablishment`. Всё привязано к заведению.

### 9. GetSemiFinished
- `GET /api/v1/menu/semi-finished` — **полуфабрикаты** (тех-карты как промежуточный продукт, например тесто). Пока возвращает `[]`. Логику можно добавить позже.

---

## Порядок для пользователя

1. **Регистрация** → `POST /auth/register`
2. **Onboarding** → `GET /auth/onboarding/questions`, затем `POST /auth/onboarding/submit`  
   → создаётся **Establishment**, привязка к User, при необходимости — столы.
3. **Категории** → создать категории для товаров/тех-карт и для ингредиентов через `/menu/categories` и `/menu/ingredient-categories`.
4. **Склад** → `POST /warehouses` (один или несколько).
5. **Поставщики** → `POST /warehouse/suppliers` (для поставок).
6. **Меню:**
   - ингредиенты (`/menu/ingredients`) — с `warehouse_id`, `quantity`, `price_per_unit` при создании (создаются остатки);
   - тех-карты (`/menu/tech-cards`) — состав из ингредиентов, модификаторы;
   - товары (`/menu/products`) — категория, при создании — `warehouse_id` (остатки с 0).
7. **Поставки** → `POST /warehouse/supplies` для пополнения остатков.
8. **Списания** → `POST /warehouse/write-offs` при необходимости.

---

## Establishments: что имелось в виду

**Заведение не создаётся вручную через CRUD.** Оно создаётся **один раз при `POST /auth/onboarding/submit`**:
- по ответам опросника создаётся `Establishment`;
- у `User` проставляется `EstablishmentID` и `OnboardingCompleted = true`.

Роуты `/establishments` нужны для:
- просмотра своего заведения (List, Get);
- редактирования (Update): название, адрес, телефон, тип и т.д.

Create/Delete на `Establishment` намеренно возвращают 400.

---

## Что не трогаем (по запросу)

- Финансы (`/finance/*`)
- Статистика (`/statistics/*`)
- Заказы (`/orders/*`) — можно включить позже

---

## Миграции БД

Перед первым запуском нужно:
1. Добавить/применить миграции для `establishment_id` во всех новых/изменённых таблицах (Product, TechCard, Ingredient, Category, IngredientCategory, Workshop, Warehouse, Supplier и т.д.).
2. Запустить seed: роли, тариф подписки, вопросы опросника (`seed_roles_and_subscriptions`, `seed_onboarding_questions`).

После этого описанный flow готов к использованию.
