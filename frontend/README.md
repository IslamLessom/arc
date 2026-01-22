# Restaurant POS - Frontend Monorepo

Монорепо для фронтенд-приложений системы автоматизации ресторанов.

## Структура проекта

```
frontend/
├── apps/
│   ├── marketing-site      # Публичный сайт (Next.js SSG)
│   ├── admin-panel         # Админка (Next.js SPA)
│   ├── pos-pwa            # POS PWA для официантов
│   └── qr-menu-pwa        # PWA для гостей
├── packages/
│   ├── ui                 # Общая дизайн-система
│   ├── pwa-core           # PWA utilities (SW, offline, sync)
│   ├── api-client         # API клиент с offline queue
│   ├── types              # Общие TypeScript типы
│   ├── real-time          # WebSocket logic
│   └── print-service      # Печать чеков (Web Bluetooth)
└── package.json           # Root package.json
```

## Технологии

- **Monorepo**: pnpm workspaces + Turborepo
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS (будет добавлено)
- **State**: Zustand, TanStack Query
- **PWA**: next-pwa, Workbox, Dexie.js

## Установка

```bash
# Установка pnpm (если еще не установлен)
npm install -g pnpm

# Установка зависимостей
pnpm install
```

## Разработка

```bash
# Запуск всех приложений в режиме разработки
pnpm dev

# Запуск конкретного приложения
pnpm dev:marketing  # порт 3000
pnpm dev:admin      # порт 3001
pnpm dev:pos        # порт 3002
pnpm dev:qr-menu    # порт 3003
```

## Сборка

```bash
# Сборка всех приложений и пакетов
pnpm build

# Сборка конкретного приложения
cd apps/marketing-site && pnpm build
```

## Пакеты

### @restaurant-pos/types
Общие TypeScript типы для всех приложений.

### @restaurant-pos/ui
Дизайн-система с переиспользуемыми компонентами.

### @restaurant-pos/api-client
API клиент с поддержкой offline-режима и TanStack Query.

### @restaurant-pos/pwa-core
Утилиты для PWA: IndexedDB, синхронизация, offline-режим.

### @restaurant-pos/real-time
WebSocket клиент для real-time обновлений.

### @restaurant-pos/print-service
Сервис для печати чеков через Web Bluetooth API.

## Следующие шаги

1. Настроить Tailwind CSS для всех приложений
2. Добавить shadcn/ui компоненты в @restaurant-pos/ui
3. Настроить ESLint и Prettier
4. Добавить тесты (Vitest + React Testing Library)
5. Настроить CI/CD

