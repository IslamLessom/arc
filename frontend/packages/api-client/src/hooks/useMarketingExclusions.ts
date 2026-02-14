import { useEffect, useState } from 'react'
import type { AxiosError } from 'axios'
import { apiClient } from '../client'

export type ExclusionType = 'product' | 'category' | 'customer' | 'customer_group'

export interface Exclusion {
  id: string
  name: string
  description?: string | null
  type: ExclusionType
  entity_id?: string
  entity_name?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface CreateExclusionRequest {
  name: string
  description?: string
  type: ExclusionType
  entity_id?: string
  entity_name?: string
}

export interface UpdateExclusionRequest {
  name?: string
  description?: string
  type?: ExclusionType
  entity_id?: string
  entity_name?: string
  active?: boolean
}

export interface UseMarketingExclusionsReturn {
  exclusions: Exclusion[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createExclusion: (data: CreateExclusionRequest) => Promise<Exclusion>
  updateExclusion: (id: string, data: UpdateExclusionRequest) => Promise<Exclusion>
  deleteExclusion: (id: string) => Promise<void>
}

export const useMarketingExclusions = (): UseMarketingExclusionsReturn => {
  const [exclusions, setExclusions] = useState<Exclusion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    refetch()
  }, [])

  const refetch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<{ data: Exclusion[] }>('/marketing/exclusions')
      setExclusions(response.data.data)
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>
      setError(new Error(axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to fetch exclusions'))
    } finally {
      setIsLoading(false)
    }
  }

  const createExclusion = async (data: CreateExclusionRequest): Promise<Exclusion> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.post<{ data: Exclusion }>('/marketing/exclusions', data)
      setExclusions(prev => [response.data.data, ...prev])
      return response.data.data
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>
      const message = axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to create exclusion'
      setError(new Error(message))
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const updateExclusion = async (id: string, data: UpdateExclusionRequest): Promise<Exclusion> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.put<{ data: Exclusion }>(`/marketing/exclusions/${id}`, data)
      setExclusions(prev => prev.map(item => (item.id === id ? response.data.data : item)))
      return response.data.data
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>
      const message = axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to update exclusion'
      setError(new Error(message))
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteExclusion = async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await apiClient.delete(`/marketing/exclusions/${id}`)
      setExclusions(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>
      const message = axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to delete exclusion'
      setError(new Error(message))
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    exclusions,
    isLoading,
    error,
    refetch,
    createExclusion,
    updateExclusion,
    deleteExclusion,
  }
}
