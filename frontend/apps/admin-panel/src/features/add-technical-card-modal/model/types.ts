export interface AddTechnicalCardModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (newCard: any) => void
  cardId?: string // If provided, modal operates in edit mode
}

export interface IngredientFormData {
  id: string
  ingredient_id: string
  ingredient_name?: string
  gross: number
  net: number
  unit: 'г' | 'мл' | 'шт'
  cost: number
}

export interface ModifierOptionFormData {
  name: string
  price: number
}

export interface ModifierSetFormData {
  name: string
  selection_type: 'single' | 'multiple'
  min_selection?: number
  max_selection?: number
  options: ModifierOptionFormData[]
}

export interface AddTechnicalCardFormData {
  name: string
  category_id: string
  description?: string
  cover_image?: string
  is_weighted: boolean
  is_discount_disabled: boolean
  cost_price: number
  markup: number
  price: number
  workshop_id?: string
  warehouse_id?: string
  ingredients: IngredientFormData[]
  modifier_sets: ModifierSetFormData[]
  showComposition: boolean
}

export interface AddTechnicalCardPayload {
  id: string
  name: string
  category_id: string
  description?: string
  cover_image?: string
  is_weighted: boolean
  is_discount_disabled: boolean
  cost_price: number
  markup: number
  price: number
  workshop_id?: string
  warehouse_id?: string
  ingredients: IngredientFormData[]
  modifier_sets: ModifierSetFormData[]
  active: boolean
  created_at: string
  updated_at: string
}

export type FieldErrors = {
  [key: string]: string | undefined
}

export interface UseAddTechnicalCardModalResult {
  formData: AddTechnicalCardFormData
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  fieldErrors: FieldErrors
  isFormValid: boolean
  markupLabel: string
  costPriceLabel: string
  totalIngredientsCost: number
  ingredients: Array<{ id: string; name: string; unit: 'шт' | 'л' | 'кг' }>
  handleFieldChange: (field: keyof AddTechnicalCardFormData, value: string | number | boolean) => void
  addIngredient: () => void
  updateIngredient: (id: string, updates: Partial<IngredientFormData>) => void
  removeIngredient: (id: string) => void
  addModifierSet: () => void
  updateModifierSet: (
    index: number,
    field: keyof ModifierSetFormData,
    value: ModifierSetFormData[keyof ModifierSetFormData]
  ) => void
  removeModifierSet: (index: number) => void
  addModifierOption: (setIndex: number) => void
  updateModifierOption: (
    setIndex: number,
    optionIndex: number,
    field: keyof ModifierOptionFormData,
    value: string | number
  ) => void
  removeModifierOption: (setIndex: number, optionIndex: number) => void
  toggleComposition: () => void
  handleSubmit: (e: React.FormEvent) => void
  handleClose: () => void
}

