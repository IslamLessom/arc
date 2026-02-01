import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '../client'

// Types
export interface ShiftSession {
  id: string
  shift_id: string
  user_id: string
  start_time: string
  end_time: string | null
}

export interface Shift {
  id: string
  establishment_id: string
  start_time: string
  end_time: string | null
  initial_cash: number
  final_cash: number | null
  comment: string | null
  sessions: ShiftSession[]
}

export interface ActiveShiftResponse {
  id: string
  establishment_id: string
  start_time: string
  end_time: string | null
  initial_cash: number
  final_cash: number | null
  comment: string | null
  sessions: ShiftSession[]
}

export interface ActiveShiftErrorResponse {
  error: string
}

export interface EndShiftRequest {
  shift_id: string
  final_cash: number
  cash_account_id: string
  comment?: string
}

export interface StartShiftRequest {
  initial_cash: number
}

export interface StartShiftResponse {
  id: string
  establishment_id: string
  start_time: string
  end_time: string | null
  initial_cash: number
  final_cash: number | null
  comment: string | null
  sessions: ShiftSession[]
}

/**
 * GET /shifts/me/active
 * Проверить активную смену для текущего пользователя
 *
 * Response (200):
 * {
 *   "id": "750g0602-g40d-63f6-c938-668826662222",
 *   "establishment_id": "123e4567-e89b-12d3-a456-426614174000",
 *   "start_time": "2025-02-01T08:00:00Z",
 *   "end_time": null,
 *   "initial_cash": 1000,
 *   "final_cash": null,
 *   "comment": null,
 *   "sessions": [...]
 * }
 *
 * Error (404):
 * { "error": "Активная смена не найдена" }
 */
export function useGetActiveShift() {
  return useQuery<Shift, { error: string }>({
    queryKey: ['shifts', 'active'],
    queryFn: async (): Promise<Shift> => {
      const response = await apiClient.get<ActiveShiftResponse>('/shifts/me/active')
      return response.data
    },
    retry: false,
    // Не выбрасываем ошибку если смены нет (404)
    throwOnError: false,
  })
}

/**
 * POST /shifts/end
 * Завершить смену с подсчётом наличных
 */
export function useEndShift() {
  return useMutation({
    mutationFn: async (request: EndShiftRequest): Promise<Shift> => {
      const response = await apiClient.post<Shift>('/shifts/end', request)
      return response.data
    },
  })
}

/**
 * POST /shifts/start
 * Открыть новую смену с указанием начальной суммы в кассе
 *
 * Response (200):
 * {
 *   "id": "750g0602-g40d-63f6-c938-668826662222",
 *   "establishment_id": "123e4567-e89b-12d3-a456-426614174000",
 *   "start_time": "2025-02-01T08:00:00Z",
 *   "end_time": null,
 *   "initial_cash": 1000,
 *   "final_cash": null,
 *   "comment": null,
 *   "sessions": []
 * }
 */
export function useStartShift() {
  return useMutation({
    mutationFn: async (request: StartShiftRequest): Promise<Shift> => {
      const response = await apiClient.post<StartShiftResponse>('/shifts/start', request)
      return response.data
    },
  })
}
