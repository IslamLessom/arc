Подробно распишу реализацию этой монорепо-архитектуры с конкретными технологиями и примерами конфигурации.

## Технологический стек

### Монорепо менеджмент
**pnpm + Turborepo**[1][2]
- **pnpm workspaces**: управление зависимостями, линковка пакетов
- **Turborepo**: кэширование сборок, параллельные задачи, pipeline
- Причина выбора: простота настройки + скорость (3x быстрее Nx)[1]

### Core технологии
```typescript
// Framework & Language
Next.js 15+ (App Router)
TypeScript 5+
React 18+

// Styling
Tailwind CSS 4
shadcn/ui (компонентная библиотека)

// State Management
Zustand (клиентское состояние)
TanStack Query v5 (серверное состояние + кэш)

// PWA
next-pwa (Workbox integration)
Workbox 7+
Dexie.js (IndexedDB wrapper)

// Real-time
Socket.io Client
Server-Sent Events

// Validation
Zod (схемы валидации)

// Testing
Vitest + React Testing Library
Playwright (E2E)
```

## Пошаговая настройка проекта

### 1. Инициализация монорепо

```bash
# Создаем структуру
mkdir restaurant-pos && cd restaurant-pos
mkdir -p apps packages

# Инициализируем pnpm workspace
cat > pnpm-workspace.yaml << EOF
packages:
  - 'apps/*'
  - 'packages/*'
EOF

# Root package.json
pnpm init

# Устанавливаем Turborepo
pnpm add -D -w turbo
```

### 2. Конфигурация Turborepo

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

### 3. Создание приложений

#### apps/marketing-site

```bash
cd apps
pnpm create next-app@latest marketing-site --typescript --tailwind --app
cd marketing-site

# Установка зависимостей
pnpm add @restaurant-pos/ui @restaurant-pos/types
```

```typescript
// apps/marketing-site/package.json
{
  "name": "@restaurant-pos/marketing-site",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "15.1.0",
    "react": "^18.3.0",
    "@restaurant-pos/ui": "workspace:*",
    "@restaurant-pos/types": "workspace:*"
  }
}
```

#### apps/admin-panel

```bash
# Аналогично создаем
pnpm create next-app@latest admin-panel --typescript --tailwind --app

# Дополнительно для админки
pnpm add recharts date-fns @tanstack/react-query @tanstack/react-table
```

```typescript
// apps/admin-panel/app/layout.tsx
import { QueryProvider } from '@restaurant-pos/api-client'
import '@restaurant-pos/ui/styles.css'

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
```

#### apps/pos-pwa (Главное приложение)

```bash
pnpm create next-app@latest pos-pwa --typescript --tailwind --app
cd pos-pwa

# PWA зависимости
pnpm add next-pwa workbox-window dexie
pnpm add -D @types/workbox-window
```

```javascript
// apps/pos-pwa/next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.restaurant-pos\.com\/menu/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'menu-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60 // 24 часа
        }
      }
    },
    {
      urlPattern: /^https:\/\/api\.restaurant-pos\.com\/orders/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'orders-cache',
        networkTimeoutSeconds: 10,
        plugins: [
          {
            backgroundSync: {
              name: 'ordersQueue',
              options: {
                maxRetentionTime: 24 * 60 // 24 часа в минутах
              }
            }
          }
        ]
      }
    }
  ],
  fallbacks: {
    document: '/offline'
  }
})

module.exports = withPWA({
  reactStrictMode: true,
  transpilePackages: ['@restaurant-pos/ui', '@restaurant-pos/pwa-core']
})
```

```json
// apps/pos-pwa/public/manifest.json
{
  "name": "Restaurant POS",
  "short_name": "POS",
  "description": "Система учета для ресторанов",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["business", "food"],
  "screenshots": [
    {
      "src": "/screenshot-1.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ]
}
```

### 4. Создание shared packages

#### packages/ui (Дизайн-система)

```bash
cd packages
mkdir ui && cd ui
pnpm init

# Зависимости
pnpm add react react-dom tailwindcss class-variance-authority clsx
pnpm add -D typescript @types/react tsup
```

```typescript
// packages/ui/package.json
{
  "name": "@restaurant-pos/ui",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styles.css": "./dist/styles.css"
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts --external react",
    "dev": "tsup src/index.ts --format cjs,esm --dts --external react --watch",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

```typescript
// packages/ui/src/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-gray-300 hover:bg-gray-100'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = ({ className, variant, size, ...props }: ButtonProps) => {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
}
```

#### packages/pwa-core (PWA утилиты)

```bash
mkdir pwa-core && cd pwa-core
pnpm init
pnpm add dexie workbox-window idb
pnpm add -D typescript tsup
```

```typescript
// packages/pwa-core/src/db.ts
import Dexie, { Table } from 'dexie'
import type { Order, OrderItem, Product, TechCard } from '@restaurant-pos/types'

