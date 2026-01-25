export interface AddMovementModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  movementId?: string
}

export interface MovementItemFormData {
  id: string
  ingredient_id?: string
  product_id?: string
  ingredient_name?: string
  product_name?: string
  quantity: number
  unit: string
  price_per_unit: number
  total_amount: number
}

export interface AddMovementFormData {
  movement_date: string
  movement_time_hours: string
  movement_time_minutes: string
  from_warehouse_id: string
  to_warehouse_id: string
  comment: string
  items: MovementItemFormData[]
}

export type FieldErrors = {
  [key: string]: string | undefined
}

export interface UseAddMovementModalResult {
  formData: AddMovementFormData
  isSubmitting: boolean
  error: string | null
  fieldErrors: FieldErrors
  isFormValid: boolean
  warehouses: Array<{ id: string; name: string }>
  availableItems: Array<{ id: string; name: string; type: 'ingredient' | 'product'; unit: string }>
  totalAmount: number
  handleFieldChange: (field: keyof AddMovementFormData, value: string | MovementItemFormData[]) => void
  addItem: () => void
  removeItem: (itemId: string) => void
  updateItem: (itemId: string, updates: Partial<MovementItemFormData>) => void
  handleSubmit: (e: React.FormEvent) => void
  handleClose: () => void
}

export interface MovementFormProps {
  formData: AddMovementFormData
  fieldErrors?: FieldErrors
  isSubmitting: boolean
  warehouses: Array<{ id: string; name: string }>
  availableItems: Array<{ id: string; name: string; type: 'ingredient' | 'product'; unit: string }>
  totalAmount: number
  handleFieldChange: (field: keyof AddMovementFormData, value: string | MovementItemFormData[]) => void
  addItem: () => void
  removeItem: (itemId: string) => void
  updateItem: (itemId: string, updates: Partial<MovementItemFormData>) => void
}

