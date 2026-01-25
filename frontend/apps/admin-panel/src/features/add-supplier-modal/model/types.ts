export interface AddSupplierModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  supplierId?: string // If provided, modal operates in edit mode
}

export interface AddSupplierFormData {
  name: string
  taxpayer_number: string
  phone: string
  address: string
  comment: string
}

export type FieldErrors = {
  [key: string]: string | undefined
}

export interface UseAddSupplierModalResult {
  formData: AddSupplierFormData
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  fieldErrors: FieldErrors
  isFormValid: boolean
  handleFieldChange: (field: keyof AddSupplierFormData, value: string) => void
  handleSubmit: (e: React.FormEvent) => void
  handleClose: () => void
}

