export interface AddExclusionModalProps {
  isOpen: boolean
  exclusionId?: string | null
  onSuccess?: () => void
  onClose: () => void
}

export type ExclusionType = 'product' | 'category' | 'tech_card' | 'tech_card_category'

export interface ExclusionFormData {
  name: string
  description: string
  type: ExclusionType
  selectedProducts: string[]
  selectedCategories: string[]
  selectedTechCards: string[]
  selectedTechCardCategories: string[]
  searchQuery: string
  active: boolean
}

export interface SelectableProduct {
  id: string
  name: string
  category_name?: string
  price: number
}

export interface SelectableCategory {
  id: string
  name: string
}

export interface SelectableTechCard {
  id: string
  name: string
  category_name?: string
  price: number
}
