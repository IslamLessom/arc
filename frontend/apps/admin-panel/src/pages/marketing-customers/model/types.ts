export interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  birthday: string | null
  group_id?: string
  group?: {
    id: string
    name: string
  } | null
  loyalty_points?: number
  total_orders?: number
  total_spent?: number
  created_at: string
  updated_at: string
}

export interface CustomerTable extends Customer {
  number: number
}

export interface CustomersSort {
  field: keyof CustomerTable
  direction: 'asc' | 'desc'
}

export interface CustomersTableProps {
  onEdit: (id: string) => void
}
