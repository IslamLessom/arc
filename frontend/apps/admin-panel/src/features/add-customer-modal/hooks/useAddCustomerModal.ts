import { useState, useEffect, useMemo } from 'react'
import { useCustomers, useCustomerGroups, type Customer, type CustomerFormData } from '@restaurant-pos/api-client'
import type { CustomerFormData } from '../model/types'

export const useAddCustomerModal = (props: { isOpen: boolean; customerId?: string | null; onSuccess?: () => void; onClose: () => void }) => {
  const { customers, isLoading: isLoadingCustomers, updateCustomer, createCustomer } = useCustomers()
  const { customerGroups, isLoading: isLoadingGroups } = useCustomerGroups()

  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    group_id: '',
    loyalty_program_id: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Load customer data when editing
  useEffect(() => {
    if (props.isOpen && props.customerId) {
      const customer = customers.find(c => c.id === props.customerId)
      if (customer) {
        setFormData({
          name: customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          birthday: customer.birthday || '',
          group_id: customer.group_id || '',
          loyalty_program_id: customer.loyalty_program_id || '',
        })
      }
    } else if (props.isOpen && !props.customerId) {
      // Reset form for new customer
      setFormData({
        name: '',
        email: '',
        phone: '',
        birthday: '',
        group_id: '',
        loyalty_program_id: '',
      })
    }
  }, [props.isOpen, props.customerId, customers])

  const handleFieldChange = (field: keyof CustomerFormData, value: string) => {
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
      errors.name = 'Имя обязательно'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Неверный формат email'
    }

    if (formData.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(formData.birthday)) {
      errors.birthday = 'Неверный формат даты (YYYY-MM-DD)'
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
        ...(formData.email && { email: formData.email }),
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.birthday && { birthday: formData.birthday }),
        ...(formData.group_id && { group_id: formData.group_id }),
        ...(formData.loyalty_program_id && { loyalty_program_id: formData.loyalty_program_id }),
      }

      if (props.customerId) {
        await updateCustomer(props.customerId, submitData)
      } else {
        await createCustomer(submitData)
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
    return formData.name.trim().length > 0
  }, [formData])

  return {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    customerGroups,
    isLoadingCustomers,
    isLoadingGroups,
    handleFieldChange,
    handleSubmit,
    handleClose: props.onClose,
  }
}
