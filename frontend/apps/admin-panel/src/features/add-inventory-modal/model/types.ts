export interface AddInventoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  inventoryId?: string
}

export interface AddInventoryFormData {
  warehouse_id: string
  checkType: 'retroactive' | 'at_time'
  date: string
  time: string
  type: 'full' | 'partial'
  comment: string
}

export interface FieldErrors {
  warehouse_id?: string
  date?: string
  time?: string
  type?: string
}

export interface UseAddInventoryModalResult {
  formData: AddInventoryFormData
  isSubmitting: boolean
  error: string | null
  fieldErrors: FieldErrors
  isFormValid: boolean
  warehouses: Array<{ id: string; name: string }>
  handleFieldChange: (field: keyof AddInventoryFormData, value: string) => void
  handleCheckTypeChange: (type: 'retroactive' | 'at_time') => void
  handleTypeChange: (type: 'full' | 'partial') => void
  handleSubmit: (e: React.FormEvent) => void
  handleClose: () => void
}

