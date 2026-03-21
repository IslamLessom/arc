import { Supply } from '@restaurant-pos/api-client'
import type { Account } from '@restaurant-pos/types'

export interface SupplyDetailsModalProps {
  isOpen: boolean
  supplyId?: string
  onClose: () => void
  mode?: 'view' | 'edit'
}

export interface SupplyDetailsModalData {
  supply?: Supply
  accounts: Account[]
  remainingDebt: number
  isLoading: boolean
  error: string | null
  paymentError: string | null
  isSaving: boolean
  mode: 'view' | 'edit'
  setMode: (mode: 'view' | 'edit') => void
  onSave: (editedSupply?: Supply) => void
  onCancel: () => void
  clearPaymentError: () => void
  onMarkAsPaid: (accountId: string) => Promise<void>
}
