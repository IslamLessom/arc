import type { Stock } from '@restaurant-pos/api-client'

export interface AddInventoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (inventoryId: string) => void
  inventoryId?: string | null
}

export interface AddInventoryFormData {
  warehouse_id: string
  checkType: 'retroactive' | 'at_time'
  date: string
  time: string
  type: 'full' | 'partial'
  comment: string
  items: InventoryFormItem[]
}

export interface InventoryFormItem {
  id: string
  type: 'ingredient' | 'product' | 'tech_card' | 'semi_finished'
  stock_id: string
  item_id?: string // For tech_card and semi_finished, store the actual item ID
  name: string
  expected_quantity: number
  actual_quantity: number
  unit: string
  price_per_unit: number
}

export interface FieldErrors {
  warehouse_id?: string
  date?: string
  time?: string
  type?: string
}

export interface CategoryWithCount {
  id: string
  name: string
  count: number
  items: Array<{
    id: string
    name: string
    type: 'ingredient' | 'product' | 'tech_card' | 'semi_finished'
    stock_id?: string
    quantity?: number
    unit?: string
  }>
}

export interface ProductTreeNode {
  id: string
  name: string
  type: 'ingredients' | 'products' | 'tech_cards' | 'semi_finished' | 'category' | 'item'
  count?: number
  checked: boolean
  expanded: boolean
  children?: ProductTreeNode[]
  itemId?: string
  itemType?: 'ingredient' | 'product' | 'tech_card' | 'semi_finished'
  stockId?: string
}

export interface UseAddInventoryModalResult {
  formData: AddInventoryFormData
  isSubmitting: boolean
  error: string | null
  fieldErrors: FieldErrors
  isFormValid: boolean
  isDateTimeValid: boolean
  isEditMode: boolean
  stockItems: Stock[]
  filteredStockItems: Stock[]
  searchQuery: string
  warehouses: Array<{ id: string; name: string }>
  productTree: ProductTreeNode[]
  treeSearchQuery: string
  handleFieldChange: (field: keyof AddInventoryFormData, value: string) => void
  handleCheckTypeChange: (type: 'retroactive' | 'at_time') => void
  handleTypeChange: (type: 'full' | 'partial') => void
  handleAddItem: (stockItem: Stock) => void
  handleRemoveItem: (itemId: string) => void
  handleItemQuantityChange: (itemId: string, quantity: number) => void
  handleSearchChange: (query: string) => void
  handleTreeSearchChange: (query: string) => void
  handleTreeNodeToggle: (nodeId: string) => void
  handleTreeNodeCheck: (nodeId: string, checked: boolean) => void
  handleSubmit: (e: React.FormEvent) => void
  handleClose: () => void
}
