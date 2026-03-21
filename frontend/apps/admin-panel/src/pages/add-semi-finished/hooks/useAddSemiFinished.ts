import { useState, useCallback, useMemo, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  useCreateSemiFinishedProduct,
  useGetIngredients,
  useGetSemiFinishedProducts,
  useGetStock,
  useUpdateSemiFinishedProduct,
  type SemiFinishedProduct,
} from '@restaurant-pos/api-client'
import type { AddSemiFinishedFormData, SemiFinishedIngredient, FieldErrors, UseAddSemiFinishedResult } from '../model/types'

export const useAddSemiFinished = (): UseAddSemiFinishedResult => {
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const createMutation = useCreateSemiFinishedProduct()
  const updateMutation = useUpdateSemiFinishedProduct()
  const { data: apiIngredients = [] } = useGetIngredients()
  const { data: stock = [] } = useGetStock()
  const { data: semiFinishedProducts = [], isLoading: isSemiFinishedLoading } = useGetSemiFinishedProducts()

  const locationState = location.state as { semiFinishedProduct?: SemiFinishedProduct } | null

  const existingSemiFinished = useMemo(() => {
    if (!isEditMode || !id) return undefined

    if (locationState?.semiFinishedProduct?.id === id) {
      return locationState.semiFinishedProduct
    }

    return semiFinishedProducts.find((product) => product.id === id)
  }, [isEditMode, id, locationState?.semiFinishedProduct, semiFinishedProducts])

  const isInitialLoading = isEditMode && !existingSemiFinished && isSemiFinishedLoading

  const [formData, setFormData] = useState<AddSemiFinishedFormData>({
    name: '',
    cooking_process: '',
    ingredients: []
  })
  const [isFormInitialized, setIsFormInitialized] = useState(false)

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const error = createMutation.error
    ? (createMutation.error as Error).message
    : updateMutation.error
      ? (updateMutation.error as Error).message
      : null

  const normalizeUnit = useCallback((unit: string | undefined): 'г' | 'мл' | 'шт' => {
    switch (unit) {
      case 'kg':
      case 'gram':
      case 'г':
      case 'кг':
        return 'г'
      case 'liter':
      case 'ml':
      case 'л':
      case 'мл':
        return 'мл'
      default:
        return 'шт'
    }
  }, [])

  const ingredients = useMemo(() => {
    return apiIngredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      unit: (ing.unit || 'шт') as 'шт' | 'л' | 'кг'
    }))
  }, [apiIngredients])

  const isFormValid = useMemo(() => {
    return (
      formData.name.trim().length > 0 &&
      formData.ingredients.length > 0 &&
      formData.ingredients.every(ing => 
        ing.ingredient_id && 
        ing.gross > 0 && 
        ing.net > 0
      ) &&
      Object.keys(fieldErrors).length === 0
    )
  }, [formData, fieldErrors])

  const validateField = useCallback((field: keyof AddSemiFinishedFormData, value: string) => {
    const errors: FieldErrors = { ...fieldErrors }

    switch (field) {
      case 'name':
        if (!value || value.trim().length === 0) {
          errors.name = 'Введите название полуфабриката'
        } else {
          delete errors.name
        }
        break
      default:
        break
    }

    setFieldErrors(errors)
  }, [fieldErrors])

  const handleFieldChange = useCallback((field: keyof AddSemiFinishedFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
  }, [validateField])

  const addIngredient = useCallback(() => {
    const newIngredient: SemiFinishedIngredient = {
      id: `${Date.now()}-${Math.random()}`,
      gross: 0,
      net: 0,
      unit: 'г',
      cost: 0
    }
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }))
  }, [])

  const removeIngredient = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.id !== id)
    }))
  }, [])

  const getIngredientPrice = useCallback((ingredientId: string): number => {
    // Ищем цену ингредиента в остатках (берем первую найденную цену)
    const stockItem = stock.find(s => s.ingredient_id === ingredientId && s.price_per_unit > 0)
    return stockItem?.price_per_unit || 0
  }, [stock])

  const calculateIngredientCost = useCallback((ingredientId: string, net: number, unit: 'г' | 'мл' | 'шт'): number => {
    if (!ingredientId || net <= 0) return 0

    const pricePerUnit = getIngredientPrice(ingredientId)
    let netForCost = net

    if (unit === 'г' || unit === 'мл') {
      netForCost = net / 1000
    }

    return netForCost * pricePerUnit
  }, [getIngredientPrice])

  useEffect(() => {
    if (!isEditMode || !existingSemiFinished || isFormInitialized) {
      return
    }

    setFormData({
      name: existingSemiFinished.name || '',
      cooking_process: existingSemiFinished.cooking_process || '',
      category_id: existingSemiFinished.category_id,
      workshop_id: existingSemiFinished.workshop_id,
      ingredients: (existingSemiFinished.ingredients || []).map((ingredient) => {
        const unit = normalizeUnit(ingredient.unit)

        return {
          id: `${ingredient.id}-${Math.random()}`,
          ingredient_id: ingredient.ingredient_id,
          preparation_method: ingredient.preparation_method,
          gross: ingredient.gross,
          net: ingredient.net,
          unit,
          cost: calculateIngredientCost(ingredient.ingredient_id, ingredient.net, unit),
        }
      }),
    })
    setIsFormInitialized(true)
  }, [isEditMode, existingSemiFinished, normalizeUnit, calculateIngredientCost, isFormInitialized])

  const getIngredientLoss = useCallback((ingredientId: string, method?: string): number => {
    const ingredient = apiIngredients.find(ing => ing.id === ingredientId)
    if (!ingredient || !method) return 0

    // Получаем процент потерь в зависимости от метода приготовления
    switch (method) {
      case 'cleaning':
        return ingredient.loss_cleaning || 0
      case 'boiling':
        return ingredient.loss_boiling || 0
      case 'frying':
        return ingredient.loss_frying || 0
      case 'stewing':
        return ingredient.loss_stewing || 0
      case 'baking':
        return ingredient.loss_baking || 0
      default:
        return 0
    }
  }, [apiIngredients])

  const updateIngredient = useCallback((id: string, updates: Partial<SemiFinishedIngredient>) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => {
        if (ing.id === id) {
          const updated = { ...ing, ...updates }

          // Если выбран ингредиент, обновляем название и единицу измерения
          if (updates.ingredient_id) {
            const selectedIngredient = ingredients.find(ing => ing.id === updates.ingredient_id)
            if (selectedIngredient) {
              updated.ingredient_name = selectedIngredient.name

              // Конвертируем единицы: кг → г, л → мл, шт → шт
              if (selectedIngredient.unit === 'кг') {
                updated.unit = 'г'
                // Конвертируем существующие значения брутто и нетто
                updated.gross = updated.gross * 1000
                updated.net = updated.net * 1000
              } else if (selectedIngredient.unit === 'л') {
                updated.unit = 'мл'
                // Конвертируем существующие значения брутто и нетто
                updated.gross = updated.gross * 1000
                updated.net = updated.net * 1000
              } else if (selectedIngredient.unit === 'шт') {
                updated.unit = 'шт'
                // Конвертация не нужна
              }
            }
          }

          // Если изменился метод приготовления или брутто, пересчитываем нетто
          if (updates.preparation_method !== undefined || updates.gross !== undefined) {
            const lossPercent = getIngredientLoss(updated.ingredient_id || '', updated.preparation_method)
            if (updated.gross > 0 && lossPercent > 0) {
              // Нетто = Брутто * (1 - процент потерь / 100)
              updated.net = updated.gross * (1 - lossPercent / 100)
            } else if (updates.gross !== undefined) {
              // Если нет метода или потерь, нетто = брутто
              updated.net = updated.gross
            }
          }

          // Пересчитываем себестоимость на основе нетто и цены ингредиента
          if (updated.ingredient_id && updated.net > 0) {
            const pricePerUnit = getIngredientPrice(updated.ingredient_id)

            // Конвертируем нетто обратно в исходные единицы для расчета себестоимости
            let netForCost = updated.net
            if (updated.unit === 'г') {
              netForCost = updated.net / 1000 // Конвертируем г в кг
            } else if (updated.unit === 'мл') {
              netForCost = updated.net / 1000 // Конвертируем мл в л
            }

            // Себестоимость = нетто * цена за единицу
            updated.cost = netForCost * pricePerUnit
          } else if (updates.net !== undefined && updated.net === 0) {
            updated.cost = 0
          }

          return updated
        }
        return ing
      })
    }))
  }, [ingredients, getIngredientPrice, getIngredientLoss])

  const totalCost = useMemo(() => {
    return formData.ingredients.reduce((sum, ing) => sum + ing.cost, 0)
  }, [formData.ingredients])

  const totalYield = useMemo(() => {
    return formData.ingredients.reduce((sum, ing) => sum + ing.net, 0)
  }, [formData.ingredients])

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) return

    try {
      // Подготавливаем ингредиенты для отправки
      const ingredientsPayload = formData.ingredients
        .filter(ing => ing.ingredient_id) // Только с выбранным ингредиентом
        .map(ing => ({
          ingredient_id: ing.ingredient_id,
          preparation_method: ing.preparation_method,
          gross: ing.gross,
          net: ing.net,
          unit: ing.unit
        }))

      // Определяем единицу измерения для выхода
      // Пока используем г по умолчанию
      let unit: 'кг' | 'г' | 'л' | 'мл' | 'шт' = 'г'

      if (isEditMode && id) {
        await updateMutation.mutateAsync({
          id,
          data: {
            name: formData.name,
            ...(formData.category_id ? { category_id: formData.category_id } : {}),
            ...(formData.cooking_process ? { cooking_process: formData.cooking_process } : {}),
            unit,
            quantity: totalYield,
            ingredients: ingredientsPayload,
          },
        })
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          category_id: formData.category_id || '',
          cooking_process: formData.cooking_process,
          unit: unit,
          quantity: totalYield,
          ingredients: ingredientsPayload
        })
      }
      navigate('/menu/semi-finished')
    } catch (err) {
      console.error('Failed to save semi-finished product:', err)
    }
  }, [formData, isFormValid, isEditMode, id, updateMutation, createMutation, navigate, totalYield])

  const handleBack = useCallback(() => {
    navigate('/menu/semi-finished')
  }, [navigate])

  return {
    formData,
    isEditMode,
    isInitialLoading,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    ingredients,
    totalCost,
    totalYield,
    handleFieldChange,
    addIngredient,
    removeIngredient,
    updateIngredient,
    handleSubmit,
    handleBack
  }
}

