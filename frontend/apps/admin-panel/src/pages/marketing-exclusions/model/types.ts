export interface Exclusion {
  id: string
  name: string
  description: string | null
  type: 'product' | 'category' | 'customer' | 'customer_group' | 'tech_card'
  entity_id?: string
  entity_name?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ExclusionTable extends Exclusion {
  number: number
}

export interface ExclusionsSort {
  field: keyof ExclusionTable
  direction: 'asc' | 'desc'
}

export interface ExclusionsTableProps {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}
