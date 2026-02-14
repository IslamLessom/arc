import { useEffect, useState } from 'react'
import type { AxiosError } from 'axios'
import { apiClient } from '../client'

export type LoyaltyProgramType = 'points' | 'cashback' | 'tier'

export interface LoyaltyProgram {
  id: string
  name: string
  description?: string | null
  type: LoyaltyProgramType
  points_per_currency?: number | null
  cashback_percentage?: number | null
  max_cashback_amount?: number | null
  point_multiplier: number
  active: boolean
  members_count?: number
  created_at: string
  updated_at: string
}

export interface CreateLoyaltyProgramRequest {
  name: string
  description?: string
  type: LoyaltyProgramType
  points_per_currency?: number
  cashback_percentage?: number
  max_cashback_amount?: number
  point_multiplier: number
}

export interface UpdateLoyaltyProgramRequest {
  name?: string
  description?: string
  type?: LoyaltyProgramType
  points_per_currency?: number
  cashback_percentage?: number
  max_cashback_amount?: number
  point_multiplier?: number
  active?: boolean
}

export interface UseMarketingLoyaltyProgramsReturn {
  loyaltyPrograms: LoyaltyProgram[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createLoyaltyProgram: (data: CreateLoyaltyProgramRequest) => Promise<LoyaltyProgram>
  updateLoyaltyProgram: (id: string, data: UpdateLoyaltyProgramRequest) => Promise<LoyaltyProgram>
  deleteLoyaltyProgram: (id: string) => Promise<void>
}

export const useMarketingLoyaltyPrograms = (): UseMarketingLoyaltyProgramsReturn => {
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    refetch()
  }, [])

  const refetch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<{ data: LoyaltyProgram[] }>('/marketing/loyalty-programs')
      setLoyaltyPrograms(response.data.data)
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>
      setError(new Error(axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to fetch loyalty programs'))
    } finally {
      setIsLoading(false)
    }
  }

  const createLoyaltyProgram = async (data: CreateLoyaltyProgramRequest): Promise<LoyaltyProgram> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.post<{ data: LoyaltyProgram }>('/marketing/loyalty-programs', data)
      setLoyaltyPrograms(prev => [response.data.data, ...prev])
      return response.data.data
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>
      const message = axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to create loyalty program'
      setError(new Error(message))
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const updateLoyaltyProgram = async (id: string, data: UpdateLoyaltyProgramRequest): Promise<LoyaltyProgram> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.put<{ data: LoyaltyProgram }>(`/marketing/loyalty-programs/${id}`, data)
      setLoyaltyPrograms(prev => prev.map(item => (item.id === id ? response.data.data : item)))
      return response.data.data
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>
      const message = axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to update loyalty program'
      setError(new Error(message))
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteLoyaltyProgram = async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await apiClient.delete(`/marketing/loyalty-programs/${id}`)
      setLoyaltyPrograms(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>
      const message = axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to delete loyalty program'
      setError(new Error(message))
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    loyaltyPrograms,
    isLoading,
    error,
    refetch,
    createLoyaltyProgram,
    updateLoyaltyProgram,
    deleteLoyaltyProgram,
  }
}
