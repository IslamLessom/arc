import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateSupply, useUpdateSupply, useGetSupply, useGetWarehouses, useGetSuppliers, useGetIngredients, useGetStock } from '@restaurant-pos/api-client'
import type { AddSupplyFormData, SupplyItemFormData, PaymentFormData, FieldErrors } from '../model/types'

export const useAddSupply = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const createSupplyMutation = useCreateSupply()
  const updateSupplyMutation = useUpdateSupply()
  const { data: existingSupply, isLoading: isLoadingSupply } = useGetSupply(id)
  const { data: warehouses = [] } = useGetWarehouses()
  const { data: suppliers = [] } = useGetSuppliers()
  const { data: ingredients = [] } = useGetIngredients()
  const { data: stock = [] } = useGetStock()

  const [formData, setFormData] = useState<AddSupplyFormData>({
    delivery_date: new Date().toISOString().split('T')[0],
    delivery_time_hours: new Date().getHours().toString().padStart(2, '0'),
    delivery_time_minutes: new Date().getMinutes().toString().padStart(2, '0'),
    supplier_id: '',
    warehouse_id: '',
    comment: '',
    items: [],
    payments: []
  })

  // Load existing supply data when editing
  useEffect(() => {
    if (isEditMode && existingSupply) {
      const date = new Date(existingSupply.delivery_date_time)
      setFormData({
        delivery_date: date.toISOString().split('T')[0],
        delivery_time_hours: date.getHours().toString().padStart(2, '0'),
        delivery_time_minutes: date.getMinutes().toString().padStart(2, '0'),
        supplier_id: existingSupply.supplier_id,
        warehouse_id: existingSupply.warehouse_id,
        comment: existingSupply.comment || '',
        items: existingSupply.items?.map(item => ({
          id: `${Date.now()}-${Math.random()}`,
          ingredient_id: item.ingredient_id,
          product_id: item.product_id,
          ingredient_name: item.ingredient?.name,
          product_name: item.product?.name,
          unit: item.unit,
          quantity: item.quantity,
          price_per_unit: item.price_per_unit,
          total_amount: item.total_amount
        })) || [],
        payments: []
      })
    }
  }, [isEditMode, existingSupply])

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const isSubmitting = createSupplyMutation.isPending || updateSupplyMutation.isPending
  const error = (createSupplyMutation.error || updateSupplyMutation.error) ? (createSupplyMutation.error as Error)?.message || (updateSupplyMutation.error as Error)?.message : null

  const isFormValid = useMemo(() => {
    return (
      formData.delivery_date.trim().length > 0 &&
      formData.supplier_id.trim().length > 0 &&
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

  const validateField = useCallback((field: keyof AddSupplyFormData, value: any) => {
    const errors: FieldErrors = { ...fieldErrors }

    switch (field) {
      case 'supplier_id':
        if (!value || value.trim().length === 0) {
          errors.supplier_id = 'Выберите поставщика'
        } else {
          delete errors.supplier_id
        }
        break
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

  const handleFieldChange = useCallback((field: keyof AddSupplyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
  }, [validateField])

  const addItem = useCallback(() => {
    const newItem: SupplyItemFormData = {
      id: `${Date.now()}-${Math.random()}`,
      quantity: 0,
      unit: 'шт',
      price_per_unit: 0,
      total_amount: 0
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

  const updateItem = useCallback((itemId: string, updates: Partial<SupplyItemFormData>) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updated = { ...item, ...updates }
          // Пересчитываем total_amount если изменились price_per_unit или quantity
          if (updates.price_per_unit !== undefined || updates.quantity !== undefined) {
            updated.total_amount = updated.price_per_unit * updated.quantity
          }
          // Пересчитываем price_per_unit если изменился total_amount
          if (updates.total_amount !== undefined && updated.quantity > 0) {
            updated.price_per_unit = updated.total_amount / updated.quantity
          }
          return updated
        }
        return item
      })
    }))
  }, [])

  const addPayment = useCallback(() => {
    const newPayment: PaymentFormData = {
      id: `${Date.now()}-${Math.random()}`,
      account_type: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_time_hours: new Date().getHours().toString().padStart(2, '0'),
      payment_time_minutes: new Date().getMinutes().toString().padStart(2, '0'),
      amount: 0
    }
    setFormData(prev => ({
      ...prev,
      payments: [...prev.payments, newPayment]
    }))
  }, [])

  const removePayment = useCallback((paymentId: string) => {
    setFormData(prev => ({
      ...prev,
      payments: prev.payments.filter(payment => payment.id !== paymentId)
    }))
  }, [])

  const updatePayment = useCallback((paymentId: string, updates: Partial<PaymentFormData>) => {
    setFormData(prev => ({
      ...prev,
      payments: prev.payments.map(payment => {
        if (payment.id === paymentId) {
          return { ...payment, ...updates }
        }
        return payment
      })
    }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) return

    // Формируем дату и время в формате RFC3339
    const deliveryDateTime = new Date(
      `${formData.delivery_date}T${formData.delivery_time_hours.padStart(2, '0')}:${formData.delivery_time_minutes.padStart(2, '0')}:00`
    ).toISOString()

    try {
      const supplyData = {
        warehouse_id: formData.warehouse_id,
        supplier_id: formData.supplier_id,
        delivery_date_time: deliveryDateTime,
        status: 'completed' as const,
        comment: formData.comment,
        items: formData.items.map(item => ({
          ingredient_id: item.ingredient_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit: item.unit,
          price_per_unit: item.price_per_unit,
          total_amount: item.total_amount
        }))
      }

      if (isEditMode && id) {
        await updateSupplyMutation.mutateAsync({ id, data: supplyData })
      } else {
        await createSupplyMutation.mutateAsync(supplyData)
      }
      navigate('/warehouse/deliveries')
    } catch (err) {
      console.error('Failed to save supply:', err)
    }
  }, [formData, isFormValid, createSupplyMutation, updateSupplyMutation, navigate, isEditMode, id])

  const handleBack = useCallback(() => {
    navigate('/warehouse/deliveries')
  }, [navigate])

  const totalAmount = useMemo(() => {
    return formData.items.reduce((sum, item) => sum + item.total_amount, 0)
  }, [formData.items])

  const totalPayments = useMemo(() => {
    return formData.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
  }, [formData.payments])

  const remainingAmount = totalAmount - totalPayments

  // Получаем список доступных товаров/ингредиентов
  // Используем все ингредиенты, а не только те, что в stock
  const availableItems = useMemo(() => {
    const allIngredients = ingredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      unit: ing.unit
    }))
    
    // Для продуктов используем stock, так как нет отдельного API для продуктов
    const warehouseStock = formData.warehouse_id 
      ? stock.filter(s => s.warehouse_id === formData.warehouse_id)
      : stock
    const stockProducts = warehouseStock
      .filter(s => s.product_id && s.product)
      .map(s => ({ id: s.product_id!, name: s.product!.name, unit: s.unit }))
    
    return { ingredients: allIngredients, products: stockProducts }
  }, [ingredients, stock, formData.warehouse_id])

  return {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    warehouses,
    suppliers,
    ingredients,
    availableItems,
    totalAmount,
    totalPayments,
    remainingAmount,
    handleFieldChange,
    addItem,
    removeItem,
    updateItem,
    addPayment,
    removePayment,
    updatePayment,
    handleSubmit,
    handleBack,
    isEditMode,
    isLoadingSupply
  }
}

