import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

export interface InventoryItem {
  id: string
  inventory_id: string
  type: 'ingredient' | 'product' | 'tech_card' | 'semi_finished'
  ingredient_id?: string
  product_id?: string
  tech_card_id?: string
  semi_finished_id?: string
  expected_quantity: number
  actual_quantity: number
  unit: string
  price_per_unit: number
  difference: number
  difference_value: number
  comment: string
  created_at: string
  updated_at: string
}

export interface Inventory {
  id: string
  establishment_id: string
  warehouse_id: string
  warehouse?: {
    id: string
    name: string
  }
  type: 'full' | 'partial'
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled'
  scheduled_date?: string
  actual_date?: string
  comment: string
  items?: InventoryItem[]
  created_by?: string
  completed_by?: string
  created_at: string
  updated_at: string
}

interface InventoriesResponse {
  data: Inventory[]
}

interface InventoryResponse {
  data: Inventory
}

export interface InventoryFilter {
  warehouse_id?: string
  type?: 'full' | 'partial'
  status?: 'draft' | 'in_progress' | 'completed' | 'cancelled'
}

export interface CreateInventoryRequest {
  warehouse_id: string
  type: 'full' | 'partial'
  scheduled_date?: string
  comment?: string
  items?: Array<{
    type: 'ingredient' | 'product' | 'tech_card' | 'semi_finished'
    ingredient_id?: string
    product_id?: string
    tech_card_id?: string
    semi_finished_id?: string
    actual_quantity: number
    comment?: string
  }>
}

export interface UpdateInventoryStatusRequest {
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled'
}

export interface UpdateInventoryRequest {
  warehouse_id: string
  type: 'full' | 'partial'
  scheduled_date?: string
  comment?: string
  items?: Array<{
    type: 'ingredient' | 'product' | 'tech_card' | 'semi_finished'
    ingredient_id?: string
    product_id?: string
    tech_card_id?: string
    semi_finished_id?: string
    actual_quantity: number
    comment?: string
  }>
}

export function useGetInventories(filter?: InventoryFilter) {
  return useQuery({
    queryKey: ['inventories', filter],
    queryFn: async (): Promise<Inventory[]> => {
      const params = new URLSearchParams()
      if (filter?.warehouse_id) {
        params.append('warehouse_id', filter.warehouse_id)
      }
      if (filter?.type) {
        params.append('type', filter.type)
      }
      if (filter?.status) {
        params.append('status', filter.status)
      }
      const queryString = params.toString()
      const url = queryString ? `/inventory?${queryString}` : '/inventory'
      const response = await apiClient.get<InventoriesResponse>(url)
      return response.data.data
    },
  })
}

export function useGetInventory(id: string | undefined) {
  return useQuery({
    queryKey: ['inventory', id],
    queryFn: async (): Promise<Inventory> => {
      const response = await apiClient.get<InventoryResponse>(`/inventory/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateInventory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateInventoryRequest): Promise<Inventory> => {
      const response = await apiClient.post<InventoryResponse>('/inventory', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] })
    },
  })
}

export function useUpdateInventoryStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: 'draft' | 'in_progress' | 'completed' | 'cancelled'
    }): Promise<Inventory> => {
      const response = await apiClient.put<InventoryResponse>(
        `/inventory/${id}/status`,
        { status }
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}

export function useUpdateInventory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateInventoryRequest
    }): Promise<Inventory> => {
      const response = await apiClient.put<InventoryResponse>(
        `/inventory/${id}`,
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}

export function useDeleteInventory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/inventory/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] })
    },
  })
}

