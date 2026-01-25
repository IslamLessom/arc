import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

interface MovementFilter {
  warehouse_id?: string
  start_date?: string
  end_date?: string
}

interface MovementItem {
  id: string
  ingredient_id?: string | null
  product_id?: string | null
  quantity: number
  unit: string
  price_per_unit: number
}

interface Movement {
  type: 'supply' | 'write_off' | 'transfer'
  id: string
  warehouse_id: string
  warehouse_name: string
  from_warehouse_id?: string
  from_warehouse_name?: string
  to_warehouse_id?: string
  to_warehouse_name?: string
  supplier_id?: string
  supplier_name?: string
  date_time: string
  status?: string
  reason?: string
  comment?: string
  items: MovementItem[]
  created_at: string
}

interface MovementsResponse {
  data: Movement[]
}

interface MovementResponse {
  data: Movement
}

interface MovementItemRequest {
  ingredient_id?: string
  product_id?: string
  quantity: number
  unit: string
  price_per_unit: number
}

export interface CreateMovementRequest {
  from_warehouse_id: string
  to_warehouse_id: string
  date_time: string // RFC3339 format
  comment?: string
  items: MovementItemRequest[]
}

export function useGetMovements(filter?: MovementFilter) {
  return useQuery({
    queryKey: ['movements', filter],
    queryFn: async (): Promise<Movement[]> => {
      const params = new URLSearchParams()
      if (filter?.warehouse_id) params.append('warehouse_id', filter.warehouse_id)
      if (filter?.start_date) params.append('start_date', filter.start_date)
      if (filter?.end_date) params.append('end_date', filter.end_date)

      const response = await apiClient.get<MovementsResponse>(
        `/warehouse/movements?${params.toString()}`
      )
      return response.data.data
    },
  })
}

export function useCreateMovement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateMovementRequest): Promise<Movement> => {
      const response = await apiClient.post<MovementResponse>('/warehouse/transfers', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] })
      queryClient.invalidateQueries({ queryKey: ['stock'] })
    },
  })
}

export type { Movement, MovementFilter, MovementItem }

