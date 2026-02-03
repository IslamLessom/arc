import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'

export interface SalaryEntry {
  employee_id: string
  employee_name: string
  position_id: string
  position_name: string
  monthly_rate: number | null
  hours_worked: number
  shifts_worked: number
  hourly_rate: number | null
  shift_rate: number | null
  shift_sales_amount: number
  shift_sales_percentage: number | null
  shift_sales_commission: number
  personal_sales_amount: number
  personal_sales_percentage: number | null
  personal_sales_commission: number
  total_salary: number
}

export interface SalaryReport {
  start_date: string
  end_date: string
  entries: SalaryEntry[]
  total_salary: number
}

interface SalaryReportResponse {
  data: SalaryReport
}

interface UseSalaryReportOptions {
  startDate: string
  endDate: string
  enabled?: boolean
}

export function useSalaryReport({ startDate, endDate, enabled = true }: UseSalaryReportOptions) {
  return useQuery({
    queryKey: ['salary-report', startDate, endDate],
    queryFn: async (): Promise<SalaryReport> => {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      })

      const response = await apiClient.get<SalaryReportResponse>(
        `/finance/salary?${params.toString()}`
      )
      return response.data.data
    },
    enabled: enabled && !!startDate && !!endDate,
  })
}
