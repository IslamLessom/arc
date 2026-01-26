export interface Employee {
  id: string
  name: string
  phone: string | null
  email: string
  pin: string | null
  role_id?: string
  role?: {
    id: string
    name: string
    permissions: string
    created_at: string
    updated_at: string
  } | null
  establishment_id: string | null
  created_at: string
  updated_at: string
}

export interface EmployeeTable extends Employee {
  number: number
}

export interface EmployeesSort {
  field: keyof EmployeeTable
  direction: 'asc' | 'desc'
}

export interface EmployeesTableProps {
  onEdit: (id: string) => void
}
