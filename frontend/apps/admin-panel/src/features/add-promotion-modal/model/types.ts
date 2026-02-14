export interface AddPromotionModalProps {
  isOpen: boolean
  promotionId?: string | null
  onSuccess?: () => void
  onClose: () => void
}

export interface PromotionFormData {
  name: string
  description: string
  type: 'discount' | 'buy_x_get_y' | 'bundle' | 'happy_hour'
  discount_percentage: string
  buy_quantity: string
  get_quantity: string
  start_date: string
  end_date: string
  active: boolean
}
