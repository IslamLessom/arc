import { useState, useEffect, useCallback } from 'react'
import { useGetSupplier, useCreateSupplier, useUpdateSupplier } from '@restaurant-pos/api-client'
import type { AddSupplierModalProps, AddSupplierFormData, FieldErrors } from '../model/types'

export const useAddSupplierModal = (props: AddSupplierModalProps) => {
  const [formData, setFormData] = useState<AddSupplierFormData>({
    name: '',
    taxpayer_number: '',
    phone: '',
    address: '',
    comment: ''
  })

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)

  const { data: existingSupplier, isLoading: isLoadingSupplier } = useGetSupplier(
    props.supplierId || ''
  )

  const createSupplierMutation = useCreateSupplier()
  const updateSupplierMutation = useUpdateSupplier()

  const isLoading = isLoadingSupplier
  const isSubmitting = createSupplierMutation.isPending || updateSupplierMutation.isPending

  // Load existing supplier data when editing
  useEffect(() => {
    if (existingSupplier && props.supplierId) {
      setFormData({
        name: existingSupplier.name || '',
        taxpayer_number: existingSupplier.taxpayer_number || '',
        phone: existingSupplier.phone || '',
        address: existingSupplier.address || '',
        comment: existingSupplier.comment || ''
      })
    }
  }, [existingSupplier, props.supplierId])

  // Reset form when modal closes
  useEffect(() => {
    if (!props.isOpen) {
      setFormData({
        name: '',
        taxpayer_number: '',
        phone: '',
        address: '',
        comment: ''
      })
      setFieldErrors({})
      setError(null)
    }
  }, [props.isOpen])

  const validateForm = useCallback((): boolean => {
    const errors: FieldErrors = {}

    if (!formData.name.trim()) {
      errors.name = 'Имя обязательно'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  const isFormValid = formData.name.trim().length > 0

  const handleFieldChange = useCallback((field: keyof AddSupplierFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [fieldErrors])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    try {
      if (props.supplierId) {
        // Update existing supplier
        await updateSupplierMutation.mutateAsync({
          id: props.supplierId,
          data: {
            name: formData.name,
            taxpayer_number: formData.taxpayer_number || undefined,
            phone: formData.phone || undefined,
            address: formData.address || undefined,
            comment: formData.comment || undefined
          }
        })
      } else {
        // Create new supplier
        await createSupplierMutation.mutateAsync({
          name: formData.name,
          taxpayer_number: formData.taxpayer_number || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          comment: formData.comment || undefined
        })
      }

      props.onSuccess?.()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при сохранении поставщика'
      setError(errorMessage)
      console.error('Failed to save supplier:', err)
    }
  }, [formData, props, validateForm, createSupplierMutation, updateSupplierMutation])

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      props.onClose()
    }
  }, [isSubmitting, props])

  return {
    formData,
    isLoading,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    handleFieldChange,
    handleSubmit,
    handleClose
  }
}

