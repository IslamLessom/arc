import { useState, useEffect, useCallback } from 'react'
import { useGetEmployee, useCreateEmployee, useUpdateEmployee, useGetRoles } from '@restaurant-pos/api-client'
import type { AddEmployeeModalProps, AddEmployeeFormData, FieldErrors } from '../model/types'

export const useAddEmployeeModal = (props: AddEmployeeModalProps) => {
  const [formData, setFormData] = useState<AddEmployeeFormData>({
    name: '',
    phone: '',
    email: '',
    pin: '',
    role_id: ''
  })

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)

  const { data: existingEmployee, isLoading: isLoadingEmployee } = useGetEmployee(
    props.employeeId || ''
  )
  const { data: roles = [] } = useGetRoles()

  const createEmployeeMutation = useCreateEmployee()
  const updateEmployeeMutation = useUpdateEmployee()

  const isLoading = isLoadingEmployee
  const isSubmitting = createEmployeeMutation.isPending || updateEmployeeMutation.isPending

  // Load existing employee data when editing
  useEffect(() => {
    if (existingEmployee && props.employeeId) {
      setFormData({
        name: existingEmployee.name || '',
        phone: existingEmployee.phone || '',
        email: existingEmployee.email || '',
        pin: existingEmployee.pin || '',
        role_id: existingEmployee.role?.id || existingEmployee.role_id || ''
      })
    }
  }, [existingEmployee, props.employeeId])

  // Reset form when modal closes
  useEffect(() => {
    if (!props.isOpen) {
      setFormData({
        name: '',
        phone: '',
        email: '',
        pin: '',
        role_id: roles.length > 0 ? roles[0].id : ''
      })
      setFieldErrors({})
      setError(null)
    }
  }, [props.isOpen, roles])

  const validateForm = useCallback((): boolean => {
    const errors: FieldErrors = {}

    if (!formData.name.trim()) {
      errors.name = 'Имя обязательно'
    }

    if (!formData.pin.trim()) {
      errors.pin = 'Пин-код обязателен'
    } else if (formData.pin.length !== 4) {
      errors.pin = 'Пин-код должен быть 4 цифры'
    }

    if (!formData.role_id.trim()) {
      errors.role_id = 'Должность обязательна'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  const isFormValid =
    formData.name.trim().length > 0 &&
    formData.pin.trim().length === 4 &&
    formData.role_id.trim().length > 0

  const handleFieldChange = useCallback((field: keyof AddEmployeeFormData, value: string) => {
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
      if (props.employeeId) {
        // Update existing employee
        await updateEmployeeMutation.mutateAsync({
          id: props.employeeId,
          data: {
            name: formData.name,
            email: formData.email || undefined,
            phone: formData.phone || undefined,
            pin: formData.pin,
            role_id: formData.role_id
          }
        })
      } else {
        // Create new employee
        await createEmployeeMutation.mutateAsync({
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          pin: formData.pin,
          role_id: formData.role_id
        })
      }

      props.onSuccess?.()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при сохранении сотрудника'
      setError(errorMessage)
      console.error('Failed to save employee:', err)
    }
  }, [formData, props, validateForm, createEmployeeMutation, updateEmployeeMutation])

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
    roles,
    handleFieldChange,
    handleSubmit,
    handleClose
  }
}
