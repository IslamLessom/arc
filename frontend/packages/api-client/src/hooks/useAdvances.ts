import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

export interface Advance {
  id: string
  user_id: string
  employee_name: string
  establishment_id: string
  amount: number
  given_date: string
  description?: string
  status: 'pending' | 'applied'
  applied_to_salary_period_start?: string
  applied_to_salary_period_end?: string
}

interface AdvanceResponse {
  data: Advance
}

interface AdvancesListResponse {
  data: Advance[]
}

interface CreateAdvanceRequest {
  user_id: string
  amount: number
  description?: string
}

export function useAdvances() {
  return useQuery({
    queryKey: ['advances'],
    queryFn: async (): Promise<Advance[]> => {
      const response = await apiClient.get<AdvancesListResponse>('/finance/advances')
      return response.data.data
    },
  })
}

export function usePendingAdvances() {
  return useQuery({
    queryKey: ['advances-pending'],
    queryFn: async (): Promise<Advance[]> => {
      const response = await apiClient.get<AdvancesListResponse>('/finance/advances/pending')
      return response.data.data
    },
  })
}

export function useAdvanceByID(id: string, enabled = true) {
  return useQuery({
    queryKey: ['advance', id],
    queryFn: async (): Promise<Advance> => {
      const response = await apiClient.get<AdvanceResponse>(`/finance/advances/${id}`)
      return response.data.data
    },
    enabled: enabled && !!id,
  })
}

export function useCreateAdvance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateAdvanceRequest) => {
      const response = await apiClient.post<AdvanceResponse>('/finance/advances', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advances'] })
      queryClient.invalidateQueries({ queryKey: ['advances-pending'] })
    },
  })
}

export function useDeleteAdvance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/finance/advances/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advances'] })
      queryClient.invalidateQueries({ queryKey: ['advances-pending'] })
    },
  })
}
