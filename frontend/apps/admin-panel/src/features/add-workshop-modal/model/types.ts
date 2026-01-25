export interface AddWorkshopModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  workshopId?: string
}

export interface AddWorkshopFormData {
  name: string
  print_slips: boolean
}

export interface UseAddWorkshopModalResult {
  formData: AddWorkshopFormData
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  handleFieldChange: (field: keyof AddWorkshopFormData, value: string | boolean) => void
  handleSubmit: (e: React.FormEvent) => void
  handleClose: () => void
}

