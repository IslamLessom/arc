export interface OrdersArchiveProps {
  orderId?: string
}

export type OrderStatus = 'draft' | 'confirmed' | 'preparing' | 'ready' | 'paid' | 'cancelled'

export interface OrderDisplay {
  id: string
  tableNumber?: number
  totalAmount: number
  status: OrderStatus
  createdAt: string
  itemsCount: number
}
