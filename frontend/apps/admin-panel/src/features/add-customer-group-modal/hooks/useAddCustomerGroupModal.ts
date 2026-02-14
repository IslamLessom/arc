import { useState, useEffect, useMemo } from 'react'
import { useCustomerGroups } from '@restaurant-pos/api-client'
import type { CustomerGroupFormData } from '../model/types'

export const useAddCustomerGroupModal = (props: { isOpen: boolean; groupId?: string | null; onSuccess?: () => void; onClose: () => void }) => {
  const { customerGroups, isLoading: isLoadingGroups, updateCustomerGroup, createCustomerGroup } = useCustomerGroups()

  const [formData, setFormData] = useState<CustomerGroupFormData>({
    name: '',
    description: '',
    discount_percentage: '0',
    min_orders: '',
    min_spent: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Load group data when editing
  useEffect(() => {
    if (props.isOpen && props.groupId) {
      const group = customerGroups.find(g => g.id === props.groupId)
      if (group) {
        setFormData({
          name: group.name || '',
          description: group.description || '',
          discount_percentage: String(group.discount_percentage || 0),
          min_orders: String(group.min_orders || ''),
          min_spent: String(group.min_spent || ''),
        })
      }
    } else if (props.isOpen && !props.groupId) {
      // Reset form for new group
      setFormData({
        name: '',
        description: '',
        discount_percentage: '0',
        min_orders: '',
        min_spent: '',
      })
    }
  }, [props.isOpen, props.groupId, customerGroups])

  const handleFieldChange = (field: keyof CustomerGroupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user types
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Название обязательно'
    }

    const discount = parseFloat(formData.discount_percentage)
    if (isNaN(discount) || discount < 0 || discount > 100) {
      errors.discount_percentage = 'Скидка должна быть от 0 до 100'
    }

    if (formData.min_orders && isNaN(parseInt(formData.min_orders, 10))) {
      errors.min_orders = 'Неверный формат'
    }

    if (formData.min_spent && isNaN(parseFloat(formData.min_spent))) {
      errors.min_spent = 'Неверный формат'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const submitData = {
        name: formData.name,
        description: formData.description || undefined,
        discount_percentage: parseFloat(formData.discount_percentage),
        min_orders: formData.min_orders ? parseInt(formData.min_orders, 10) : undefined,
        min_spent: formData.min_spent ? parseFloat(formData.min_spent) : undefined,
      }

      if (props.groupId) {
        await updateCustomerGroup(props.groupId, submitData)
      } else {
        await createCustomerGroup(submitData)
      }

      props.onSuccess?.()
      props.onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = useMemo(() => {
    return formData.name.trim().length > 0 &&
           !isNaN(parseFloat(formData.discount_percentage)) &&
           parseFloat(formData.discount_percentage) >= 0 &&
           parseFloat(formData.discount_percentage) <= 100
  }, [formData])

  return {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    isLoadingGroups,
    handleFieldChange,
    handleSubmit,
    handleClose: props.onClose,
  }
}
