import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  // Авансы полученные за период
  advances_given: number
  // Сумма к выплате после вычета авансов
  total_to_pay_after_advances: number
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

export interface PaySalaryRequest {
  user_id: string
  account_id: string
  period_start: string
  period_end: string
  notes?: string
}

export interface SalaryPayment {
  id: string
  establishment_id: string
  user_id: string
  period_start: string
  period_end: string
  total_salary: number
  advances_deducted: number
  amount_paid: number
  account_id: string
  transaction_id?: string
  payment_date: string
  paid_by?: string
  notes?: string
  created_at: string
  updated_at: string
}

interface SalaryPaymentResponse {
  data: SalaryPayment
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

export function usePaySalary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: PaySalaryRequest): Promise<SalaryPayment> => {
      const response = await apiClient.post<SalaryPaymentResponse>(
        '/finance/salary/pay',
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-report'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

