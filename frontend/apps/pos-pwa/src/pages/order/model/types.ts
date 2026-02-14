import type { Product } from '@restaurant-pos/api-client'
import type { TechnicalCard } from '@restaurant-pos/api-client'
import type { Customer } from '@restaurant-pos/api-client'
import { OrderTab, DiscountType } from './enums'

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

// Объединенный тип для товаров и тех-карт
export type MenuItem = Product & TechnicalCard

export interface OrderItem {
  id: string
  productId?: string
  techCardId?: string
  product?: Product
  techCard?: TechnicalCard
  itemType: 'product' | 'tech_card'
  quantity: number
  price: number
  totalPrice: number
}

export interface GuestDiscount {
  type: DiscountType
  value: number // процент для Percentage, сумма для Fixed
  amount: number // итоговая сумма скидки в рублях
}

export interface GuestOrder {
  guestNumber: number
  items: OrderItem[]
  totalAmount: number
  discount: GuestDiscount
  finalAmount: number // сумма после применения скидки
}

export interface OrderData {
  orderId: string
  tableNumber?: number
  guestsCount: number
  guests: GuestOrder[]
  selectedGuestNumber: number
  selectedCustomer?: Customer // выбранный клиент для всего заказа
  totalAmount: number
  totalDiscount: number
  finalAmount: number
}

export interface UseOrderResult {
  // Data
  orderData: OrderData | null
  categories: ProductCategory[]
  products: Product[]
  technicalCards: TechnicalCard[]
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
  handleProductClick: (item: MenuItem) => void
  handleTechCardClick: (item: MenuItem) => void
  handleGuestSelect: (guestNumber: number) => void
  handleAddGuest: () => void
  handleQuantityChange: (itemId: string, delta: number) => void
  handleRemoveItem: (itemId: string) => void
  handleTabChange: (tab: OrderTab) => void
  handleSubmitOrder: () => void
  handlePayment: () => void

  // Customer actions
  handleCustomerSelect: (customer: Customer | null) => void
  handleCustomerRemove: () => void

  // Discount actions
  handleSetGuestDiscount: (guestNumber: number, type: DiscountType, value: number) => void
  handleRemoveGuestDiscount: (guestNumber: number) => void

  // Computed
  selectedGuest: GuestOrder | null
  selectedCategoryProducts: Product[]
  selectedCategoryItems: MenuItem[]
}
