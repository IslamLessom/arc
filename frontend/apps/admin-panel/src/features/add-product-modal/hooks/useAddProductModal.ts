import { useState, useEffect, useCallback, useRef } from 'react'
import {
  useGetProduct,
  useCreateProduct,
  useUpdateProduct,
  useGetCategories,
  useGetWarehouses,
  useGetWorkshops,
} from '@restaurant-pos/api-client'
import type {
  AddProductModalProps,
  AddProductFormData,
  FieldErrors,
} from '../model/types'

export const useAddProductModal = (props: AddProductModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<AddProductFormData>({
    name: '',
    category_id: '',
    warehouse_id: '',
    workshop_id: undefined,
    description: '',
    cost_price: '',
    markup: '',
    price: '',
    barcode: '',
    is_weighted: false,
    exclude_from_discounts: false,
    has_modifications: false,
    cover_image: undefined,
  })

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)

  const { data: existingProduct, isLoading: isLoadingProduct } = useGetProduct(
    props.productId || ''
  )

  const { data: categories = [] } = useGetCategories({ type: 'product' })
  const { data: warehouses = [] } = useGetWarehouses()
  const { data: workshops = [] } = useGetWorkshops()

  const createProductMutation = useCreateProduct()
  const updateProductMutation = useUpdateProduct()

  const isLoading = isLoadingProduct
  const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending

  // Load existing product data when editing
  useEffect(() => {
    if (existingProduct && props.productId) {
      setFormData({
        name: existingProduct.name || '',
        category_id: existingProduct.category_id || '',
        warehouse_id: existingProduct.warehouse_id || '',
        workshop_id: existingProduct.workshop_id || undefined,
        description: existingProduct.description || '',
        cost_price: existingProduct.cost_price?.toString() || '',
        markup: existingProduct.markup?.toString() || '',
        price: existingProduct.price?.toString() || '',
        barcode: existingProduct.barcode || '',
        is_weighted: existingProduct.is_weighted || false,
        exclude_from_discounts: existingProduct.exclude_from_discounts || false,
        has_modifications: existingProduct.has_modifications || false,
        cover_image: existingProduct.cover_image ? existingProduct.cover_image : undefined,
      })
    }
  }, [existingProduct, props.productId])

  // Reset form when modal closes
  useEffect(() => {
    if (!props.isOpen) {
      setFormData({
        name: '',
        category_id: '',
        warehouse_id: '',
        workshop_id: undefined,
        description: '',
        cost_price: '',
        markup: '',
        price: '',
        barcode: '',
        is_weighted: false,
        exclude_from_discounts: false,
        has_modifications: false,
        cover_image: undefined,
      })
      setFieldErrors({})
      setError(null)
    }
  }, [props.isOpen])

  const validateForm = useCallback((): boolean => {
    const errors: FieldErrors = {}

    if (!formData.name.trim()) {
      errors.name = 'Название обязательно'
    }

    if (!formData.category_id) {
      errors.category_id = 'Категория обязательна'
    }

    if (!formData.warehouse_id) {
      errors.warehouse_id = 'Склад обязателен'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  const isFormValid = formData.name.trim().length > 0 && formData.category_id.length > 0 && formData.warehouse_id.length > 0

  // Calculate total price (cost_price + markup%) for display only
  const calculateTotalPrice = useCallback(() => {
    const costPrice = parseFloat(formData.cost_price || '0')
    const markup = parseFloat(formData.markup || '0')
    if (costPrice > 0 && markup > 0) {
      const total = costPrice * (1 + markup / 100)
      return total.toFixed(2)
    }
    // If price is manually set, use it; otherwise return 0
    return formData.price || '0'
  }, [formData.cost_price, formData.markup, formData.price])

  const handleFieldChange = useCallback(
    (field: keyof AddProductFormData, value: string | boolean) => {
      setFormData((prev) => {
        const updated = {
          ...prev,
          [field]: value,
        }

        // Handle price calculations
        const costPrice = parseFloat(updated.cost_price || '0')
        const markup = parseFloat(updated.markup || '0')
        const price = parseFloat(updated.price || '0')

        if (field === 'cost_price') {
          // When cost_price changes
          if (price > 0 && costPrice > 0) {
            // Calculate markup from price and cost_price
            const calculatedMarkup = ((price - costPrice) / costPrice) * 100
            updated.markup = calculatedMarkup.toFixed(2)
          } else if (markup > 0) {
            // Calculate price from cost_price and markup
            const calculatedPrice = costPrice * (1 + markup / 100)
            updated.price = calculatedPrice.toFixed(2)
          }
        } else if (field === 'markup') {
          // When markup changes, calculate price
          if (costPrice > 0) {
            const calculatedPrice = costPrice * (1 + markup / 100)
            updated.price = calculatedPrice.toFixed(2)
          }
        } else if (field === 'price') {
          // When price (total) changes, calculate markup
          if (costPrice > 0 && price > 0) {
            const calculatedMarkup = ((price - costPrice) / costPrice) * 100
            updated.markup = calculatedMarkup.toFixed(2)
          }
        }

        return updated
      })

      // Clear error for this field
      if (fieldErrors[field]) {
        setFieldErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    },
    [fieldErrors]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent, shouldCreateAnother = false) => {
      e.preventDefault()
      setError(null)

      if (!validateForm()) {
        return
      }

      try {
        // Calculate price from cost_price and markup if both are provided
        let finalPrice = formData.price
        const costPrice = parseFloat(formData.cost_price || '0')
        const markup = parseFloat(formData.markup || '0')
        if (costPrice > 0 && markup > 0) {
          finalPrice = (costPrice * (1 + markup / 100)).toFixed(2)
        }

        const data = {
          name: formData.name,
          category_id: formData.category_id,
          warehouse_id: formData.warehouse_id,
          workshop_id: formData.workshop_id,
          description: formData.description || undefined,
          cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
          markup: formData.markup ? parseFloat(formData.markup) : undefined,
          price: finalPrice ? parseFloat(finalPrice) : undefined,
          barcode: formData.barcode || undefined,
          is_weighted: formData.is_weighted,
          exclude_from_discounts: formData.exclude_from_discounts,
          has_modifications: formData.has_modifications,
          cover_image: formData.cover_image || undefined,
        }

        if (props.productId) {
          // Update existing product
          await updateProductMutation.mutateAsync({
            id: props.productId,
            data,
          })
        } else {
          // Create new product
          await createProductMutation.mutateAsync(data)
        }

        if (shouldCreateAnother && !props.productId) {
          // Reset form for new product
          setFormData({
            name: '',
            category_id: '',
            warehouse_id: '',
            workshop_id: undefined,
            description: '',
            cost_price: '',
            markup: '',
            price: '',
            barcode: '',
            is_weighted: false,
            exclude_from_discounts: false,
            has_modifications: false,
            cover_image: undefined,
          })
          setFieldErrors({})
          setError(null)
        } else {
          props.onSuccess?.()
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Произошла ошибка при сохранении товара'
        setError(errorMessage)
        console.error('Failed to save product:', err)
      }
    },
    [formData, props, validateForm, createProductMutation, updateProductMutation]
  )

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      props.onClose()
    }
  }, [isSubmitting, props])

  // Keyboard handlers for accessibility
  const handleTabKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    },
    []
  )

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        handleClose()
      }
    },
    [isSubmitting, handleClose]
  )

  return {
    formData,
    totalPrice: calculateTotalPrice(),
    isLoading,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    categories: categories.map((cat) => ({ id: cat.id, name: cat.name })),
    workshops: workshops.map((w) => ({ id: w.id, name: w.name })),
    warehouses: warehouses.map((w) => ({ id: w.id, name: w.name })),
    handleFieldChange,
    handleSubmit,
    handleClose,
    modalRef,
    firstFocusableRef,
    handleTabKey,
    handleEscape,
  }
}
