import { useState, useCallback } from 'react'
import {
  useCreateIngredient,
  useGetIngredientCategories,
  useGetWarehouses,
  type CreateIngredientRequest,
} from '@restaurant-pos/api-client'
import type {
  AddIngredientModalProps,
  AddIngredientFormData,
  UseAddIngredientModalResult,
} from '../model/types'

export function useAddIngredientModal(
  props: AddIngredientModalProps
): UseAddIngredientModalResult {
  const [formData, setFormData] = useState<AddIngredientFormData>({
    name: '',
    category_id: '',
    unit: 'кг',
    barcode: '',
    loss_cleaning: 0,
    loss_boiling: 0,
    loss_frying: 0,
    loss_stewing: 0,
    loss_baking: 0,
    warehouse_id: '',
    quantity: 0,
    price_per_unit: 0,
  })

  const [showAdditionalFields, setShowAdditionalFields] = useState(false)
  const [showWarehouseFields, setShowWarehouseFields] = useState(false)

  const { data: categories = [], isLoading: isLoadingCategories } =
    useGetIngredientCategories()
  const { data: warehouses = [], isLoading: isLoadingWarehouses } =
    useGetWarehouses()
  const { mutateAsync: createIngredient, isPending: isSubmitting } =
    useCreateIngredient()

  const isLoading = isLoadingCategories || isLoadingWarehouses

  const handleFieldChange = useCallback(
    (field: keyof AddIngredientFormData, value: string | number | undefined) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!formData.name || !formData.category_id || !formData.unit) {
        return
      }

      try {
        const requestData: CreateIngredientRequest = {
          name: formData.name,
          category_id: formData.category_id,
          unit: formData.unit,
          barcode: formData.barcode || undefined,
          loss_cleaning: formData.loss_cleaning || 0,
          loss_boiling: formData.loss_boiling || 0,
          loss_frying: formData.loss_frying || 0,
          loss_stewing: formData.loss_stewing || 0,
          loss_baking: formData.loss_baking || 0,
        }

        if (showWarehouseFields && formData.warehouse_id && formData.quantity && formData.price_per_unit) {
          requestData.warehouse_id = formData.warehouse_id
          requestData.quantity = formData.quantity
          requestData.price_per_unit = formData.price_per_unit
        }

        await createIngredient(requestData)
        props.onSuccess?.()
        props.onClose()
        
        // Reset form
        setFormData({
          name: '',
          category_id: '',
          unit: 'кг',
          barcode: '',
          loss_cleaning: 0,
          loss_boiling: 0,
          loss_frying: 0,
          loss_stewing: 0,
          loss_baking: 0,
          warehouse_id: '',
          quantity: 0,
          price_per_unit: 0,
        })
        setShowAdditionalFields(false)
        setShowWarehouseFields(false)
      } catch (error) {
        console.error('Failed to create ingredient:', error)
      }
    },
    [formData, showWarehouseFields, createIngredient, props]
  )

  const handleClose = useCallback(() => {
    props.onClose()
    setFormData({
      name: '',
      category_id: '',
      unit: 'кг',
      barcode: '',
      loss_cleaning: 0,
      loss_boiling: 0,
      loss_frying: 0,
      loss_stewing: 0,
      loss_baking: 0,
      warehouse_id: '',
      quantity: 0,
      price_per_unit: 0,
    })
    setShowAdditionalFields(false)
    setShowWarehouseFields(false)
  }, [props])

  const toggleAdditionalFields = useCallback(() => {
    setShowAdditionalFields((prev) => !prev)
  }, [])

  const toggleWarehouseFields = useCallback(() => {
    setShowWarehouseFields((prev) => !prev)
  }, [])

  return {
    formData,
    isLoading,
    isSubmitting,
    error: null,
    categories: categories.map((cat) => ({ id: cat.id, name: cat.name })),
    warehouses: warehouses.map((wh) => ({ id: wh.id, name: wh.name })),
    handleFieldChange,
    handleSubmit,
    handleClose,
    showAdditionalFields,
    toggleAdditionalFields,
    showWarehouseFields,
    toggleWarehouseFields,
  }
}

