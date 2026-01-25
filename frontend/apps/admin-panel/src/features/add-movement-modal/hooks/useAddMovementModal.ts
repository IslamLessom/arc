import { useState, useCallback, useMemo, useEffect } from 'react'
import { useGetWarehouses, useGetStock, useCreateMovement } from '@restaurant-pos/api-client'
import type {
  AddMovementModalProps,
  AddMovementFormData,
  MovementItemFormData,
  FieldErrors,
  UseAddMovementModalResult,
} from '../model/types'

export const useAddMovementModal = (props: AddMovementModalProps): UseAddMovementModalResult => {
  const { data: warehouses = [] } = useGetWarehouses()
  const { data: stock = [] } = useGetStock()
  const createMovementMutation = useCreateMovement()

  const [formData, setFormData] = useState<AddMovementFormData>({
    movement_date: new Date().toISOString().split('T')[0],
    movement_time_hours: new Date().getHours().toString().padStart(2, '0'),
    movement_time_minutes: new Date().getMinutes().toString().padStart(2, '0'),
    from_warehouse_id: '',
    to_warehouse_id: '',
    comment: '',
    items: [],
  })

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const isSubmitting = createMovementMutation.isPending

  useEffect(() => {
    if (!props.isOpen) {
      setFormData({
        movement_date: new Date().toISOString().split('T')[0],
        movement_time_hours: new Date().getHours().toString().padStart(2, '0'),
        movement_time_minutes: new Date().getMinutes().toString().padStart(2, '0'),
        from_warehouse_id: '',
        to_warehouse_id: '',
        comment: '',
        items: [],
      })
      setFieldErrors({})
      setError(null)
    }
  }, [props.isOpen])

  const availableItems = useMemo(() => {
    const items: Array<{ id: string; name: string; type: 'ingredient' | 'product'; unit: string }> = []

    if (formData.from_warehouse_id) {
      const warehouseStock = stock.filter((s) => s.warehouse_id === formData.from_warehouse_id && s.quantity > 0)

      warehouseStock.forEach((s) => {
        if (s.ingredient_id && s.ingredient) {
          items.push({
            id: s.ingredient_id,
            name: s.ingredient.name,
            type: 'ingredient',
            unit: s.ingredient.unit || s.unit || 'шт',
          })
        } else if (s.product_id && s.product) {
          items.push({
            id: s.product_id,
            name: s.product.name,
            type: 'product',
            unit: s.unit || 'шт',
          })
        }
      })
    }

    return items
  }, [stock, formData.from_warehouse_id])

  const totalAmount = useMemo(() => {
    return formData.items.reduce((sum, item) => sum + item.total_amount, 0)
  }, [formData.items])

  const isFormValid = useMemo(() => {
    return (
      formData.movement_date.trim().length > 0 &&
      formData.from_warehouse_id.trim().length > 0 &&
      formData.to_warehouse_id.trim().length > 0 &&
      formData.from_warehouse_id !== formData.to_warehouse_id &&
      formData.items.length > 0 &&
      formData.items.every(
        (item) => (item.ingredient_id || item.product_id) && item.quantity > 0 && item.unit.trim().length > 0
      ) &&
      Object.keys(fieldErrors).length === 0
    )
  }, [formData, fieldErrors])

  const validateField = useCallback((field: keyof AddMovementFormData, value: any) => {
    const errors: FieldErrors = { ...fieldErrors }

    switch (field) {
      case 'from_warehouse_id':
        if (!value || value.trim().length === 0) {
          errors.from_warehouse_id = 'Выберите склад отправления'
        } else if (value === formData.to_warehouse_id) {
          errors.from_warehouse_id = 'Склады должны отличаться'
        } else {
          delete errors.from_warehouse_id
        }
        break
      case 'to_warehouse_id':
        if (!value || value.trim().length === 0) {
          errors.to_warehouse_id = 'Выберите склад назначения'
        } else if (value === formData.from_warehouse_id) {
          errors.to_warehouse_id = 'Склады должны отличаться'
        } else {
          delete errors.to_warehouse_id
        }
        break
      default:
        break
    }

    setFieldErrors(errors)
  }, [fieldErrors, formData.from_warehouse_id, formData.to_warehouse_id])

  const handleFieldChange = useCallback(
    (field: keyof AddMovementFormData, value: string | MovementItemFormData[]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (typeof value === 'string') {
        validateField(field, value)
      }
    },
    [validateField]
  )

  const addItem = useCallback(() => {
    const newItem: MovementItemFormData = {
      id: `${Date.now()}-${Math.random()}`,
      quantity: 0,
      unit: 'шт',
      price_per_unit: 0,
      total_amount: 0,
    }
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }))
  }, [])

  const updateItem = useCallback((itemId: string, updates: Partial<MovementItemFormData>) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, ...updates }
          if (updates.price_per_unit !== undefined || updates.quantity !== undefined) {
            updated.total_amount = updated.price_per_unit * updated.quantity
          }
          if (updates.total_amount !== undefined && updated.quantity > 0) {
            updated.price_per_unit = updated.total_amount / updated.quantity
          }
          return updated
        }
        return item
      }),
    }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      if (!isFormValid) {
        setError('Заполните все обязательные поля')
        return
      }

      try {
        const dateTime = new Date(
          `${formData.movement_date}T${formData.movement_time_hours.padStart(2, '0')}:${formData.movement_time_minutes.padStart(2, '0')}:00`
        ).toISOString()

        const payload = {
          from_warehouse_id: formData.from_warehouse_id,
          to_warehouse_id: formData.to_warehouse_id,
          date_time: dateTime,
          comment: formData.comment || undefined,
          items: formData.items.map((item) => ({
            ingredient_id: item.ingredient_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit: item.unit,
            price_per_unit: item.price_per_unit,
          })),
        }

        await createMovementMutation.mutateAsync(payload)

        props.onSuccess?.()
        props.onClose()
      } catch (err) {
        setError((err as Error).message || 'Ошибка при создании перемещения')
      }
    },
    [formData, isFormValid, props]
  )

  const handleClose = useCallback(() => {
    props.onClose()
  }, [props])

  return {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    warehouses: warehouses.map((w) => ({ id: w.id, name: w.name })),
    availableItems,
    totalAmount,
    handleFieldChange,
    addItem,
    removeItem,
    updateItem,
    handleSubmit,
    handleClose,
  }
}

