import type { Inventory, InventoryItem } from '@restaurant-pos/api-client'

export type InventoryTabType = 'ingredients' | 'tech_cards'

export interface InventoryDetailItem {
  id: string
  inventory_item_id?: string
  type: 'ingredient' | 'product' | 'tech_card' | 'semi_finished'
  ingredient_id?: string
  product_id?: string
  tech_card_id?: string
  semi_finished_id?: string
  name: string
  unit: string
  price_per_unit: number
  planned_quantity: number
  income_quantity: number
  expense_quantity: number
  actual_quantity: number
  difference: number
  difference_value: number
  isEditing?: boolean
}

export interface InventoryDetailFormData {
  inventory_id?: string
  warehouse_id: string
  warehouse_name?: string
  type: 'full' | 'partial'
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled'
  scheduled_date?: string
  actual_date?: string
  comment: string
  items: InventoryDetailItem[]
}

export interface InventoryDetailStats {
  totalPlanned: number
  totalActual: number
  totalDifference: number
  totalDifferenceValue: number
}

export interface InventoryDetailFilter {
  searchQuery: string
  categoryId?: string
}

export interface ExpressionParseResult {
  value: number
  error?: string
}
