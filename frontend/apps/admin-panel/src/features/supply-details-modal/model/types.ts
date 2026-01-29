import { Supply } from '@restaurant-pos/api-client'

export interface SupplyDetailsModalProps {
  isOpen: boolean
  supplyId?: string
  onClose: () => void
  mode?: 'view' | 'edit'
}

export interface SupplyDetailsModalData {
  supply?: Supply
  isLoading: boolean
  error: string | null
  isSaving: boolean
  mode: 'view' | 'edit'
  setMode: (mode: 'view' | 'edit') => void
  onSave: (editedSupply?: Supply) => void
  onCancel: () => void
  onToggleStatus: () => void
}
