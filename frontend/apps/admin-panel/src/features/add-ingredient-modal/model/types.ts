import type { CreateIngredientRequest } from '@restaurant-pos/api-client'

export interface AddIngredientModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export interface AddIngredientFormData {
  name: string
  category_id: string
  unit: 'шт' | 'л' | 'кг'
  barcode?: string
  loss_cleaning?: number
  loss_boiling?: number
  loss_frying?: number
  loss_stewing?: number
  loss_baking?: number
  // Складской учет
  warehouse_id?: string
  quantity?: number
  price_per_unit?: number
}

export interface UseAddIngredientModalResult {
  formData: AddIngredientFormData
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  categories: Array<{ id: string; name: string }>
  warehouses: Array<{ id: string; name: string }>
  handleFieldChange: (field: keyof AddIngredientFormData, value: string | number | undefined) => void
  handleSubmit: (e: React.FormEvent) => void
  handleClose: () => void
  showAdditionalFields: boolean
  toggleAdditionalFields: () => void
  showWarehouseFields: boolean
  toggleWarehouseFields: () => void
}

