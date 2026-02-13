import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

export interface Employee {
  id: string
  name: string
  email: string
  phone: string | null
  pin: string | null
  role_id: string  // Для отправки в запросах
  role?: {        // Для получения из ответа
    id: string
    name: string
    permissions: string
    created_at: string
    updated_at: string
  }
  establishment_id: string | null
  created_at: string
  updated_at: string
}

interface EmployeesResponse {
  data: Employee[]
}

interface EmployeeResponse {
  data: Employee
}

export interface CreateEmployeeRequest {
  name: string
  email?: string
  phone?: string
  pin: string
  role_id: string
}

export interface UpdateEmployeeRequest {
  name?: string
  email?: string
  phone?: string
  pin?: string
  role_id?: string
}

export function useGetEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async (): Promise<Employee[]> => {
      const response = await apiClient.get<EmployeesResponse>(
        '/access/employees'
      )
      return response.data.data
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 30 * 60 * 1000, // 30 минут
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useGetEmployee(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async (): Promise<Employee> => {
      const response = await apiClient.get<EmployeeResponse>(
        `/access/employees/${id}`
      )
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: CreateEmployeeRequest
    ): Promise<Employee> => {
      const response = await apiClient.post<EmployeeResponse>(
        '/access/employees',
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateEmployeeRequest
    }): Promise<Employee> => {
      const response = await apiClient.put<EmployeeResponse>(
        `/access/employees/${id}`,
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/access/employees/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}
