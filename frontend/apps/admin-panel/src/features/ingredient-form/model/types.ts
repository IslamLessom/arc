export interface IngredientFormData {
  name: string
  category_id: string
  unit: 'шт' | 'л' | 'кг'
  barcode?: string
  loss_cleaning?: number
  loss_boiling?: number
  loss_frying?: number
  loss_stewing?: number
  loss_baking?: number
  quantity?: number
  price_per_unit?: number
  warehouse_id?: string
}

export interface IngredientFormProps {
  formData: IngredientFormData
  isSubmitting?: boolean
  categories: Array<{ id: string; name: string }>
  warehouses?: Array<{ id: string; name: string }>
  onFieldChange: (field: keyof IngredientFormData, value: any) => void
  onSubmit: (e: React.FormEvent) => void
  showAdditionalFields?: boolean
  toggleAdditionalFields?: () => void
  showWarehouseFields?: boolean
  toggleWarehouseFields?: () => void
  mode?: 'create' | 'edit'
}