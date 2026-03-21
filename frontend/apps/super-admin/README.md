# Super Admin Panel

Супер-админ панель для управления подписками и пользователями системы ARC POS.

## Особенности

- 🎨 Уникальный темный UI с фиолетовым акцентом
- 👥 Управление подписками всех пользователей
- 📊 Dashboard с статистикой
- 💳 Управление тарифными планами
- 🔒 Защищенный доступ только для супер-администраторов

## Технологии

- React 18
- TypeScript
- Ant Design (темная тема)
- React Query для управления состоянием
- React Router для навигации
- Vite для сборки

## Установка

```bash
# Из корня frontend
pnpm install
```

## Запуск (Development)

```bash
# Из корня frontend
pnpm dev:super-admin
```

Приложение будет доступно на http://localhost:5004

## Сборка (Production)

```bash
# Из корня frontend
cd apps/super-admin
pnpm build
```

## Переменные окружения

Создайте файл `.env` на основе `.env.example`:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

## Структура проекта

```
src/
├── components/      # React компоненты
│   └── Layout.tsx   # Основной layout с навигацией
├── contexts/        # React contexts
│   └── AuthContext.tsx  # Контекст аутентификации
├── pages/          # Страницы приложения
│   ├── Login.tsx       # Страница входа
│   ├── Dashboard.tsx   # Dashboard со статистикой
│   ├── Subscriptions.tsx  # Управление подписками
│   └── Plans.tsx       # Управление тарифами
├── App.tsx         # Главный компонент
└── main.tsx        # Точка входа
```

## Роуты

- `/login` - Вход для супер-администраторов
- `/dashboard` - Dashboard с общей статистикой
- `/subscriptions` - Список всех подписок с возможностью управления
- `/plans` - Управление тарифными планами

## Функционал

### Dashboard
- Общая статистика по подпискам
- Количество активных подписок
- Количество истекших подписок
- Общее количество пользователей

### Подписки
- Просмотр всех подписок
- Поиск по имени, email или плану
- Продление подписки на любое количество дней
- Активация/деактивация подписки
- Изменение тарифного плана
- Визуальные индикаторы статуса

### Тарифные планы
- Просмотр всех планов
- Создание новых планов
- Редактирование существующих
- Удаление планов
- Настройка цены, длительности и функций

## Аутентификация

Для входа требуется:
1. Пользователь должен существовать в системе
2. У пользователя должна быть роль с `is_super_admin = true`

При попытке входа обычного пользователя будет показана ошибка "Access denied".

## Docker

Для сборки Docker образа используйте:

```bash
docker build -f Dockerfile.super-admin -t arc-super-admin .
```

## API

Приложение использует следующие API эндпоинты:

- `GET /api/v1/super-admin/subscriptions` - список подписок
- `POST /api/v1/super-admin/subscriptions/:id/extend` - продлить подписку
- `POST /api/v1/super-admin/subscriptions/:id/activate` - активировать
- `POST /api/v1/super-admin/subscriptions/:id/deactivate` - деактивировать
- `GET /api/v1/super-admin/plans` - список планов
- `POST /api/v1/super-admin/plans` - создать план
- `PUT /api/v1/super-admin/plans/:id` - обновить план
- `DELETE /api/v1/super-admin/plans/:id` - удалить план

Все запросы требуют Bearer токен аутентификации.
