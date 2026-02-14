import { useState, useEffect } from 'react'
import { apiClient } from '../client'
import type { AxiosError } from 'axios'

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  birthday?: string
  group_id?: string
  group?: {
    id: string
    name: string
  }
  loyalty_program_id?: string
  loyalty_program?: {
    id: string
    name: string
  }
  loyalty_points: number
  total_orders: number
  total_spent: number
  created_at: string
  updated_at: string
}

export interface CreateCustomerRequest {
  name: string
  email?: string
  phone?: string
  birthday?: string
  group_id?: string
  loyalty_program_id?: string
}

export interface UpdateCustomerRequest {
  name?: string
  email?: string
  phone?: string
  birthday?: string
  group_id?: string
  loyalty_program_id?: string
}

export interface UseCustomersReturn {
  customers: Customer[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
  createCustomer: (data: CreateCustomerRequest) => Promise<Customer>
  updateCustomer: (id: string, data: UpdateCustomerRequest) => Promise<Customer>
  deleteCustomer: (id: string) => Promise<void>
}

export const useCustomers = (): UseCustomersReturn => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Load customers on mount
  useEffect(() => {
    refetch()
  }, [])

  const refetch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<{ data: Customer[] }>('/marketing/clients')
      setCustomers(response.data.data)
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>
      setError(new Error(error.response?.data?.message || 'Failed to fetch customers'))
    } finally {
      setIsLoading(false)
    }
  }

  const createCustomer = async (data: CreateCustomerRequest): Promise<Customer> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.post<{ data: Customer }>('/marketing/clients', data)
      setCustomers(prev => [...prev, response.data.data])
      return response.data.data
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>
      const message = error.response?.data?.message || 'Failed to create customer'
      setError(new Error(message))
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const updateCustomer = async (id: string, data: UpdateCustomerRequest): Promise<Customer> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.put<{ data: Customer }>(`/marketing/clients/${id}`, data)
      setCustomers(prev => prev.map(c => c.id === id ? response.data.data : c))
      return response.data.data
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>
      const message = error.response?.data?.message || 'Failed to update customer'
      setError(new Error(message))
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCustomer = async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await apiClient.delete(`/marketing/clients/${id}`)
      setCustomers(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>
      const message = error.response?.data?.message || 'Failed to delete customer'
      setError(new Error(message))
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    customers,
    isLoading,
    error,
    refetch,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  }
}
