export interface OnboardingFormProps {
  onSubmit?: (data: OnboardingFormData) => void
  onCancel?: () => void
}

export interface OnboardingFormData {
  establishment_name: string
  address: string
  phone: string
  email: string
  type: string
  has_seating_places: boolean
  table_count: number
  has_takeaway: boolean
  has_delivery: boolean
}

export interface UseOnboardingFormResult {
  establishment_name: string
  address: string
  phone: string
  email: string
  type: string
  has_seating_places: boolean
  table_count: number
  has_takeaway: boolean
  has_delivery: boolean
  isLoading: boolean
  error: string | null
  handleEstablishmentNameChange: (value: string) => void
  handleAddressChange: (value: string) => void
  handlePhoneChange: (value: string) => void
  handleEmailChange: (value: string) => void
  handleTypeChange: (value: string) => void
  handleHasSeatingPlacesChange: (value: boolean) => void
  handleTableCountChange: (value: number) => void
  handleHasTakeawayChange: (value: boolean) => void
  handleHasDeliveryChange: (value: boolean) => void
  handleSubmit: (e: React.FormEvent) => void
}

