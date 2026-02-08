export interface PaymentPageProps {
  orderId: string
}

export type PaymentMethod = 'cash' | 'card' | 'split'

export interface PaymentState {
  selectedMethod: PaymentMethod | null
  cashAmount: number
  cardAmount: number
  totalAmount: number
  isProcessing: boolean
}
