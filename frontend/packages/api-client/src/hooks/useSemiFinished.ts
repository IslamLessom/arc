import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

interface SemiFinishedFilter {
  search?: string
  category?: string
  active?: boolean
}

interface SemiFinishedProduct {
  id: string
  establishment_id: string
  name: string
  category: string
  unit: 'kg' | 'gram' | 'liter' | 'ml' | 'piece'
  quantity: number
  cost: number
  active: boolean
  created_at: string
}

interface SemiFinishedResponse {
  data: SemiFinishedProduct[]
}

interface SingleSemiFinishedResponse {
  data: SemiFinishedProduct
}

interface CreateSemiFinishedRequest {
  name: string
  category: string
  unit: 'kg' | 'gram' | 'liter' | 'ml' | 'piece'
  quantity: number
  cost: number
}

interface UpdateSemiFinishedRequest {
  name?: string
  category?: string
  unit?: 'kg' | 'gram' | 'liter' | 'ml' | 'piece'
  quantity?: number
  cost?: number
  active?: boolean
}

export function useGetSemiFinishedProducts(filter?: SemiFinishedFilter) {
  return useQuery({
    queryKey: ['semi-finished', filter],
    queryFn: async (): Promise<SemiFinishedProduct[]> => {
      const params = new URLSearchParams()
      if (filter?.search) params.append('search', filter.search)
      if (filter?.category) params.append('category', filter.category)
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