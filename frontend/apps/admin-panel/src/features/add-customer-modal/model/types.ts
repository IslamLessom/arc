export interface AddCustomerModalProps {
  isOpen: boolean
  customerId?: string | null
  onSuccess?: () => void
  onClose: () => void
}

export interface CustomerFormData {
  name: string
  email: string
  phone: string
  birthday: string
  group_id: string
  loyalty_program_id: string
}
