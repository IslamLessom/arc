export interface Promotion {
  id: string
  name: string
  description: string | null
  type: 'discount' | 'buy_x_get_y' | 'bundle' | 'happy_hour'
  discount_percentage: number | null
  buy_quantity: number | null
  get_quantity: number | null
  start_date: string
  end_date: string
  is_active: boolean
  usage_count?: number
  created_at: string
  updated_at: string
}

export interface PromotionTable extends Promotion {
  number: number
}

export interface PromotionsSort {
  field: keyof PromotionTable
  direction: 'asc' | 'desc'
}

export interface PromotionsTableProps {
  onEdit: (id: string) => void
}
