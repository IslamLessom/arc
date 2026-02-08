export interface ReceiptArchiveProps {
  orderId?: string
}

export interface ReceiptItem {
  id: string
  orderId: string
  orderNumber: string
  tableNumber?: number
  totalAmount: number
  cashAmount: number
  cardAmount: number
  paymentStatus: string
  paidAt: string
  itemsCount: number
  guestsCount: number
}
