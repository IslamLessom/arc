export interface SemiFinishedIngredient {
  id: string
  ingredient_id?: string
  ingredient_name?: string
  preparation_method?: string
  gross: number
  net: number
  unit: string
  cost: number
}

export interface AddSemiFinishedFormData {
  name: string
  cooking_process: string
  ingredients: SemiFinishedIngredient[]
}

export interface FieldErrors {
  [key: string]: string | undefined
}

export interface UseAddSemiFinishedResult {
  formData: AddSemiFinishedFormData
  isSubmitting: boolean
  error: string | null
  fieldErrors: FieldErrors
  isFormValid: boolean
  ingredients: Array<{ id: string; name: string; unit: string }>
  totalCost: number
  totalYield: number
  handleFieldChange: (field: keyof AddSemiFinishedFormData, value: string) => void
  addIngredient: () => void
  removeIngredient: (id: string) => void
  updateIngredient: (id: string, updates: Partial<SemiFinishedIngredient>) => void
  handleSubmit: () => Promise<void>
  handleBack: () => void
}

