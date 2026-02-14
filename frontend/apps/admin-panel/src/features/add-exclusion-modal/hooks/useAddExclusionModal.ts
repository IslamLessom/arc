import { useEffect, useMemo, useState } from 'react'
import { useMarketingExclusions } from '@restaurant-pos/api-client'
import { useGetProducts, useGetCategories } from '@restaurant-pos/api-client'
import type { AddExclusionModalProps, ExclusionFormData } from '../model/types'

const defaultForm: ExclusionFormData = {
  name: '',
  description: '',
  type: 'product',
  selectedProducts: [],
  selectedCategories: [],
  searchQuery: '',
  active: true,
}

export const useAddExclusionModal = (props: AddExclusionModalProps) => {
  const { exclusions, createExclusion, updateExclusion } = useMarketingExclusions()
  const { data: products = [], isLoading: isLoadingProducts } = useGetProducts({ active: true })
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategories({ type: 'product' })

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
        type: current.type === 'product' || current.type === 'category' ? current.type : 'product',
        selectedProducts: current.type === 'product' && current.entity_id ? [current.entity_id] : [],
        selectedCategories: current.type === 'category' && current.entity_id ? [current.entity_id] : [],
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

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) errors.name = 'Название обязательно'

    const hasSelection = formData.type === 'product'
      ? formData.selectedProducts.length > 0
      : formData.selectedCategories.length > 0

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
            : (formData.selectedCategories[0] || undefined),
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

  const isFormValid = useMemo(
    () => Boolean(formData.name.trim()) &&
      (formData.type === 'product'
        ? formData.selectedProducts.length > 0
        : formData.selectedCategories.length > 0),
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
    products: filteredProducts,
    categories: filteredCategories,
    handleFieldChange,
    toggleProduct,
    toggleCategory,
    handleSubmit,
    handleClose: props.onClose,
  }
}
