export interface EditIngredientModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  ingredientId: string
}