export interface AddLoyaltyProgramModalProps {
  isOpen: boolean
  programId?: string | null
  onSuccess?: () => void
  onClose: () => void
}

export interface LoyaltyProgramFormData {
  name: string
  description: string
  type: 'points' | 'cashback' | 'tier'
  points_per_currency: string
  cashback_percentage: string
  max_cashback_amount: string
  point_multiplier: string
  active: boolean
}
