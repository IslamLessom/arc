export interface AddExclusionModalProps {
  isOpen: boolean
  exclusionId?: string | null
  onSuccess?: () => void
  onClose: () => void
}

export interface ExclusionFormData {
  name: string
  description: string
  type: 'product' | 'category' | 'customer' | 'customer_group'
  entity_id: string
  entity_name: string
  active: boolean
}
