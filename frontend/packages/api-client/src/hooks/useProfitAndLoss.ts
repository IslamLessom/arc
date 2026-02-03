import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { ProfitAndLossReport } from '@restaurant-pos/types'

interface BackendPNLReport {
  start_date: string
  end_date: string
  revenue: number
  other_income: number
  total_income: number
  cost_of_goods: number
  salary: number
  rent: number
  other_expenses: number
  total_expenses: number
  net_profit: number
}

interface PNLResponse {
  data: BackendPNLReport
}

interface ProfitAndLossParams {
  startDate?: string
  endDate?: string
}

function transformPNLReport(backend: BackendPNLReport): ProfitAndLossReport {
  return {
    startDate: backend.start_date,
    endDate: backend.end_date,
    revenue: backend.revenue,
    otherIncome: backend.other_income,
    totalIncome: backend.total_income,
    costOfGoods: backend.cost_of_goods,
    salary: backend.salary,
    rent: backend.rent,
    otherExpenses: backend.other_expenses,
    totalExpenses: backend.total_expenses,
    netProfit: backend.net_profit,
  }
}

export function useProfitAndLossReport(params?: ProfitAndLossParams) {
  return useQuery({
    queryKey: ['profit-and-loss', params],
    queryFn: async (): Promise<ProfitAndLossReport> => {
      const queryParams = new URLSearchParams()
      if (params?.startDate) queryParams.set('start_date', params.startDate)
      if (params?.endDate) queryParams.set('end_date', params.endDate)

      const url = '/finance/pnl' + (queryParams.toString() ? `?${queryParams}` : '')
      const response = await apiClient.get<PNLResponse>(url)
      return transformPNLReport(response.data.data)
    },
  })
}

export type { ProfitAndLossParams }
