import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

// Types из API (snake_case - как возвращает backend)
export interface ShiftSession {
  id: string
  shift_id: string
  user_id: string
  start_time: string
  end_time: string | null
}

export interface ApiShift {
  id: string
  establishment_id: string
  establishment?: {
    id: string
    owner_id: string
    name: string
    address?: string
    phone?: string
    email?: string
    type?: string
    has_seating_places?: boolean
    table_count?: number
    has_delivery?: boolean
    has_takeaway?: boolean
    has_reservations?: boolean
    active?: boolean
    created_at: string
    updated_at: string
  }
  start_time: string
  end_time: string | null
  initial_cash: number
  final_cash: number | null
  comment: string | null
  sessions: ShiftSession[]
  created_at: string
  updated_at: string
}

export interface ActiveShiftResponse extends ApiShift {}

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

export interface StartShiftResponse extends ApiShift {}

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
  return useQuery<ApiShift, { error: string }>({
    queryKey: ['shifts', 'active'],
    queryFn: async (): Promise<ApiShift> => {
      const response = await apiClient.get<ActiveShiftResponse>('/shifts/me/active')
      return response.data
    },
    retry: false,
    // Не выбрасываем ошибку если смены нет (404)
    throwOnError: false,
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: StartShiftRequest): Promise<StartShiftResponse> => {
      const response = await apiClient.post<StartShiftResponse>('/shifts/start', request)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', 'active'] })
    },
  })
}

/**
 * POST /shifts/end
 * Завершить смену с подсчётом наличных
 */
export function useEndShift() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: EndShiftRequest): Promise<ApiShift> => {
      const response = await apiClient.post<ApiShift>('/shifts/end', request)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', 'active'] })
    },
  })
}

/**
 * GET /shifts
 * Получить список всех смен с фильтрацией (для админ-панели)
 */
export interface GetShiftsFilter {
  status?: 'open' | 'closed'
  establishmentId?: string
  employeeId?: string
  startDate?: string
  endDate?: string
}

export function useGetShifts(filter?: GetShiftsFilter) {
  return useQuery<ApiShift[], Error>({
    queryKey: ['shifts', 'list', filter],
    queryFn: async (): Promise<ApiShift[]> => {
      const params = new URLSearchParams()
      if (filter?.status) params.append('status', filter.status)
      if (filter?.establishmentId) params.append('establishment_id', filter.establishmentId)
      if (filter?.employeeId) params.append('employee_id', filter.employeeId)
      if (filter?.startDate) params.append('start_date', filter.startDate)
      if (filter?.endDate) params.append('end_date', filter.endDate)

      const response = await apiClient.get<{ data: ApiShift[] }>(`/finance/shifts?${params.toString()}`)
      return response.data.data
    },
  })
}

/**
 * DELETE /shifts/:id
 * Удалить смену
 */
export function useDeleteShift() {
  return useMutation({
    mutationFn: async (shiftId: string): Promise<void> => {
      await apiClient.delete(`/shifts/${shiftId}`)
    },
  })
}

/**
 * Трансформирует ApiShift в формат Shift (camelCase)
 * Используется в админ-панели для преобразования данных из API
 */
export function transformApiShiftToShift(apiShift: ApiShift) {
  return {
    id: apiShift.id,
    establishmentId: apiShift.establishment_id,
    establishment: apiShift.establishment ? {
      id: apiShift.establishment.id,
      ownerId: apiShift.establishment.owner_id,
      name: apiShift.establishment.name,
      address: apiShift.establishment.address,
      phone: apiShift.establishment.phone,
      email: apiShift.establishment.email,
      type: apiShift.establishment.type,
      hasSeatingPlaces: apiShift.establishment.has_seating_places,
      tableCount: apiShift.establishment.table_count,
      hasDelivery: apiShift.establishment.has_delivery,
      hasTakeaway: apiShift.establishment.has_takeaway,
      hasReservations: apiShift.establishment.has_reservations,
      active: apiShift.establishment.active,
      createdAt: apiShift.establishment.created_at,
      updatedAt: apiShift.establishment.updated_at,
    } : undefined,
    openedAt: apiShift.start_time,
    closedAt: apiShift.end_time,
    openingBalance: apiShift.initial_cash,
    closingBalance: apiShift.final_cash,
    status: apiShift.end_time ? 'closed' : 'open' as const,
    createdAt: apiShift.created_at,
    updatedAt: apiShift.updated_at,
  }
}
