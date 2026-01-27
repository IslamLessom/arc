export interface AddWarehouseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  warehouseId?: string // If provided, modal operates in edit mode
}

export interface AddWarehouseFormData {
  name: string
  address: string
}

export type FieldErrors = {
  [key: string]: string | undefined
}

export interface UseAddWarehouseModalResult {
  formData: AddWarehouseFormData
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  fieldErrors: FieldErrors
  isFormValid: boolean
  handleFieldChange: (field: keyof AddWarehouseFormData, value: string) => void
  handleSubmit: (e: React.FormEvent) => void
  handleClose: () => void
}

