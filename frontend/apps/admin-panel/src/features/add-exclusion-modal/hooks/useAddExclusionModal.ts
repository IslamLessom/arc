import { useEffect, useMemo, useState } from 'react'
import { useMarketingExclusions } from '@restaurant-pos/api-client'
import { useGetProducts, useGetCategories, useGetTechnicalCards } from '@restaurant-pos/api-client'
import type { AddExclusionModalProps, ExclusionFormData } from '../model/types'

const defaultForm: ExclusionFormData = {
  name: '',
  description: '',
  type: 'product',
  selectedProducts: [],
  selectedCategories: [],
  selectedTechCards: [],
  selectedTechCardCategories: [],
  searchQuery: '',
  active: true,
}

export const useAddExclusionModal = (props: AddExclusionModalProps) => {
  const { exclusions, createExclusion, updateExclusion } = useMarketingExclusions()
  const { data: products = [], isLoading: isLoadingProducts } = useGetProducts({ active: true })
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategories({ type: 'product' })
  const { data: techCards = [], isLoading: isLoadingTechCards } = useGetTechnicalCards({ active: true })
  const { data: techCardCategories = [], isLoading: isLoadingTechCardCategories } = useGetCategories({ type: 'tech_card' })

  const [formData, setFormData] = useState<ExclusionFormData>(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!props.isOpen) {
      setFormData(defaultForm)
      return
    }

    if (props.exclusionId) {
      const current = exclusions.find((item) => item.id === props.exclusionId)
      if (!current) return

      setFormData({
        name: current.name || '',
        description: current.description || '',
        type: (current.type === 'product' || current.type === 'category' || current.type === 'tech_card' || current.type === 'tech_card_category')
          ? current.type as ExclusionFormData['type']
          : 'product',
        selectedProducts: current.type === 'product' && current.entity_id ? [current.entity_id] : [],
        selectedCategories: current.type === 'category' && current.entity_id ? [current.entity_id] : [],
        selectedTechCards: current.type === 'tech_card' && current.entity_id ? [current.entity_id] : [],
        selectedTechCardCategories: current.type === 'tech_card_category' && current.entity_id ? [current.entity_id] : [],
        searchQuery: '',
        active: current.active,
      })
      return
    }

    setFormData(defaultForm)
  }, [props.isOpen, props.exclusionId, exclusions])

  const handleFieldChange = (field: keyof ExclusionFormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const toggleProduct = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter((id) => id !== productId)
        : [...prev.selectedProducts, productId],
    }))
  }

  const toggleCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter((id) => id !== categoryId)
        : [...prev.selectedCategories, categoryId],
    }))
  }

  const toggleTechCard = (techCardId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTechCards: prev.selectedTechCards.includes(techCardId)
        ? prev.selectedTechCards.filter((id) => id !== techCardId)
        : [...prev.selectedTechCards, techCardId],
    }))
  }

  const toggleTechCardCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTechCardCategories: prev.selectedTechCardCategories.includes(categoryId)
        ? prev.selectedTechCardCategories.filter((id) => id !== categoryId)
        : [...prev.selectedTechCardCategories, categoryId],
    }))
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) errors.name = 'Название обязательно'

    let hasSelection = false
    switch (formData.type) {
      case 'product':
        hasSelection = formData.selectedProducts.length > 0
        break
      case 'category':
        hasSelection = formData.selectedCategories.length > 0
        break
      case 'tech_card':
        hasSelection = formData.selectedTechCards.length > 0
        break
      case 'tech_card_category':
        hasSelection = formData.selectedTechCardCategories.length > 0
        break
    }

    if (!hasSelection) {
      errors.selection = 'Выберите хотя бы один элемент'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setError(null)

    try {
      if (props.exclusionId) {
        await updateExclusion(props.exclusionId, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          type: formData.type,
          entity_id: formData.type === 'product'
            ? (formData.selectedProducts[0] || undefined)
            : formData.type === 'category'
              ? (formData.selectedCategories[0] || undefined)
              : formData.type === 'tech_card'
                ? (formData.selectedTechCards[0] || undefined)
                : (formData.selectedTechCardCategories[0] || undefined),
          entity_name: undefined,
          active: formData.active,
        })
      } else {
        for (const productId of formData.selectedProducts) {
          await createExclusion({
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            type: 'product',
            entity_id: productId,
            entity_name: products.find((p) => p.id === productId)?.name,
          })
        }
        for (const categoryId of formData.selectedCategories) {
          await createExclusion({
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            type: 'category',
            entity_id: categoryId,
            entity_name: categories.find((c) => c.id === categoryId)?.name,
          })
        }
        for (const techCardId of formData.selectedTechCards) {
          await createExclusion({
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            type: 'tech_card',
            entity_id: techCardId,
            entity_name: techCards.find((t) => t.id === techCardId)?.name,
          })
        }
        for (const categoryId of formData.selectedTechCardCategories) {
          await createExclusion({
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            type: 'tech_card_category',
            entity_id: categoryId,
            entity_name: techCardCategories.find((c) => c.id === categoryId)?.name,
          })
        }
      }

      props.onSuccess?.()
      props.onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении исключения')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredProducts = useMemo(() => {
    if (!formData.searchQuery) return products
    const query = formData.searchQuery.toLowerCase()
    return products.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      p.category_name?.toLowerCase().includes(query)
    )
  }, [products, formData.searchQuery])

  const filteredCategories = useMemo(() => {
    if (!formData.searchQuery) return categories
    const query = formData.searchQuery.toLowerCase()
    return categories.filter((c) => c.name.toLowerCase().includes(query))
  }, [categories, formData.searchQuery])

  const filteredTechCards = useMemo(() => {
    if (!formData.searchQuery) return techCards
    const query = formData.searchQuery.toLowerCase()
    return techCards.filter((t) =>
      t.name.toLowerCase().includes(query) ||
      t.category_name?.toLowerCase().includes(query)
    )
  }, [techCards, formData.searchQuery])

  const filteredTechCardCategories = useMemo(() => {
    if (!formData.searchQuery) return techCardCategories
    const query = formData.searchQuery.toLowerCase()
    return techCardCategories.filter((c) => c.name.toLowerCase().includes(query))
  }, [techCardCategories, formData.searchQuery])

  const isFormValid = useMemo(
    () => {
      if (!formData.name.trim()) return false
      switch (formData.type) {
        case 'product':
          return formData.selectedProducts.length > 0
        case 'category':
          return formData.selectedCategories.length > 0
        case 'tech_card':
          return formData.selectedTechCards.length > 0
        case 'tech_card_category':
          return formData.selectedTechCardCategories.length > 0
        default:
          return false
      }
    },
    [formData]
  )

  return {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    isLoadingProducts,
    isLoadingCategories,
    isLoadingTechCards,
    isLoadingTechCardCategories,
    products: filteredProducts,
    categories: filteredCategories,
    techCards: filteredTechCards,
    techCardCategories: filteredTechCardCategories,
    handleFieldChange,
    toggleProduct,
    toggleCategory,
    toggleTechCard,
    toggleTechCardCategory,
    handleSubmit,
    handleClose: props.onClose,
  }
}
