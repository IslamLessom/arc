export interface AddIngredientCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export interface AddIngredientCategoryFormData {
  name: string
}

export interface UseAddIngredientCategoryModalResult {
  formData: AddIngredientCategoryFormData
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  handleFieldChange: (field: keyof AddIngredientCategoryFormData, value: string) => void
  handleSubmit: (e: React.FormEvent) => void
  handleClose: () => void
}