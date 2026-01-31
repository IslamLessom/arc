import { useState, useCallback, useMemo } from 'react'
import {
  useGetIngredientCategories,
  useCreateIngredientCategory,
  useUpdateIngredientCategory,
  useDeleteIngredientCategory,
  useGetIngredients,
  useGetStock,
  type IngredientCategoryFilter,
  type CreateIngredientCategoryRequest,
  type UpdateIngredientCategoryRequest,
  type Ingredient,
  type Stock,
} from '@restaurant-pos/api-client'
import type { UseIngredientCategoriesResult, IngredientCategoryTableRow } from '../model/types'

export function useIngredientCategories(): UseIngredientCategoriesResult {
  const [filters, setFilters] = useState<IngredientCategoryFilter>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: categories, isLoading, error, refetch } =
    useGetIngredientCategories(filters)

  // Получаем все ингредиенты для подсчёта количества
  const { data: ingredients = [] } = useGetIngredients({ active: true })

  // Получаем остатки на складах (только ингредиенты)
  const { data: stock = [] } = useGetStock({ type: 'ingredient' })

  const { mutateAsync: createCategory, isPending: isCreating } =
    useCreateIngredientCategory()
  const { mutateAsync: updateCategory, isPending: isUpdating } =
    useUpdateIngredientCategory()
  const { mutateAsync: deleteCategory, isPending: isDeleting } =
    useDeleteIngredientCategory()

  // Вычисляем данные для каждой категории
  const categoriesWithStats = useMemo((): IngredientCategoryTableRow[] => {
    if (!categories) return []

    return categories.map((category) => {
      // Подсчитываем количество ингредиентов в категории
      const ingredientCount = ingredients.filter(
        (ing) => ing.category_id === category.id
      ).length

      // Подсчитываем остатки по складам для ингредиентов этой категории
      const categoryStock = stock.filter(
        (s) => s.ingredient?.category?.id === category.id
      )

      const totalStock = categoryStock.reduce((sum, s) => sum + s.quantity, 0)

      // Подсчитываем общую стоимость остатков
      const totalValue = categoryStock.reduce(
        (sum, s) => sum + s.quantity * s.price_per_unit,
        0
      )

      return {
        id: category.id,
        name: category.name,
        ingredientCount,
        totalStock,
        totalValue,
      }
    })
  }, [categories, ingredients, stock])

  // Вычисляем итоги по всем категориям
  const totals = useMemo(() => {
    const totalIngredientCount = ingredients.length
    const totalStock = stock
      .filter((s) => s.ingredient_id)
      .reduce((sum, s) => sum + s.quantity, 0)
    const totalValue = stock
      .filter((s) => s.ingredient_id)
      .reduce((sum, s) => sum + s.quantity * s.price_per_unit, 0)

    return {
      totalIngredientCount,
      totalStock,
      totalValue,
    }
  }, [ingredients, stock])

  const handleFilterChange = useCallback(
    (newFilters: Partial<IngredientCategoryFilter>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }))
    },
    []
  )

  const handleCreateCategory = useCallback(
    async (data: CreateIngredientCategoryRequest) => {
      await createCategory(data)
    },
    [createCategory]
  )

  const handleUpdateCategory = useCallback(
    async (id: string, data: UpdateIngredientCategoryRequest) => {
      await updateCategory({ id, data })
    },
    [updateCategory]
  )

  const handleDeleteCategory = useCallback(
    async (id: string) => {
      await deleteCategory(id)
    },
    [deleteCategory]
  )

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchQuery(value)
      handleFilterChange({ search: value || undefined })
    },
    [handleFilterChange, setSearchQuery]
  )

  const handleBack = useCallback(() => {
    window.history.back()
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
        await handleDeleteCategory(id)
      }
    },
    [handleDeleteCategory]
  )

  const handleEdit = useCallback((id: string) => {
    // TODO: Implement edit modal
    console.log('Edit category:', id)
  }, [])

  const handleAdd = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleCategoryCreated = useCallback(() => {
    refetch()
  }, [refetch])

  const handleExport = useCallback(() => {
    // TODO: Implement export
    console.log('Export categories')
  }, [])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleColumns = useCallback(() => {
    // TODO: Implement column selector
    console.log('Select columns')
  }, [])

  return {
    categories: categoriesWithStats,
    isLoading,
    error: error as Error | null,
    filters,
    handleFilterChange,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    isCreating,
    isUpdating,
    isDeleting,
    searchQuery,
    setSearchQuery,
    handleSearchChange,
    handleBack,
    handleDelete,
    handleEdit,
    handleAdd,
    handleExport,
    handlePrint,
    handleColumns,
    isModalOpen,
    handleCloseModal,
    handleCategoryCreated,
    totals,
  }
}

