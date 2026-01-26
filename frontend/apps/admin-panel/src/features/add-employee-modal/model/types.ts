export interface AddEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  employeeId?: string
}

export interface Role {
  id: string
  name: string
}

export interface AddEmployeeFormData {
  name: string
  phone: string
  email: string
  pin: string
  role_id: string
}

export interface FieldErrors {
  name?: string
  phone?: string
  email?: string
  pin?: string
  role_id?: string
}
