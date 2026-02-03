import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateWriteOff, useGetWarehouses, useGetIngredients, useGetProducts, useGetStock } from '@restaurant-pos/api-client'
import type { AddWriteOffFormData, WriteOffItemFormData, FieldErrors } from '../model/types'

export const useAddWriteOff = () => {
  const navigate = useNavigate()
  const createWriteOffMutation = useCreateWriteOff()
  const { data: warehouses = [] } = useGetWarehouses()
  const { data: ingredients = [] } = useGetIngredients()
  const { data: products = [] } = useGetProducts()
  const { data: stock = [] } = useGetStock()

  const [formData, setFormData] = useState<AddWriteOffFormData>({
    write_off_date: new Date().toISOString().split('T')[0],
    write_off_time_hours: new Date().getHours().toString().padStart(2, '0'),
    write_off_time_minutes: new Date().getMinutes().toString().padStart(2, '0'),
    warehouse_id: '',
    reason: 'Без причины',
    comment: '',
    items: [{
      id: `${Date.now()}-${Math.random()}`,
      quantity: 0,
      unit: 'шт',
      details: ''
    }]
  })

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const isSubmitting = createWriteOffMutation.isPending
  const error = createWriteOffMutation.error ? (createWriteOffMutation.error as Error)?.message : null

  const isFormValid = useMemo(() => {
    return (
      formData.write_off_date.trim().length > 0 &&
      formData.warehouse_id.trim().length > 0 &&
      formData.items.length > 0 &&
      formData.items.every(item => 
        (item.ingredient_id || item.product_id) && 
        item.quantity > 0 && 
        item.unit.trim().length > 0
      ) &&
      Object.keys(fieldErrors).length === 0
    )
  }, [formData, fieldErrors])

  const validateField = useCallback((field: keyof AddWriteOffFormData, value: any) => {
    const errors: FieldErrors = { ...fieldErrors }

    switch (field) {
      case 'warehouse_id':
        if (!value || value.trim().length === 0) {
          errors.warehouse_id = 'Выберите склад'
        } else {
          delete errors.warehouse_id
        }
        break
      default:
        break
    }

    setFieldErrors(errors)
  }, [fieldErrors])

  const handleFieldChange = useCallback((field: keyof AddWriteOffFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
  }, [validateField])

  const addItem = useCallback(() => {
    const newItem: WriteOffItemFormData = {
      id: `${Date.now()}-${Math.random()}`,
      quantity: 0,
      unit: 'шт',
      details: ''
    }
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
  }, [])

  const updateItem = useCallback((itemId: string, updates: Partial<WriteOffItemFormData>) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          return { ...item, ...updates }
        }
        return item
      })
    }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) return

    // Формируем дату и время в формате RFC3339
    const writeOffDateTime = new Date(
      `${formData.write_off_date}T${formData.write_off_time_hours.padStart(2, '0')}:${formData.write_off_time_minutes.padStart(2, '0')}:00`
    ).toISOString()

    try {
      const writeOffData = {
        warehouse_id: formData.warehouse_id,
        write_off_date_time: writeOffDateTime,
        reason: formData.reason,
        comment: formData.comment,
        items: formData.items.map(item => ({
          ingredient_id: item.ingredient_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit: item.unit,
          details: item.details
        }))
      }

      await createWriteOffMutation.mutateAsync(writeOffData)
      navigate('/warehouse/write-offs')
    } catch (err) {
      console.error('Failed to save write-off:', err)
    }
  }, [formData, isFormValid, createWriteOffMutation, navigate])

  const handleBack = useCallback(() => {
    navigate('/warehouse/write-offs')
  }, [navigate])

  const handleManageReasons = useCallback(() => {
    navigate('/warehouse/write-offs?tab=reasons')
  }, [navigate])

  // Получаем список доступных товаров/ингредиентов
  const availableItems = useMemo(() => {
    const allIngredients = ingredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      unit: ing.unit
    }))
    
    const allProducts = products.map(prod => ({
      id: prod.id,
      name: prod.name,
      unit: 'шт' // Продукты обычно в штуках
    }))
    
    return { ingredients: allIngredients, products: allProducts }
  }, [ingredients, products])

  return {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    warehouses,
    availableItems,
    handleFieldChange,
    addItem,
    removeItem,
    updateItem,
    handleSubmit,
    handleBack,
    handleManageReasons,
  }
}

