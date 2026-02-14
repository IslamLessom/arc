export interface AddCustomerGroupModalProps {
  isOpen: boolean
  groupId?: string | null
  onSuccess?: () => void
  onClose: () => void
}

export interface CustomerGroupFormData {
  name: string
  description: string
  discount_percentage: string
  min_orders: string
  min_spent: string
}
