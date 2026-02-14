import { useState, useEffect } from 'react'
import { apiClient } from '../client'
import type { AxiosError } from 'axios'

export interface CustomerGroup {
  id: string
  name: string
  description?: string
  discount_percentage: number
  min_orders?: number
  min_spent?: number
  created_at: string
  updated_at: string
}

export interface CreateCustomerGroupRequest {
  name: string
  description?: string
  discount_percentage: number
  min_orders?: number
  min_spent?: number
}

export interface UpdateCustomerGroupRequest {
  name?: string
  description?: string
  discount_percentage?: number
  min_orders?: number
  min_spent?: number
}

export interface UseCustomerGroupsReturn {
  customerGroups: CustomerGroup[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
  createCustomerGroup: (data: CreateCustomerGroupRequest) => Promise<CustomerGroup>
  updateCustomerGroup: (id: string, data: UpdateCustomerGroupRequest) => Promise<CustomerGroup>
  deleteCustomerGroup: (id: string) => Promise<void>
}

export const useCustomerGroups = (): UseCustomerGroupsReturn => {
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Load customer groups on mount
  useEffect(() => {
    refetch()
  }, [])

  const refetch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<{ data: CustomerGroup[] }>('/marketing/customer-groups')
      setCustomerGroups(response.data.data)
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>
      setError(new Error(error.response?.data?.message || 'Failed to fetch customer groups'))
    } finally {
      setIsLoading(false)
    }
  }

  const createCustomerGroup = async (data: CreateCustomerGroupRequest): Promise<CustomerGroup> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.post<{ data: CustomerGroup }>('/marketing/customer-groups', data)
      setCustomerGroups(prev => [...prev, response.data.data])
      return response.data.data
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>
      const message = error.response?.data?.message || 'Failed to create customer group'
      setError(new Error(message))
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const updateCustomerGroup = async (id: string, data: UpdateCustomerGroupRequest): Promise<CustomerGroup> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.put<{ data: CustomerGroup }>(`/marketing/customer-groups/${id}`, data)
      setCustomerGroups(prev => prev.map(g => g.id === id ? response.data.data : g))
      return response.data.data
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>
      const message = error.response?.data?.message || 'Failed to update customer group'
      setError(new Error(message))
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCustomerGroup = async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await apiClient.delete(`/marketing/customer-groups/${id}`)
      setCustomerGroups(prev => prev.filter(g => g.id !== id))
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>
      const message = error.response?.data?.message || 'Failed to delete customer group'
      setError(new Error(message))
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    customerGroups,
    isLoading,
    error,
    refetch,
    createCustomerGroup,
    updateCustomerGroup,
    deleteCustomerGroup,
  }
}
