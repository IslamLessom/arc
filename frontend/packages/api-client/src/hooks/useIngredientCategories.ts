import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

interface IngredientCategoryFilter {
  search?: string
}

interface IngredientCategory {
  id: string
  establishment_id: string
  name: string
  created_at: string
  updated_at: string
}

interface IngredientCategoriesResponse {
  data: IngredientCategory[]
}

interface IngredientCategoryResponse {
  data: IngredientCategory
}

interface CreateIngredientCategoryRequest {
  name: string
}

interface UpdateIngredientCategoryRequest {
  name?: string
}

export function useGetIngredientCategories(filter?: IngredientCategoryFilter) {
  return useQuery({
    queryKey: ['ingredient-categories', filter],
    queryFn: async (): Promise<IngredientCategory[]> => {
      const params = new URLSearchParams()
      if (filter?.search) params.append('search', filter.search)

      const response = await apiClient.get<IngredientCategoriesResponse>(
        `/menu/ingredient-categories?${params.toString()}`
      )
      return response.data.data
    },
  })
}

export function useGetIngredientCategory(id: string) {
  return useQuery({
    queryKey: ['ingredient-category', id],
    queryFn: async (): Promise<IngredientCategory> => {
      const response = await apiClient.get<IngredientCategoryResponse>(
        `/menu/ingredient-categories/${id}`
      )
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateIngredientCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: CreateIngredientCategoryRequest
    ): Promise<IngredientCategory> => {
      const response = await apiClient.post<IngredientCategoryResponse>(
        '/menu/ingredient-categories',
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredient-categories'] })
    },
  })
}

export function useUpdateIngredientCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateIngredientCategoryRequest
    }): Promise<IngredientCategory> => {
      const response = await apiClient.put<IngredientCategoryResponse>(
        `/menu/ingredient-categories/${id}`,
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredient-categories'] })
    },
  })
}

export function useDeleteIngredientCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/menu/ingredient-categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredient-categories'] })
    },
  })
}

