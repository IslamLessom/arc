export interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  productId?: string
}

export interface AddProductFormData {
  name: string
  category_id: string
  warehouse_id: string
  workshop_id?: string
  description?: string
  cost_price?: string
  markup?: string
  price?: string
  barcode?: string
  is_weighted: boolean
  exclude_from_discounts: boolean
  has_modifications: boolean
  cover_image?: string
}

export type FieldErrors = {
  [key: string]: string | undefined
}

export interface UseAddProductModalResult {
  formData: AddProductFormData
  totalPrice: string
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  fieldErrors: FieldErrors
  isFormValid: boolean
  categories: Array<{ id: string; name: string }>
  workshops: Array<{ id: string; name: string }>
  warehouses: Array<{ id: string; name: string }>
  handleFieldChange: (field: keyof AddProductFormData, value: string | boolean) => void
  handleSubmit: (e: React.FormEvent, shouldCreateAnother?: boolean) => void
  handleClose: () => void
  modalRef: React.RefObject<HTMLDivElement>
  firstFocusableRef: React.RefObject<HTMLInputElement>
  handleTabKey: (e: KeyboardEvent) => void
  handleEscape: (e: KeyboardEvent) => void
}

export interface ProductFormProps {
  formData: AddProductFormData
  fieldErrors?: FieldErrors
  isSubmitting: boolean
  categories: Array<{ id: string; name: string }>
  workshops: Array<{ id: string; name: string }>
  warehouses: Array<{ id: string; name: string }>
  handleFieldChange: (field: keyof AddProductFormData, value: string | boolean) => void
  firstFocusableRef: React.RefObject<HTMLInputElement>
}

export interface UseProductFormResult {
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  handleWarehouseChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  handleWorkshopChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  handleImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleWeightedChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleExcludeFromDiscountsChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleModificationsWithoutChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleModificationsWithChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleBarcodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleCostPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleMarkupChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handlePriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}
