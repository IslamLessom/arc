import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

export interface Establishment {
  id: string
  owner_id: string
  name: string
  address?: string
  phone?: string
  email?: string
  has_seating_places: boolean
  table_count?: number
  type: string
  has_delivery: boolean
  has_takeaway: boolean
  has_reservations: boolean
  active: boolean
  created_at: string
  updated_at: string
}

interface EstablishmentsResponse {
  data: Establishment[]
}

interface EstablishmentResponse {
  data: Establishment
}

export interface CreateEstablishmentRequest {
  name: string
  address?: string
  phone?: string
  email?: string
  has_seating_places?: boolean
  table_count?: number
  type?: string
  has_delivery?: boolean
  has_takeaway?: boolean
  has_reservations?: boolean
}

export interface UpdateEstablishmentRequest {
  name?: string
  address?: string
  phone?: string
  email?: string
  has_seating_places?: boolean
  table_count?: number
  type?: string
  has_delivery?: boolean
  has_takeaway?: boolean
  has_reservations?: boolean
  active?: boolean
}

export function useGetEstablishments() {
  return useQuery({
    queryKey: ['establishments'],
    queryFn: async (): Promise<Establishment[]> => {
      const response = await apiClient.get<EstablishmentsResponse>('/establishments')
      return response.data.data
    },
  })
}

export function useGetEstablishment(id: string) {
  return useQuery({
    queryKey: ['establishment', id],
    queryFn: async (): Promise<Establishment> => {
      const response = await apiClient.get<EstablishmentResponse>(`/establishments/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateEstablishment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateEstablishmentRequest): Promise<Establishment> => {
      const response = await apiClient.post<EstablishmentResponse>('/establishments', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['establishments'] })
    },
  })
}

export function useUpdateEstablishment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateEstablishmentRequest
    }): Promise<Establishment> => {
      const response = await apiClient.put<EstablishmentResponse>(`/establishments/${id}`, data)
      return response.data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['establishments'] })
      queryClient.invalidateQueries({ queryKey: ['establishment', variables.id] })
    },
  })
}

export function useDeleteEstablishment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/establishments/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['establishments'] })
    },
  })
}

