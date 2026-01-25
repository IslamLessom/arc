import { useState, useCallback, useMemo, useEffect } from 'react'
import { useCreateInventory, useGetWarehouses, useGetInventory } from '@restaurant-pos/api-client'
import type { AddInventoryModalProps, UseAddInventoryModalResult } from '../model/types'

const getDefaultDateTime = () => {
  const now = new Date()
  return {
    date: now.toISOString().split('T')[0],
    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
  }
}

export const useAddInventoryModal = (
  props: AddInventoryModalProps
): UseAddInventoryModalResult => {
  const defaultDateTime = getDefaultDateTime()
  const [formData, setFormData] = useState({
    warehouse_id: '',
    checkType: 'at_time' as 'retroactive' | 'at_time',
    date: defaultDateTime.date,
    time: defaultDateTime.time,
    type: 'full' as 'full' | 'partial',
    comment: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { data: warehouses = [] } = useGetWarehouses()
  const { data: existingInventory } = useGetInventory(props.inventoryId)
  const createInventoryMutation = useCreateInventory()

  // Заполняем форму данными существующей инвентаризации при редактировании
  useEffect(() => {
    if (existingInventory && props.inventoryId) {
      const scheduledDate = existingInventory.scheduled_date
        ? new Date(existingInventory.scheduled_date)
        : null
      const actualDate = existingInventory.actual_date
        ? new Date(existingInventory.actual_date)
        : null
      const date = scheduledDate || actualDate || new Date()

      setFormData({
        warehouse_id: existingInventory.warehouse_id,
        checkType: scheduledDate ? 'retroactive' : 'at_time',
        date: date.toISOString().split('T')[0],
        time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
        type: existingInventory.type,
        comment: existingInventory.comment || '',
      })
    }
  }, [existingInventory, props.inventoryId])

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.warehouse_id) {
      errors.warehouse_id = 'Выберите склад'
    }
    if (!formData.date) {
      errors.date = 'Укажите дату'
    }
    if (!formData.time) {
      errors.time = 'Укажите время'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  const isFormValid = useMemo(() => {
    return formData.warehouse_id !== '' && formData.date !== '' && formData.time !== ''
  }, [formData])

  const handleFieldChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [fieldErrors])

  const handleCheckTypeChange = useCallback((type: 'retroactive' | 'at_time') => {
    setFormData((prev) => ({ ...prev, checkType: type }))
  }, [])

  const handleTypeChange = useCallback((type: 'full' | 'partial') => {
    setFormData((prev) => ({ ...prev, type }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      try {
        // Формируем дату и время
        const [hours, minutes] = formData.time.split(':')
        const dateTime = new Date(formData.date)
        dateTime.setHours(parseInt(hours, 10))
        dateTime.setMinutes(parseInt(minutes, 10))

        const scheduledDate =
          formData.checkType === 'retroactive' ? dateTime.toISOString() : undefined

        await createInventoryMutation.mutateAsync({
          warehouse_id: formData.warehouse_id,
          type: formData.type,
          scheduled_date: scheduledDate,
          comment: formData.comment || undefined,
        })

        props.onSuccess()
      } catch (error) {
        console.error('Failed to create inventory:', error)
      }
    },
    [formData, validateForm, createInventoryMutation, props]
  )

  const handleClose = useCallback(() => {
    const resetDateTime = getDefaultDateTime()
    setFormData({
      warehouse_id: '',
      checkType: 'at_time',
      date: resetDateTime.date,
      time: resetDateTime.time,
      type: 'full',
      comment: '',
    })
    setFieldErrors({})
    props.onClose()
  }, [props])

  return {
    formData,
    isSubmitting: createInventoryMutation.isPending,
    error: createInventoryMutation.error
      ? (createInventoryMutation.error as Error).message
      : null,
    fieldErrors,
    isFormValid,
    warehouses: warehouses.map((w) => ({ id: w.id, name: w.name })),
    handleFieldChange,
    handleCheckTypeChange,
    handleTypeChange,
    handleSubmit,
    handleClose,
  }
}

