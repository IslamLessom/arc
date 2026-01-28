import { Supply } from '@restaurant-pos/api-client'

export interface SupplyDetailsModalProps {
  isOpen: boolean
  supplyId?: string
  onClose: () => void
}

export interface SupplyDetailsModalData {
  supply?: Supply
  isLoading: boolean
  error: string | null
}
