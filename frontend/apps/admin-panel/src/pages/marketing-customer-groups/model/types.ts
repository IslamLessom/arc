export interface CustomerGroup {
  id: string
  name: string
  description: string | null
  discount_percentage: number
  min_orders: number | null
  min_spent: number | null
  customers_count?: number
  created_at: string
  updated_at: string
}

export interface CustomerGroupTable extends CustomerGroup {
  number: number
}

export interface CustomerGroupsSort {
  field: keyof CustomerGroupTable
  direction: 'asc' | 'desc'
}

export interface CustomerGroupsTableProps {
  onEdit: (id: string) => void
}
