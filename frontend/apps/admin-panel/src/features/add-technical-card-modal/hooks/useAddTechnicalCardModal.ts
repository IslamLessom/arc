import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  useCreateTechnicalCard,
  useUpdateTechnicalCard,
  useGetTechnicalCard,
  useGetIngredients,
  useGetStock,
  type CreateTechnicalCardRequest,
  type UpdateTechnicalCardRequest,
  type Ingredient,
} from '@restaurant-pos/api-client'
import type {
  AddTechnicalCardModalProps,
  AddTechnicalCardFormData,
  UseAddTechnicalCardModalResult,
  IngredientFormData,
  ModifierSetFormData,
  ModifierOptionFormData,
  FieldErrors,
} from '../model/types'

export function useAddTechnicalCardModal(
  props: AddTechnicalCardModalProps
): UseAddTechnicalCardModalResult {
  const [formData, setFormData] = useState<AddTechnicalCardFormData>({
    name: '',
    category_id: '',
    description: '',
    cover_image: '',
    is_weighted: false,
    is_discount_disabled: false,
    cost_price: 0,
    markup: 0,
    price: 0,
    workshop_id: '',
    warehouse_id: '',
    ingredients: [],
    modifier_sets: [],
    showComposition: true,
  })

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const createMutation = useCreateTechnicalCard()
  const updateMutation = useUpdateTechnicalCard()
  const { data: apiIngredients = [] } = useGetIngredients()
  const { data: stock = [] } = useGetStock()

  // Fetch card data if in edit mode
  const { data: existingCard, isLoading: isLoadingCard } = useGetTechnicalCard(
    props.cardId || ''
  )

  // Populate form with existing data when editing
  useEffect(() => {
    if (existingCard && props.cardId) {
      setFormData({
        name: existingCard.name || '',
        category_id: existingCard.category_id || '',
        description: existingCard.description || '',
        cover_image: existingCard.cover_image || '',
        is_weighted: existingCard.is_weighted || false,
        is_discount_disabled: false,
        cost_price: existingCard.cost_price || 0,
        markup: existingCard.markup || 0,
        price: existingCard.price || 0,
        workshop_id: existingCard.workshop_id || '',
        warehouse_id: existingCard.warehouse_id || '',
        ingredients:
          existingCard.ingredients?.map((ing) => {
            // Convert units from backend: kg → g, l → ml, pcs → pcs
            let gross = ing.quantity
            let net = ing.quantity
            let unit: 'г' | 'мл' | 'шт'

            if (ing.unit === 'кг') {
              gross = ing.quantity * 1000
              net = ing.quantity * 1000
              unit = 'г'
            } else if (ing.unit === 'л') {
              gross = ing.quantity * 1000
              net = ing.quantity * 1000
              unit = 'мл'
            } else if (ing.unit === 'шт') {
              unit = 'шт'
            }

            return {
              id: `${Date.now()}-${Math.random()}`,
              ingredient_id: ing.ingredient_id,
              ingredient_name: '',
              gross,
              net,
              unit,
              cost: 0,
            }
          }) || [],
        modifier_sets:
          existingCard.modifier_sets?.map((set) => ({
            name: set.name,
            selection_type: set.selection_type,
            options: set.options || [],
          })) || [],
        showComposition: true,
      })
    } else if (!props.cardId && props.isOpen) {
      // Reset form when opening in create mode
      setFormData({
        name: '',
        category_id: '',
        description: '',
        cover_image: '',
        is_weighted: false,
        is_discount_disabled: false,
        cost_price: 0,
        markup: 0,
        price: 0,
        workshop_id: '',
        warehouse_id: '',
        ingredients: [],
        modifier_sets: [],
        showComposition: true,
      })
      setFieldErrors({})
    }
  }, [existingCard, props.cardId, props.isOpen])

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const error = (createMutation.error || updateMutation.error)
    ? ((createMutation.error || updateMutation.error) as Error).message
    : null
  const isLoading = !!props.cardId && isLoadingCard

  const markupLabel = useMemo(() => `${Math.round(formData.markup)}%`, [formData.markup])
  // Calculate total cost from ingredients
  const totalIngredientsCost = useMemo(() => {
    return formData.ingredients.reduce((sum, ing) => sum + ing.cost, 0)
  }, [formData.ingredients])

  const costPriceLabel = useMemo(() => {
    // Use total ingredients cost as cost price if available, otherwise use formData.cost_price
    const cost = totalIngredientsCost > 0 ? totalIngredientsCost : formData.cost_price
    const formatted = cost.toFixed(2).replace('.', ',')
    return `${formatted} ₽`
  }, [formData.cost_price, totalIngredientsCost])

  // Form validation
  const isFormValid = useMemo(() => {
    return (
      formData.name.trim().length > 0 &&
      formData.category_id.trim().length > 0 &&
      formData.price >= 0 &&
      Object.keys(fieldErrors).length === 0
    )
  }, [formData, fieldErrors])

  const validateField = useCallback((field: keyof AddTechnicalCardFormData, value: any) => {
    const errors: FieldErrors = { ...fieldErrors }

    switch (field) {
      case 'name':
        if (!value || value.trim().length === 0) {
          errors.name = 'Название обязательно для заполнения'
        } else if (value.trim().length < 2) {
          errors.name = 'Название должно содержать минимум 2 символа'
        } else if (value.trim().length > 100) {
          errors.name = 'Название не должно превышать 100 символов'
        } else {
          delete errors.name
        }
        break

      case 'category_id':
        if (!value || value.trim().length === 0) {
          errors.category_id = 'Выберите категорию'
        } else {
          delete errors.category_id
        }
        break

      case 'price':
        if (value < 0) {
          errors.price = 'Цена не может быть отрицательной'
        } else if (value > 999999) {
          errors.price = 'Цена не может превышать 999 999 ₽'
        } else {
          delete errors.price
        }
        break

      default:
        break
    }

    setFieldErrors(errors)
  }, [fieldErrors])

  const clearFieldErrors = useCallback(() => {
    setFieldErrors({})
  }, [])

  const handleFieldChange = useCallback(
    (field: keyof AddTechnicalCardFormData, value: string | number | boolean) => {
      setFormData((prev) => {
        const updatedData = { ...prev, [field]: value }

        // Calculate price from markup
        if (field === 'markup' && typeof value === 'number' && value >= 0) {
          const calculatedPrice = prev.cost_price * (1 + value / 100)
          updatedData.price = parseFloat(calculatedPrice.toFixed(2))
        }

        // Calculate markup from price
        if (field === 'price' && typeof value === 'number' && totalIngredientsCost > 0) {
          const calculatedMarkup = ((value - totalIngredientsCost) / totalIngredientsCost) * 100
          updatedData.markup = parseFloat(calculatedMarkup.toFixed(2))
        }

        return updatedData
      })

      // Validate field on change
      validateField(field, value)
    },
    [validateField]
  )

  // Memoized ingredients list for select dropdown
  const ingredients = useMemo(() => {
    return apiIngredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      unit: ing.unit,
    }))
  }, [apiIngredients])

  const addIngredient = useCallback(() => {
    const newIngredient: IngredientFormData = {
      id: `${Date.now()}-${Math.random()}`,
      ingredient_id: '',
      gross: 0,
      net: 0,
      unit: 'г',
      cost: 0,
    }
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient],
    }))
  }, [])

  // Helper function to get ingredient price from stock
  const getIngredientPrice = useCallback(
    (ingredientId: string): number => {
      const stockItem = stock.find((s) => s.ingredient_id === ingredientId && s.price_per_unit > 0)
      return stockItem?.price_per_unit || 0
    },
    [stock]
  )

  // Helper function to get ingredient loss percentage
  const getIngredientLoss = useCallback(
    (ingredientId: string, method?: string): number => {
      const ingredient = apiIngredients.find((ing) => ing.id === ingredientId)
      if (!ingredient || !method) return 0

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
    },
    [apiIngredients]
  )

  const updateIngredient = useCallback(
    (id: string, updates: Partial<IngredientFormData>) => {
      setFormData((prev) => ({
        ...prev,
        ingredients: prev.ingredients.map((ing) => {
          if (ing.id === id) {
            const updated = { ...ing, ...updates }

            // If ingredient is selected, update name and unit with conversion
            if (updates.ingredient_id) {
              const selectedIngredient = ingredients.find(
                (ingredient) => ingredient.id === updates.ingredient_id
              )
              if (selectedIngredient) {
                updated.ingredient_name = selectedIngredient.name

                // Convert units: kg → g, l → ml, pcs → pcs
                if (selectedIngredient.unit === 'кг') {
                  updated.unit = 'г'
                  // Convert existing gross and net values
                  updated.gross = updated.gross * 1000
                  updated.net = updated.net * 1000
                } else if (selectedIngredient.unit === 'л') {
                  updated.unit = 'мл'
                  // Convert existing gross and net values
                  updated.gross = updated.gross * 1000
                  updated.net = updated.net * 1000
                } else if (selectedIngredient.unit === 'шт') {
                  updated.unit = 'шт'
                  // No conversion needed
                }
              }
            }

            // Recalculate cost when net or ingredient_id changes
            if ((updates.net !== undefined || updates.ingredient_id) && updated.ingredient_id) {
              const pricePerUnit = getIngredientPrice(updated.ingredient_id)

              // Convert net back to original units for cost calculation
              let netForCost = updated.net
              if (updated.unit === 'г') {
                netForCost = updated.net / 1000 // Convert g to kg
              } else if (updated.unit === 'мл') {
                netForCost = updated.net / 1000 // Convert ml to l
              }

              updated.cost = netForCost * pricePerUnit
            } else if (updates.net !== undefined && updates.net === 0) {
              updated.cost = 0
            }

            return updated
          }
          return ing
        }),
      }))
    },
    [ingredients, getIngredientPrice]
  )

  const removeIngredient = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((ing) => ing.id !== id),
    }))
  }, [])

  const addModifierSet = useCallback(() => {
    const newModifierSet: ModifierSetFormData = {
      name: '',
      selection_type: 'single',
      min_selection: 1,
      max_selection: 1,
      options: [],
    }
    setFormData((prev) => ({
      ...prev,
      modifier_sets: [...prev.modifier_sets, newModifierSet],
    }))
  }, [])

  const updateModifierSet = useCallback(
    (
      index: number,
      field: keyof ModifierSetFormData,
      value: ModifierSetFormData[keyof ModifierSetFormData]
    ) => {
      setFormData((prev) => ({
        ...prev,
        modifier_sets: prev.modifier_sets.map((set, i) =>
          i === index ? { ...set, [field]: value } : set
        ),
      }))
    },
    []
  )

  const removeModifierSet = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      modifier_sets: prev.modifier_sets.filter((_, i) => i !== index),
    }))
  }, [])

  const addModifierOption = useCallback((setIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      modifier_sets: prev.modifier_sets.map((set, i) =>
        i === setIndex
          ? {
              ...set,
              options: [...set.options, { name: '', price: 0 }],
            }
          : set
      ),
    }))
  }, [])

  const updateModifierOption = useCallback(
    (
      setIndex: number,
      optionIndex: number,
      field: keyof ModifierOptionFormData,
      value: string | number
    ) => {
      setFormData((prev) => ({
        ...prev,
        modifier_sets: prev.modifier_sets.map((set, i) =>
          i === setIndex
            ? {
                ...set,
                options: set.options.map((option, j) =>
                  j === optionIndex ? { ...option, [field]: value } : option
                ),
              }
            : set
        ),
      }))
    },
    []
  )

  const removeModifierOption = useCallback((setIndex: number, optionIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      modifier_sets: prev.modifier_sets.map((set, i) =>
        i === setIndex
          ? {
              ...set,
              options: set.options.filter((_, j) => j !== optionIndex),
            }
          : set
      ),
    }))
  }, [])

  const toggleComposition = useCallback(() => {
    setFormData((prev) => ({ ...prev, showComposition: !prev.showComposition }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // Validate all fields
      if (!isFormValid) {
        // Trigger validation for all required fields
        validateField('name', formData.name)
        validateField('category_id', formData.category_id)
        validateField('price', formData.price)
        return
      }

      try {
        // Build payload with only required and present fields
        const payload: CreateTechnicalCardRequest | UpdateTechnicalCardRequest = {
          name: formData.name.trim(),
          category_id: formData.category_id,
          is_weighted: formData.is_weighted,
        }

        // Add optional fields only if they have values
        if (formData.description?.trim()) {
          payload.description = formData.description.trim()
        }

        if (formData.cover_image) {
          payload.cover_image = formData.cover_image
        }

        if (formData.cost_price > 0) {
          payload.cost_price = formData.cost_price
        }

        if (formData.markup !== undefined && formData.markup !== 0) {
          payload.markup = formData.markup
        }

        // Workshop is optional - only send if provided
        if (formData.workshop_id) {
          payload.workshop_id = formData.workshop_id
        }

        if (formData.warehouse_id) {
          payload.warehouse_id = formData.warehouse_id
        }

        const validIngredients = formData.ingredients.filter((ing) => ing.ingredient_id)
        if (validIngredients.length > 0) {
          payload.ingredients = validIngredients.map((ing) => {
            // Convert units back: g → kg, ml → l, pcs → pcs
            let quantity = ing.net
            let unit: 'кг' | 'л' | 'шт'

            if (ing.unit === 'г') {
              quantity = ing.net / 1000
              unit = 'кг'
            } else if (ing.unit === 'мл') {
              quantity = ing.net / 1000
              unit = 'л'
            } else if (ing.unit === 'шт') {
              unit = 'шт'
            }

            return {
              ingredient_id: ing.ingredient_id,
              quantity,
              unit,
            }
          })
        }

        const validModifiers = formData.modifier_sets.filter((set) => set.name)
        if (validModifiers.length > 0) {
          payload.modifier_sets = validModifiers
        }

        let resultCard
        if (props.cardId) {
          // Update existing card
          resultCard = await updateMutation.mutateAsync({
            id: props.cardId,
            data: payload,
          })
        } else {
          // Create new card
          resultCard = await createMutation.mutateAsync(
            payload as CreateTechnicalCardRequest
          )
        }

        props.onSuccess?.(resultCard)
        props.onClose()

        // Reset form
        setFormData({
          name: '',
          category_id: '',
          description: '',
          cover_image: '',
          is_weighted: false,
          is_discount_disabled: false,
          cost_price: 0,
          markup: 0,
          price: 0,
          workshop_id: '',
          warehouse_id: '',
          ingredients: [],
          modifier_sets: [],
          showComposition: true,
        })
        setFieldErrors({})
      } catch (submitError) {
        console.error(
          `Failed to ${props.cardId ? 'update' : 'create'} technical card:`,
          submitError
        )
      }
    },
    [formData, isFormValid, validateField, createMutation, updateMutation, props, totalIngredientsCost]
  )

  const handleClose = useCallback(() => {
    if (isSubmitting) return

    props.onClose()
    setFormData({
      name: '',
      category_id: '',
      description: '',
      cover_image: '',
      is_weighted: false,
      is_discount_disabled: false,
      cost_price: 0,
      markup: 0,
      price: 0,
      workshop_id: '',
      warehouse_id: '',
      ingredients: [],
      modifier_sets: [],
      showComposition: true,
    })
    setFieldErrors({})
  }, [props, isSubmitting])

  return {
    formData,
    isLoading,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    markupLabel,
    costPriceLabel,
    totalIngredientsCost,
    ingredients,
    handleFieldChange,
    addIngredient,
    updateIngredient,
    removeIngredient,
    addModifierSet,
    updateModifierSet,
    removeModifierSet,
    addModifierOption,
    updateModifierOption,
    removeModifierOption,
    toggleComposition,
    handleSubmit,
    handleClose,
  }
}

