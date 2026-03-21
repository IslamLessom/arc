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

type NamedEntity = {
  id?: string
  ID?: string
  name?: string
  Name?: string
}

const normalizeNamedEntities = (value: unknown): NamedEntity[] => {
  if (Array.isArray(value)) {
    return value as NamedEntity[]
  }

  if (value && typeof value === 'object') {
    const maybeWrapped = (value as { data?: unknown }).data
    if (Array.isArray(maybeWrapped)) {
      return maybeWrapped as NamedEntity[]
    }
  }

  return []
}

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
  const [error, setError] = useState<string | null>(null)

  const { data: categoriesData, isLoading: isLoadingCategories, refetch: refetchCategories } =
    useGetIngredientCategories()
  const { data: warehousesData, isLoading: isLoadingWarehouses, refetch: refetchWarehouses } =
    useGetWarehouses()
  const { mutateAsync: createIngredient, isPending: isSubmitting } =
    useCreateIngredient()

  const categories = normalizeNamedEntities(categoriesData)
  const warehouses = normalizeNamedEntities(warehousesData)

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
      setError(null)

      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        setError('Введите название ингредиента')
        return
      }

      if (!formData.category_id) {
        setError('Выберите категорию')
        return
      }

      if (!formData.unit) {
        setError('Выберите единицу измерения')
        return
      }

      try {
        console.log('Submitting ingredient form with data:', formData)
        const requestData: CreateIngredientRequest = {
          name: formData.name.trim(),
          category_id: formData.category_id,
          unit: formData.unit,
          barcode: formData.barcode || undefined,
          loss_cleaning: formData.loss_cleaning || 0,
          loss_boiling: formData.loss_boiling || 0,
          loss_frying: formData.loss_frying || 0,
          loss_stewing: formData.loss_stewing || 0,
          loss_baking: formData.loss_baking || 0,
          quantity: formData.quantity || 0,
          price_per_unit: formData.price_per_unit || 0,
        }

        // Only add warehouse_id if warehouse fields are shown and warehouse is selected
        if (showWarehouseFields && formData.warehouse_id) {
          requestData.warehouse_id = formData.warehouse_id
        }

        console.log('Creating ingredient with request:', requestData)
        await createIngredient(requestData)
        console.log('Ingredient created successfully')
        
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
        setError(null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ошибка при создании ингредиента'
        console.error('Failed to create ingredient:', err)
        setError(errorMessage)
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
    setError(null)
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
    error,
    categories: categories
      .map((cat) => ({
        id: String(cat.id ?? cat.ID ?? ''),
        name: String(cat.name ?? cat.Name ?? ''),
      }))
      .filter((cat) => Boolean(cat.id && cat.name)),
    warehouses: warehouses
      .map((wh) => ({
        id: String(wh.id ?? wh.ID ?? ''),
        name: String(wh.name ?? wh.Name ?? ''),
      }))
      .filter((wh) => Boolean(wh.id && wh.name)),
    refetchCategories,
    refetchWarehouses,
    handleFieldChange,
    handleSubmit,
    handleClose,
    showAdditionalFields,
    toggleAdditionalFields,
    showWarehouseFields,
    toggleWarehouseFields,
  }
}

