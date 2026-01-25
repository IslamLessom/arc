import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { WriteOff, WriteOffItem } from '@restaurant-pos/types'

interface WriteOffsResponse {
  data: WriteOff[]
}

interface WriteOffResponse {
  data: WriteOff
}

interface WriteOffFilter {
  warehouse_id?: string
}

interface WriteOffItemRequest {
  ingredient_id?: string
  product_id?: string
  quantity: number
  unit: string
  details?: string
}

export interface CreateWriteOffRequest {
  warehouse_id: string
  write_off_date_time: string // RFC3339 format
  reason: string
  comment?: string
  items: WriteOffItemRequest[]
}

export function useGetWriteOffs(filter?: WriteOffFilter) {
  return useQuery({
    queryKey: ['write-offs', filter],
    queryFn: async (): Promise<WriteOff[]> => {
      const params = new URLSearchParams()
      if (filter?.warehouse_id) params.append('warehouse_id', filter.warehouse_id)

      const response = await apiClient.get<WriteOffsResponse>(
        `/warehouse/write-offs?${params.toString()}`
      )
      return response.data.data
    },
  })
}

export function useGetWriteOff(id: string | undefined) {
  return useQuery({
    queryKey: ['write-off', id],
    queryFn: async (): Promise<WriteOff> => {
      const response = await apiClient.get<WriteOffResponse>(
        `/warehouse/write-offs/${id}`
      )
      return response.data.data
    },
    enabled: !!id
  })
}

export function useCreateWriteOff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateWriteOffRequest): Promise<WriteOff> => {
      const response = await apiClient.post<WriteOffResponse>(
        '/warehouse/write-offs',
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['write-offs'] })
      queryClient.invalidateQueries({ queryKey: ['stock'] })
    },
  })
}

