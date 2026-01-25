import { useState, useCallback } from 'react'
import {
  useGetCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type CategoryFilter,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
} from '@restaurant-pos/api-client'
import type { UseProductCategoriesResult } from '../model/types'

export function useProductCategories(): UseProductCategoriesResult {
  const [filters, setFilters] = useState<CategoryFilter>({})
  const [searchQuery, setSearchQuery] = useState('')

  const { data: categories, isLoading, error, refetch: refetchCategories } = useGetCategories(filters)
  const { mutateAsync: createCategory, isPending: isCreating } = useCreateCategory()
  const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateCategory()
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteCategory()

  const handleFilterChange = useCallback((newFilters: Partial<CategoryFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const handleCreateCategory = useCallback(
    async (data: CreateCategoryRequest) => {
      await createCategory(data)
    },
    [createCategory]
  )

  const handleUpdateCategory = useCallback(
    async (id: string, data: UpdateCategoryRequest) => {
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
    refetchCategories,
  }
}

