export interface EditTechnicalCardModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (updatedCard: any) => void
  cardId: string
}

export interface EditTechnicalCardFormData {
  name: string
  category: string
  ingredients: number
  weight: number
  cost: number
  price: number
  margin: number
  status: 'active' | 'inactive'
}

export interface UseEditTechnicalCardModalResult {
  formData: EditTechnicalCardFormData
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  handleFieldChange: (field: keyof EditTechnicalCardFormData, value: string | number) => void
  handleSubmit: (e: React.FormEvent) => void
  handleClose: () => void
}
