import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

export interface SupplyItem {
  id: string
  supply_id: string
  ingredient_id?: string
  product_id?: string
  ingredient?: {
    id: string
    name: string
    unit: string
  }
  product?: {
    id: string
    name: string
    unit: string
  }
  quantity: number
  unit: string
  price_per_unit: number
  total_amount: number
  created_at: string
}

export interface Supply {
  id: string
  warehouse_id: string
  warehouse?: {
    id: string
    name: string
    address?: string
  }
  supplier_id: string
  supplier?: {
    id: string
    name: string
    phone?: string
    address?: string
  }
  delivery_date_time: string
  status: 'pending' | 'completed' | 'cancelled'
  comment?: string
  items?: SupplyItem[]
  created_at: string
  updated_at: string
}

interface SuppliesResponse {
  data: Supply[]
}

interface SupplyResponse {
  data: Supply
}

interface SupplyFilter {
  warehouse_id?: string
}

interface SupplyItemRequest {
  ingredient_id?: string
  product_id?: string
  quantity: number
  unit: string
  price_per_unit?: number
  total_amount?: number
}

export interface CreateSupplyRequest {
  warehouse_id: string
  supplier_id: string
  delivery_date_time: string // RFC3339 format
  status?: 'pending' | 'completed' | 'cancelled'
  comment?: string
  items: SupplyItemRequest[]
}

export function useGetSupplies(filter?: SupplyFilter) {
  return useQuery({
    queryKey: ['supplies', filter],
    queryFn: async (): Promise<Supply[]> => {
      const params = new URLSearchParams()
      if (filter?.warehouse_id) params.append('warehouse_id', filter.warehouse_id)

      const response = await apiClient.get<SuppliesResponse>(
        `/warehouse/supplies?${params.toString()}`
      )
      return response.data.data
    },
  })
}

export function useGetSupply(id: string | undefined) {
  return useQuery({
    queryKey: ['supply', id],
    queryFn: async (): Promise<Supply> => {
      const response = await apiClient.get<SupplyResponse>(
        `/warehouse/supplies/${id}`
      )
      return response.data.data
    },
    enabled: !!id
  })
}

export function useCreateSupply() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateSupplyRequest): Promise<Supply> => {
      const response = await apiClient.post<SupplyResponse>(
        '/warehouse/supplies',
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies'] })
      queryClient.invalidateQueries({ queryKey: ['stock'] })
    },
  })
}

export function useUpdateSupply() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateSupplyRequest }): Promise<Supply> => {
      const response = await apiClient.put<SupplyResponse>(
        `/warehouse/supplies/${id}`,
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies'] })
      queryClient.invalidateQueries({ queryKey: ['stock'] })
    },
  })
}

