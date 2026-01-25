import { useState, useEffect, useCallback } from 'react'
import { useGetWarehouse, useCreateWarehouse, useUpdateWarehouse } from '@restaurant-pos/api-client'
import type { AddWarehouseModalProps, AddWarehouseFormData, FieldErrors } from '../model/types'

export const useAddWarehouseModal = (props: AddWarehouseModalProps) => {
  const [formData, setFormData] = useState<AddWarehouseFormData>({
    name: '',
    address: '',
    establishmentIds: []
  })

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)

  const { data: existingWarehouse, isLoading: isLoadingWarehouse } = useGetWarehouse(
    props.warehouseId || ''
  )

  const createWarehouseMutation = useCreateWarehouse()
  const updateWarehouseMutation = useUpdateWarehouse()

  const isLoading = isLoadingWarehouse
  const isSubmitting = createWarehouseMutation.isPending || updateWarehouseMutation.isPending

  // Load existing warehouse data when editing
  useEffect(() => {
    if (existingWarehouse && props.warehouseId) {
      setFormData({
        name: existingWarehouse.name || '',
        address: existingWarehouse.address || '',
        establishmentIds: [] // TODO: Load from API when available
      })
    }
  }, [existingWarehouse, props.warehouseId])

  // Reset form when modal closes
  useEffect(() => {
    if (!props.isOpen) {
      setFormData({
        name: '',
        address: '',
        establishmentIds: []
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

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  const isFormValid = formData.name.trim().length > 0

  const handleFieldChange = useCallback((field: keyof AddWarehouseFormData, value: string | string[]) => {
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

  const handleEstablishmentToggle = useCallback((establishmentId: string) => {
    setFormData(prev => {
      const isSelected = prev.establishmentIds.includes(establishmentId)
      return {
        ...prev,
        establishmentIds: isSelected
          ? prev.establishmentIds.filter(id => id !== establishmentId)
          : [...prev.establishmentIds, establishmentId]
      }
    })
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    try {
      if (props.warehouseId) {
        // Update existing warehouse
        await updateWarehouseMutation.mutateAsync({
          id: props.warehouseId,
          data: {
            name: formData.name,
            address: formData.address || undefined
          }
        })
      } else {
        // Create new warehouse
        await createWarehouseMutation.mutateAsync({
          name: formData.name,
          address: formData.address || undefined
        })
      }

      props.onSuccess?.()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при сохранении склада'
      setError(errorMessage)
      console.error('Failed to save warehouse:', err)
    }
  }, [formData, props, validateForm, createWarehouseMutation, updateWarehouseMutation])

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      props.onClose()
    }
  }, [isSubmitting, props])

  // TODO: Load establishments from API when endpoint becomes available
  const establishments: Array<{ id: string; name: string }> = [
    { id: '1', name: 'Ebari' }
  ]

  return {
    formData,
    isLoading,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    establishments,
    handleFieldChange,
    handleEstablishmentToggle,
    handleSubmit,
    handleClose
  }
}

