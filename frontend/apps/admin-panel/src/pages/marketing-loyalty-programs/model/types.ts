export interface LoyaltyProgram {
  id: string
  name: string
  description: string | null
  type: 'points' | 'cashback' | 'tier'
  points_per_currency: number | null
  cashback_percentage: number | null
  max_cashback_amount: number | null
  point_multiplier: number
  is_active: boolean
  members_count?: number
  created_at: string
  updated_at: string
}

export interface LoyaltyProgramTable extends LoyaltyProgram {
  number: number
}

export interface LoyaltyProgramsSort {
  field: keyof LoyaltyProgramTable
  direction: 'asc' | 'desc'
}

export interface LoyaltyProgramsTableProps {
  onEdit: (id: string) => void
}
