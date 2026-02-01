import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '../client'

// Types
export interface Shift {
  id: string
  user_id: string
  establishment_id: string
  start_time: string
  end_time?: string
  initial_cash: number
  final_cash?: number
  comment?: string
  created_at: string
  updated_at: string
}

export interface ActiveShiftResponse {
  data: Shift
}

export interface EndShiftRequest {
  shift_id: string
  final_cash: number
  cash_account_id: string
  comment?: string
}

// Get active shift for current user
export function useGetActiveShift() {
  return useQuery({
    queryKey: ['shifts', 'active'],
    queryFn: async (): Promise<Shift> => {
      const response = await apiClient.get<ActiveShiftResponse>('/shifts/me/active')
      return response.data.data
    },
    retry: false,
    // Не выбрасываем ошибку если смены нет (404)
    throwOnError: false,
  })
}

// End shift mutation
export function useEndShift() {
  return useMutation({
    mutationFn: async (request: EndShiftRequest): Promise<Shift> => {
      const response = await apiClient.post<ActiveShiftResponse>(
        '/shifts/end',
        request
      )
      return response.data.data
    },
  })
}