// Локальная версия заказа для офлайн-работы
export interface LocalOrder {
  id?: number
  serverId?: string
  establishmentId: string
  tableNumber?: number
  items: LocalOrderItem[]
  totalAmount: number
  status: 'pending' | 'synced' | 'failed'
  createdAt: Date
  syncedAt?: Date
}

export interface LocalOrderItem {
  productId?: string
  techCardId?: string
  quantity: number
  price: number
  totalPrice: number
}

export class POSDatabase extends Dexie {
  orders!: Table<LocalOrder>
  products!: Table<Product>
  techCards!: Table<TechCard>
  
  constructor() {
    super('POSDatabase')
    this.version(1).stores({
      orders: '++id, serverId, status, createdAt, establishmentId',
      products: 'id, establishmentId, categoryId, active',
      techCards: 'id, establishmentId, categoryId, active'
    })
  }
}

export const db = new POSDatabase()
```

```typescript
// packages/pwa-core/src/sync.ts
import { db, LocalOrder } from './db'

export class SyncManager {
  private syncInterval: NodeJS.Timeout | null = null
  
  async syncPendingOrders() {
    const pendingOrders = await db.orders
      .where('status')
      .equals('pending')
      .toArray()
    
    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            establishmentId: order.establishmentId,
            tableNumber: order.tableNumber,
            status: 'draft',
            totalAmount: order.totalAmount,
            items: order.items.map(item => ({
              productId: item.productId,
              techCardId: item.techCardId,
              quantity: item.quantity,
              price: item.price,
              totalPrice: item.totalPrice
            }))
          })
        })
        
        if (response.ok) {
          const { id } = await response.json()
          await db.orders.update(order.id!, {
            serverId: id,
            status: 'synced',
            syncedAt: new Date()
          })
        }
      } catch (error) {
        console.error('Sync failed:', error)
        await db.orders.update(order.id!, { status: 'failed' })
      }
    }
  }
  
  startAutoSync(intervalMs = 30000) {
    this.syncInterval = setInterval(() => {
      this.syncPendingOrders()
    }, intervalMs)
  }
  
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
  }
}

export const syncManager = new SyncManager()
```

#### packages/api-client

```bash
mkdir api-client && cd api-client
pnpm init
pnpm add @tanstack/react-query axios
pnpm add -D typescript tsup
```

```typescript
// packages/api-client/src/client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor для добавления токена
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic
      localStorage.removeItem('auth_token')
    }
    return Promise.reject(error)
  }
)
```

```typescript
// packages/api-client/src/hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import { db } from '@restaurant-pos/pwa-core'
import type { Order, OrderItem } from '@restaurant-pos/types'

