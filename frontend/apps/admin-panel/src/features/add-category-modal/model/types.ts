import type { ProductCategory } from '@restaurant-pos/api-client'
import type { CategoryType } from './enums'

export interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  categoryToEdit?: ProductCategory
}

export interface AddCategoryFormData {
  name: string
  type: CategoryType
  techCardCategory?: string
}

export interface UseAddCategoryModalResult {
  formData: AddCategoryFormData
  techCardCategories: ProductCategory[]
  techCardCategoriesLoading: boolean
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  handleFieldChange: (field: keyof AddCategoryFormData, value: string) => void
  handleSubmit: (e: React.FormEvent) => void
  handleClose: () => void
}

