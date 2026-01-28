import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

interface SemiFinishedFilter {
  search?: string
  category_id?: string
  active?: boolean
}

interface SemiFinishedIngredient {
  id: string
  ingredient_id: string
  preparation_method?: string
  gross: number
  net: number
  unit: string
}

export interface SemiFinishedProduct {
  id: string
  establishment_id: string
  category_id: string
  workshop_id?: string
  name: string
  description?: string
  cooking_process?: string
  cover_image?: string
  unit: 'kg' | 'gram' | 'liter' | 'ml' | 'piece'
  quantity: number
  cost_price: number
  active: boolean
  ingredients?: SemiFinishedIngredient[]
  created_at: string
  updated_at: string
}

interface SemiFinishedResponse {
  data: SemiFinishedProduct[]
}

interface SingleSemiFinishedResponse {
  data: SemiFinishedProduct
}

interface CreateSemiFinishedRequest {
  name: string
  category_id: string
  workshop_id?: string
  description?: string
  cooking_process?: string
  cover_image?: string
  unit: 'кг' | 'г' | 'л' | 'мл' | 'шт'
  quantity?: number
  ingredients?: Array<{
    ingredient_id: string
    preparation_method?: string
    gross: number
    net: number
    unit: string
  }>
}

interface UpdateSemiFinishedRequest {
  name?: string
  category_id?: string
  workshop_id?: string
  description?: string
  cooking_process?: string
  cover_image?: string
  unit?: 'кг' | 'г' | 'л' | 'мл' | 'шт'
  quantity?: number
  cost_price?: number
  active?: boolean
  ingredients?: Array<{
    ingredient_id: string
    preparation_method?: string
    gross: number
    net: number
    unit: string
  }>
}

export function useGetSemiFinishedProducts(filter?: SemiFinishedFilter) {
  return useQuery({
    queryKey: ['semi-finished', filter],
    queryFn: async (): Promise<SemiFinishedProduct[]> => {
      const params = new URLSearchParams()
      if (filter?.search) params.append('search', filter.search)
      if (filter?.category_id) params.append('category_id', filter.category_id)
      if (filter?.active !== undefined) params.append('active', filter.active.toString())

      const response = await apiClient.get<SemiFinishedResponse>(
        `/menu/semi-finished?${params.toString()}`
      )
      return response.data.data
    },
  })
}

export function useGetSemiFinishedProduct(id: string) {
  return useQuery({
    queryKey: ['semi-finished', id],
    queryFn: async (): Promise<SemiFinishedProduct> => {
      const response = await apiClient.get<SingleSemiFinishedResponse>(`/menu/semi-finished/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateSemiFinishedProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateSemiFinishedRequest): Promise<SemiFinishedProduct> => {
      const response = await apiClient.post<SingleSemiFinishedResponse>('/menu/semi-finished', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semi-finished'] })
    },
  })
}

export function useUpdateSemiFinishedProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateSemiFinishedRequest
    }): Promise<SemiFinishedProduct> => {
      const response = await apiClient.put<SingleSemiFinishedResponse>(`/menu/semi-finished/${id}`, data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semi-finished'] })
    },
  })
}

export function useDeleteSemiFinishedProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/menu/semi-finished/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semi-finished'] })
    },
  })
}