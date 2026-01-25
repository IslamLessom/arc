import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

export interface Supplier {
  id: string
  establishment_id: string
  name: string
  taxpayer_number?: string
  phone?: string
  address?: string
  comment?: string
  contact?: string
  email?: string
  active: boolean
  created_at: string
  updated_at: string
}

interface SuppliersResponse {
  data: Supplier[]
}

interface SupplierResponse {
  data: Supplier
}

interface CreateSupplierRequest {
  name: string
  taxpayer_number?: string
  phone?: string
  address?: string
  comment?: string
  contact?: string
  email?: string
}

interface UpdateSupplierRequest {
  name?: string
  taxpayer_number?: string
  phone?: string
  address?: string
  comment?: string
  contact?: string
  email?: string
  active?: boolean
}

export function useGetSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async (): Promise<Supplier[]> => {
      const response = await apiClient.get<SuppliersResponse>(
        '/warehouse/suppliers'
      )
      return response.data.data
    },
  })
}

export function useGetSupplier(id: string) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: async (): Promise<Supplier> => {
      const response = await apiClient.get<SupplierResponse>(
        `/warehouse/suppliers/${id}`
      )
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: CreateSupplierRequest
    ): Promise<Supplier> => {
      const response = await apiClient.post<SupplierResponse>(
        '/warehouse/suppliers',
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateSupplierRequest
    }): Promise<Supplier> => {
      const response = await apiClient.put<SupplierResponse>(
        `/warehouse/suppliers/${id}`,
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/warehouse/suppliers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

