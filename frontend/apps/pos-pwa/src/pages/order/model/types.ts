import type { Product } from '@restaurant-pos/api-client'
import { OrderTab } from './enums'

export interface ProductCategory {
  id: string
  establishment_id: string
  name: string
  type: 'product' | 'tech_card' | 'semi_finished'
  order: number
  active: boolean
  created_at: string
}

export interface OrderProps {
  orderId: string
}

export interface OrderItem {
  id: string
  productId: string
  product: Product
  quantity: number
  price: number
  totalPrice: number
}

export interface GuestOrder {
  guestNumber: number
  items: OrderItem[]
  totalAmount: number
}

export interface OrderData {
  orderId: string
  tableNumber?: number
  guestsCount: number
  guests: GuestOrder[]
  selectedGuestNumber: number
  totalAmount: number
}

export interface UseOrderResult {
  // Data
  orderData: OrderData | null
  categories: ProductCategory[]
  products: Product[]
  selectedCategoryId: string | null
  selectedTab: OrderTab

  // Loading states
  isLoading: boolean
  isLoadingCategories: boolean
  isLoadingProducts: boolean
  isCreatingOrder: boolean
  error: Error | null

  // Actions
  handleBack: () => void
  handleCategorySelect: (categoryId: string) => void
  handleProductClick: (product: Product) => void
  handleGuestSelect: (guestNumber: number) => void
  handleAddGuest: () => void
  handleQuantityChange: (itemId: string, delta: number) => void
  handleRemoveItem: (itemId: string) => void
  handleTabChange: (tab: OrderTab) => void
  handleSubmitOrder: () => void
  handlePayment: () => void

  // Computed
  selectedGuest: GuestOrder | null
  selectedCategoryProducts: Product[]
}
