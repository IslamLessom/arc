import type { Account } from '@restaurant-pos/types'
import { TransactionType } from './enums'

export interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export interface AddTransactionFormData {
  type: TransactionType
  amount: string
  fromAccountId: string
  toAccountId?: string
  category: string
  date: string
  time: string
  comment: string
}

export interface UseAddTransactionModalResult {
  formData: AddTransactionFormData
  isSubmitting: boolean
  error: string | null
  accounts: Account[]
  categories: string[]
  handleFieldChange: <K extends keyof AddTransactionFormData>(field: K, value: AddTransactionFormData[K]) => void
  handleTypeChange: (type: TransactionType) => void
  handleSubmit: (e: React.FormEvent) => void
  handleClose: () => void
}
