import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import type {
  SalesStatistics,
  CustomerStatistics,
  EmployeesSalesStatistics,
  WorkshopStatistics,
  TableStatistics,
  CategoryStatistics,
  ProductStatistics,
  ABCAnalysisData,
  CheckStatistics,
  ReviewStatistics,
  PaymentStatistics,
  TaxStatistics
} from '../types'

export function useSalesStatistics(params?: { start_date?: string; end_date?: string }) {
  const query = useQuery({
    queryKey: ['sales-statistics', params],
    queryFn: async () => {
      const response = await apiClient.get<{ data: SalesStatistics }>('/statistics/sales', { params })
      return response.data
    },
    enabled: !!localStorage.getItem('auth_token')
  })

  const { data, error, isLoading } = query

  return { data, error, isLoading }
}

export function useCustomerStatistics(params?: { start_date?: string; end_date?: string }) {
  const query = useQuery({
    queryKey: ['customer-statistics', params],
    queryFn: async () => {
      const response = await apiClient.get<{ data: CustomerStatistics }>('/statistics/customers', { params })
      return response.data
    },
    enabled: !!localStorage.getItem('auth_token')
  })

  const { data, error, isLoading } = query

  return { data, error, isLoading }
}

export function useEmployeesStatistics(params?: { start_date?: string; end_date?: string }) {
  const query = useQuery({
    queryKey: ['employees-statistics', params],
    queryFn: async () => {
      const response = await apiClient.get<{ data: EmployeesSalesStatistics }>('/statistics/employees', { params })
      return response.data
    },
    enabled: !!localStorage.getItem('auth_token')
  })

  const { data, error, isLoading } = query

  return { data, error, isLoading }
}

export function useWorkshopStatistics(params?: { start_date?: string; end_date?: string }) {
  const query = useQuery({
    queryKey: ['workshop-statistics', params],
    queryFn: async () => {
      const response = await apiClient.get<{ data: WorkshopStatistics }>('/statistics/workshops', { params })
      return response.data
    },
    enabled: !!localStorage.getItem('auth_token')
  })

  const { data, error, isLoading } = query

  return { data, error, isLoading }
}

export function useTableStatistics(params?: { start_date?: string; end_date?: string }) {
  const query = useQuery({
    queryKey: ['table-statistics', params],
    queryFn: async () => {
      const response = await apiClient.get<{ data: TableStatistics }>('/statistics/tables', { params })
      return response.data
    },
    enabled: !!localStorage.getItem('auth_token')
  })

  const { data, error, isLoading } = query

  return { data, error, isLoading }
}

export function useCategoryStatistics(params?: { start_date?: string; end_date?: string }) {
  const query = useQuery({
    queryKey: ['category-statistics', params],
    queryFn: async () => {
      const response = await apiClient.get<{ data: CategoryStatistics }>('/statistics/categories', { params })
      return response.data
    },
    enabled: !!localStorage.getItem('auth_token')
  })

  const { data, error, isLoading } = query

  return { data, error, isLoading }
}

export function useProductStatistics(params?: { start_date?: string; end_date?: string }) {
  const query = useQuery({
    queryKey: ['product-statistics', params],
    queryFn: async () => {
      const response = await apiClient.get<{ data: ProductStatistics }>('/statistics/products', { params })
      return response.data
    },
    enabled: !!localStorage.getItem('auth_token')
  })

  const { data, error, isLoading } = query

  return { data, error, isLoading }
}

export function useABCAnalysis(params?: { start_date?: string; end_date?: string }) {
  const query = useQuery({
    queryKey: ['abc-analysis', params],
    queryFn: async () => {
      const response = await apiClient.get<{ data: ABCAnalysisData }>('/statistics/abc', { params })
      return response.data
    },
    enabled: !!localStorage.getItem('auth_token')
  })

  const { data, error, isLoading } = query

  return { data, error, isLoading }
}

export function useCheckStatistics(params?: { start_date?: string; end_date?: string }) {
  const query = useQuery({
    queryKey: ['check-statistics', params],
    queryFn: async () => {
      const response = await apiClient.get<{ data: CheckStatistics }>('/statistics/checks', { params })
      return response.data
    },
    enabled: !!localStorage.getItem('auth_token')
  })

  const { data, error, isLoading } = query

  return { data, error, isLoading }
}

export function useReviewStatistics(params?: { start_date?: string; end_date?: string }) {
  const query = useQuery({
    queryKey: ['review-statistics', params],
    queryFn: async () => {
      const response = await apiClient.get<{ data: ReviewStatistics }>('/statistics/reviews', { params })
      return response.data
    },
    enabled: !!localStorage.getItem('auth_token')
  })

  const { data, error, isLoading } = query

  return { data, error, isLoading }
}

export function usePaymentStatistics(params?: { start_date?: string; end_date?: string }) {
  const query = useQuery({
    queryKey: ['payment-statistics', params],
    queryFn: async () => {
      const response = await apiClient.get<{ data: PaymentStatistics }>('/statistics/payments', { params })
      return response.data
    },
    enabled: !!localStorage.getItem('auth_token')
  })

  const { data, error, isLoading } = query

  return { data, error, isLoading }
}

export function useTaxStatistics(params?: { start_date?: string; end_date?: string }) {
  const query = useQuery({
    queryKey: ['tax-statistics', params],
    queryFn: async () => {
      const response = await apiClient.get<{ data: TaxStatistics }>('/statistics/taxes', { params })
      return response.data
    },
    enabled: !!localStorage.getItem('auth_token')
  })

  const { data, error, isLoading } = query

  return { data, error, isLoading }
}
