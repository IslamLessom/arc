import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

interface CategoryFilter {
  type?: 'product' | 'tech_card' | 'semi_finished'
  search?: string
}

export interface ProductCategory {
  id: string
  establishment_id: string
  name: string
  type: 'product' | 'tech_card' | 'semi_finished'
  order: number
  active: boolean
  created_at: string
}

interface CategoriesResponse {
  data: ProductCategory[]
}

interface CategoryResponse {
  data: ProductCategory
}

interface CreateCategoryRequest {
  name: string
  type: 'product' | 'tech_card' | 'semi_finished'
  parent_category_id?: string
}

interface UpdateCategoryRequest {
  name?: string
  type?: 'product' | 'tech_card' | 'semi_finished'
}

export function useGetCategories(filter?: CategoryFilter) {
  return useQuery({
    queryKey: ['categories', filter],
    queryFn: async (): Promise<ProductCategory[]> => {
      const params = new URLSearchParams()
      if (filter?.type) params.append('type', filter.type)
      if (filter?.search) params.append('search', filter.search)

      const response = await apiClient.get<CategoriesResponse>(
        `/menu/categories?${params.toString()}`
      )
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useGetCategory(id: string) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async (): Promise<ProductCategory> => {
      const response = await apiClient.get<CategoryResponse>(`/menu/categories/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCategoryRequest): Promise<ProductCategory> => {
      const response = await apiClient.post<CategoryResponse>('/menu/categories', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateCategoryRequest
    }): Promise<ProductCategory> => {
      const response = await apiClient.put<CategoryResponse>(`/menu/categories/${id}`, data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/menu/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

