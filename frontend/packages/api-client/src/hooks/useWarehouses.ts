import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

interface Warehouse {
  id: string
  establishment_id: string
  name: string
  address?: string
  active: boolean
  created_at: string
  updated_at: string
}

interface WarehousesResponse {
  data: Warehouse[]
}

interface WarehouseResponse {
  data: Warehouse
}

interface CreateWarehouseRequest {
  name: string
  address?: string
}

interface UpdateWarehouseRequest {
  name?: string
  address?: string
  active?: boolean
}

export function useGetWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async (): Promise<Warehouse[]> => {
      const response = await apiClient.get<WarehousesResponse>('/warehouses')
      return response.data.data
    },
  })
}

export function useGetWarehouse(id: string) {
  return useQuery({
    queryKey: ['warehouse', id],
    queryFn: async (): Promise<Warehouse> => {
      const response = await apiClient.get<WarehouseResponse>(
        `/warehouses/${id}`
      )
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: CreateWarehouseRequest
    ): Promise<Warehouse> => {
      const response = await apiClient.post<WarehouseResponse>(
        '/warehouses',
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
    },
  })
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateWarehouseRequest
    }): Promise<Warehouse> => {
      const response = await apiClient.put<WarehouseResponse>(
        `/warehouses/${id}`,
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
    },
  })
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/warehouses/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
    },
  })
}

