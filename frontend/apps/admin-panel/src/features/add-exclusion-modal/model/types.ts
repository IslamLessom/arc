export interface AddExclusionModalProps {
  isOpen: boolean
  exclusionId?: string | null
  onSuccess?: () => void
  onClose: () => void
}

export type ExclusionType = 'product' | 'category'

export interface ExclusionFormData {
  name: string
  description: string
  type: ExclusionType
  selectedProducts: string[]
  selectedCategories: string[]
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
