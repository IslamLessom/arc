import { useState, useCallback } from 'react'
import {
  useGetIngredientCategories,
  useCreateIngredientCategory,
  useUpdateIngredientCategory,
  useDeleteIngredientCategory,
  type IngredientCategoryFilter,
  type CreateIngredientCategoryRequest,
  type UpdateIngredientCategoryRequest,
} from '@restaurant-pos/api-client'
import type { UseIngredientCategoriesResult } from '../model/types'

export function useIngredientCategories(): UseIngredientCategoriesResult {
  const [filters, setFilters] = useState<IngredientCategoryFilter>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: categories, isLoading, error, refetch } =
    useGetIngredientCategories(filters)
  const { mutateAsync: createCategory, isPending: isCreating } =
    useCreateIngredientCategory()
  const { mutateAsync: updateCategory, isPending: isUpdating } =
    useUpdateIngredientCategory()
  const { mutateAsync: deleteCategory, isPending: isDeleting } =
    useDeleteIngredientCategory()

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
    categories,
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
  }
}

