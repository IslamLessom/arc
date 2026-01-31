import type { Account } from '@restaurant-pos/types'

export interface AddAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  editingAccount?: Account | null
}

export interface AddAccountFormData {
  name: string
  currency: string
  typeId: string
  balance: number
}

export interface UseAddAccountModalResult {
  formData: AddAccountFormData
  isSubmitting: boolean
  error: string | null
  handleFieldChange: (field: keyof AddAccountFormData, value: string | number) => void
  handleSubmit: (e: React.FormEvent) => void
  handleClose: () => void
}
