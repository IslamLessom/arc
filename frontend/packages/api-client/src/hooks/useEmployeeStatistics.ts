import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'

export interface EmployeeStatistics {
  user_id: string
  user_name: string
  total_hours_worked: number
  total_shifts: number
  total_sales: number
  start_date: string
  end_date: string
}

interface EmployeeStatisticsResponse {
  data: EmployeeStatistics
}

interface AllEmployeesStatisticsResponse {
  data: EmployeeStatistics[]
}

interface UseEmployeeStatisticsOptions {
  userId: string
  startDate?: string
  endDate?: string
  enabled?: boolean
}

interface UseAllEmployeeStatisticsOptions {
  startDate?: string
  endDate?: string
  enabled?: boolean
}

export function useEmployeeStatistics({
  userId,
  startDate,
  endDate,
  enabled = true,
}: UseEmployeeStatisticsOptions) {
  const params = new URLSearchParams()
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)

  return useQuery({
    queryKey: ['employee-statistics', userId, startDate, endDate],
    queryFn: async (): Promise<EmployeeStatistics> => {
      const response = await apiClient.get<EmployeeStatisticsResponse>(
        `/access/employees/${userId}/statistics?${params.toString()}`
      )
      return response.data.data
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  })
}

export function useAllEmployeeStatistics({
  startDate,
  endDate,
  enabled = true,
}: UseAllEmployeeStatisticsOptions) {
  const params = new URLSearchParams()
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)

  return useQuery({
    queryKey: ['all-employee-statistics', startDate, endDate],
    queryFn: async (): Promise<EmployeeStatistics[]> => {
      const response = await apiClient.get<AllEmployeesStatisticsResponse>(
        `/access/employees/statistics?${params.toString()}`
      )
      return response.data.data
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 минут - данные актуальны
    gcTime: 30 * 60 * 1000, // 30 минут - храним в кэше
    refetchOnWindowFocus: false, // Не обновлять при фокусе окна
    refetchOnReconnect: false, // Не обновлять при реконекте
    refetchOnMount: false, // Не обновлять при монтировании если данные свежие
  })
}
