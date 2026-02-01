import Dexie, { Table } from 'dexie'
import type { Order, Product, TechCard } from '@restaurant-pos/types'

// Локальная версия заказа для офлайн-работы
export interface LocalOrder {
  id?: number
  serverId?: string
  establishmentId: string
  tableNumber?: number
  items: LocalOrderItem[]
  totalAmount: number
  guestsCount?: number
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