export function useCreateOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (order: {
      establishmentId: string
      tableNumber?: number
      items: Array<{
        productId?: string
        techCardId?: string
        quantity: number
        price: number
        totalPrice: number
      }>
      totalAmount: number
    }) => {
      // Сначала сохраняем локально
      const localId = await db.orders.add({
        establishmentId: order.establishmentId,
        tableNumber: order.tableNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        status: 'pending',
        createdAt: new Date()
      })
      
      try {
        // Пытаемся отправить на сервер
        const response = await apiClient.post<Order>('/orders', {
          establishmentId: order.establishmentId,
          tableNumber: order.tableNumber,
          status: 'draft',
          totalAmount: order.totalAmount,
          items: order.items
        })
        
        // Обновляем статус
        await db.orders.update(localId, {
          serverId: response.data.id,
          status: 'synced',
          syncedAt: new Date()
        })
        
        return response.data
      } catch (error) {
        // Если офлайн - оставляем pending для фоновой синхронизации
        console.log('Offline: order saved locally')
        return { id: localId.toString(), ...order } as Order
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}
```

#### packages/types

```typescript
// packages/types/src/index.ts

// ===== Базовые сущности =====

export interface Establishment {
  id: string
  ownerId: string
  name: string
  address?: string
  phone?: string
  email?: string
  hasSeatingPlaces: boolean
  tableCount?: number
  type?: string // restaurant, cafe, fast_food, bar, etc.
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Table {
  id: string
  establishmentId: string
  number: number
  name?: string
  capacity: number
  positionX: number
  positionY: number
  rotation: number
  status: 'available' | 'occupied' | 'reserved'
  active: boolean
  createdAt: string
  updatedAt: string
}

// ===== Меню и товары =====

export interface Category {
  id: string
  establishmentId: string
  name: string
  type: 'product' | 'tech_card' | 'semi_finished'
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  establishmentId: string
  categoryId: string
  category?: Category
  workshopId?: string
  workshop?: Workshop
  name: string
  description?: string
  coverImage?: string
  isWeighted: boolean
  excludeFromDiscounts: boolean
  hasModifications: boolean
  barcode?: string
  costPrice: number
  markup: number
  price: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface TechCard {
  id: string
  establishmentId: string
  categoryId: string
  category?: Category
  workshopId?: string
  workshop?: Workshop
  name: string
  description?: string
  coverImage?: string
  isWeighted: boolean
  excludeFromDiscounts: boolean
  costPrice: number
  markup: number
  price: number
  active: boolean
  ingredients?: TechCardIngredient[]
  modifierSets?: ModifierSet[]
  createdAt: string
  updatedAt: string
}

export interface TechCardIngredient {
  id: string
  techCardId: string
  ingredientId: string
  ingredient?: Ingredient
  quantity: number
  unit: string
  createdAt: string
  updatedAt: string
}

export interface ModifierSet {
  id: string
  techCardId: string
  techCard?: TechCard
  name: string
  selectionType: 'single' | 'multiple'
  minSelection: number
  maxSelection: number
  options?: ModifierOption[]
  createdAt: string
  updatedAt: string
}

export interface ModifierOption {
  id: string
  modifierSetId: string
  modifierSet?: ModifierSet
  name: string
  price: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Workshop {
  id: string
  establishmentId: string
  establishment?: Establishment
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
}

// ===== Ингредиенты =====

export interface IngredientCategory {
  id: string
  establishmentId: string
  establishment?: Establishment
  name: string
  createdAt: string
  updatedAt: string
}

export interface Ingredient {
  id: string
  establishmentId: string
  categoryId: string
  category?: IngredientCategory
  name: string
  unit: string // шт, л, кг
  barcode?: string
  lossCleaning: number
  lossBoiling: number
  lossFrying: number
  lossStewing: number
  lossBaking: number
  active: boolean
  createdAt: string
  updatedAt: string
}

// ===== Заказы =====

export type OrderStatus = 
  | 'draft' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'paid' 
  | 'cancelled'

export interface Order {
  id: string
  establishmentId: string
  establishment?: Establishment
  tableNumber?: number
  status: OrderStatus
  totalAmount: number
  items?: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  order?: Order
  productId?: string
  product?: Product
  techCardId?: string
  techCard?: TechCard
  quantity: number
  price: number
  totalPrice: number
  createdAt: string
}

// ===== Склад =====

export interface Warehouse {
  id: string
  establishmentId: string
  establishment?: Establishment
  name: string
  address?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Stock {
  id: string
  warehouseId: string
  warehouse?: Warehouse
  ingredientId?: string
  ingredient?: Ingredient
  productId?: string
  product?: Product
  quantity: number
  unit: string
  pricePerUnit: number
  limit: number
  updatedAt: string
}

export interface Supplier {
  id: string
  establishmentId: string
  establishment?: Establishment
  name: string
  taxpayerNumber?: string
  phone?: string
  address?: string
  comment?: string
  contact?: string
  email?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Supply {
  id: string
  warehouseId: string
  warehouse?: Warehouse
  supplierId: string
  supplier?: Supplier
  deliveryDateTime: string
  status: 'pending' | 'completed' | 'cancelled'
  comment?: string
  items?: SupplyItem[]
  createdAt: string
  updatedAt: string
}

export interface SupplyItem {
  id: string
  supplyId: string
  ingredientId?: string
  ingredient?: Ingredient
  productId?: string
  product?: Product
  quantity: number
  unit: string
  pricePerUnit: number
  totalAmount: number
  createdAt: string
}

export interface WriteOff {
  id: string
  warehouseId: string
  warehouse?: Warehouse
  writeOffDateTime: string
  reason: string
  comment?: string
  items?: WriteOffItem[]
  createdAt: string
  updatedAt: string
}

export interface WriteOffItem {
  id: string
  writeOffId: string
  ingredientId?: string
  ingredient?: Ingredient
  productId?: string
  product?: Product
  quantity: number
  unit: string
  details?: string
  createdAt: string
}

// ===== Клиенты =====

export interface Client {
  id: string
  name?: string
  email?: string
  phone?: string
  loyaltyPoints: number
  loyaltyProgramId?: string
  loyaltyProgram?: LoyaltyProgram
  groupId?: string
  group?: ClientGroup
  createdAt: string
  updatedAt: string
}

export interface ClientGroup {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface LoyaltyProgram {
  id: string
  name: string
  description?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Promotion {
  id: string
  name: string
  description?: string
  type: string // discount, gift, etc.
  value: number
  startDate: string
  endDate: string
  active: boolean
  createdAt: string
  updatedAt: string
}

// ===== Финансы =====

export interface Shift {
  id: string
  establishmentId: string
  establishment?: Establishment
  employeeId: string
  employee?: User
  openedAt: string
  closedAt?: string
  openingBalance: number
  closingBalance?: number
  status: 'open' | 'closed'
  transactions?: Transaction[]
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  shiftId: string
  shift?: Shift
  orderId?: string
  order?: Order
  type: 'income' | 'expense' | 'transfer'
  category?: string
  amount: number
  description?: string
  createdAt: string
  updatedAt: string
}

// ===== Пользователи =====

export interface User {
  id: string
  email: string
  name?: string
  roleId: string
  role?: Role
  establishmentId?: string
  establishment?: Establishment
  onboardingCompleted: boolean
  subscriptionId?: string
  subscription?: Subscription
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  permissions?: string[]
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  name: string
  features?: string[]
  active: boolean
  createdAt: string
  updatedAt: string
}
```

#### packages/real-time

```typescript
// packages/real-time/src/socket.ts
import { io, Socket } from 'socket.io-client'

class SocketManager {
  private socket: Socket | null = null
  
  connect(url: string, token: string) {
    this.socket = io(url, {
      auth: { token },
      transports: ['websocket']
    })
    
    this.socket.on('connect', () => {
      console.log('Socket connected')
    })
    
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })
    
    return this.socket
  }
  
  onOrderUpdate(callback: (order: any) => void) {
    this.socket?.on('order:updated', callback)
  }
  
  onMenuUpdate(callback: (menu: any) => void) {
    this.socket?.on('menu:updated', callback)
  }
  
  disconnect() {
    this.socket?.disconnect()
  }
}

export const socketManager = new SocketManager()
```

### 5. Root package.json scripts

```json
// package.json (root)
{
  "name": "restaurant-pos",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "test": "turbo run test",
    "dev:marketing": "turbo run dev --filter=@restaurant-pos/marketing-site",
    "dev:admin": "turbo run dev --filter=@restaurant-pos/admin-panel",
    "dev:pos": "turbo run dev --filter=@restaurant-pos/pos-pwa"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0",
    "typescript": "^5.4.0"
  },
  "packageManager": "pnpm@9.1.0"
}
```

## Deployment стратегия

```bash
# Vercel для всех Next.js приложений
vercel link # для каждого app
vercel --prod

# Или Docker для self-hosted
# Dockerfile в каждом app с multi-stage build
```

Эта архитектура дает вам:[2][1]
- **Быструю разработку**: hot reload работает мгновенно
- **Переиспользование кода**: UI компоненты, типы, утилиты
- **Независимый деплой**: каждое приложение деплоится отдельно
- **Type-safety**: TypeScript через весь проект
- **Масштабируемость**: легко добавлять новые приложения/пакеты[3][4]

Источники
[1] Why I Chose Turborepo Over Nx: Monorepo Performance ... https://dev.to/saswatapal/why-i-chose-turborepo-over-nx-monorepo-performance-without-the-complexity-1afp
[2] Nx vs. Turborepo: Integrated Ecosystem or High-Speed ... https://dev.to/thedavestack/nx-vs-turborepo-integrated-ecosystem-or-high-speed-task-runner-the-key-decision-for-your-monorepo-279
[3] Setup a monorepo with PNPM workspaces and add Nx for speed https://www.youtube.com/watch?v=ngdoUQBvAjo
[4] Create a monorepo using PNPM workspace https://dev.to/vinomanick/create-a-monorepo-using-pnpm-workspace-1ebn
[5] Nx vs Turborepo: A Comprehensive Guide to Monorepo ... https://www.wisp.blog/blog/nx-vs-turborepo-a-comprehensive-guide-to-monorepo-tools
[6] Top 5 Monorepo Tools for 2025 | Best Dev Workflow Tools https://www.aviator.co/blog/monorepo-tools/
[7] Turborepo vs Nx vs Other Monorepo Tools (2025 Comparison) https://www.linkedin.com/pulse/turborepo-vs-nx-other-monorepo-tools-2025-comparison-fernand-soualo-qr1ae
[8] vsavkin/large-monorepo: Benchmarking Nx and Turborepo https://github.com/vsavkin/large-monorepo
[9] Zero config PWA plugin for Next.js, with workbox https://github.com/shadowwalker/next-pwa
[10] Creating a PWA App Using Next.js | Fishtank https://www.getfishtank.com/insights/creating-a-progressive-web-app-using-nextjs
