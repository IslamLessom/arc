import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

export interface Position {
  id: string
  name: string
  permissions: string
  created_at: string
  updated_at: string
}

export interface PositionDetails extends Position {
  permissions_parsed?: PositionPermissions
}

export interface PositionPermissions {
  cash_access: {
    work_with_cash: boolean
    admin_hall: boolean
  }
  admin_panel_access: {
    sections: Record<string, string>
  }
  applications_access: {
    confirm_installation: boolean
  }
  salary_calculation: {
    fixed_rate?: {
      per_hour?: number
      per_shift?: number
      per_month?: number
    }
    personal_sales_percentage?: {
      category_id?: string
      percentage: number
    }
    shift_sales_percentage?: {
      category_id?: string
      percentage: number
    }
  }
}

export interface CreatePositionRequest {
  name: string
  permissions: string
}

export interface UpdatePositionRequest {
  name?: string
  permissions?: string
}

interface PositionsResponse {
  data: Position[]
}

interface PositionResponse {
  data: Position
}

export function useGetPositions() {
  return useQuery({
    queryKey: ['positions'],
    queryFn: async (): Promise<Position[]> => {
      const response = await apiClient.get<PositionsResponse>(
        '/access/positions'
      )
      return response.data.data
    },
  })
}

export function useGetPosition(id: string) {
  return useQuery({
    queryKey: ['position', id],
    queryFn: async (): Promise<Position> => {
      const response = await apiClient.get<PositionResponse>(
        `/access/positions/${id}`
      )
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreatePosition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: CreatePositionRequest
    ): Promise<Position> => {
      const response = await apiClient.post<PositionResponse>(
        '/access/positions',
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] })
    },
  })
}

export function useUpdatePosition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdatePositionRequest
    }): Promise<Position> => {
      const response = await apiClient.put<PositionResponse>(
        `/access/positions/${id}`,
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] })
    },
  })
}

export function useDeletePosition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/access/positions/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] })
    },
  })
}
