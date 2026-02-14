import { useEffect, useState } from 'react'
import type { AxiosError } from 'axios'
import { apiClient } from '../client'

export type PromotionType = 'discount' | 'buy_x_get_y' | 'bundle' | 'happy_hour'

export interface Promotion {
  id: string
  name: string
  description?: string | null
  type: PromotionType
  discount_percentage?: number | null
  buy_quantity?: number | null
  get_quantity?: number | null
  start_date: string
  end_date: string
  active: boolean
  usage_count?: number
  created_at: string
  updated_at: string
}

export interface CreatePromotionRequest {
  name: string
  description?: string
  type: PromotionType
  discount_percentage?: number
  buy_quantity?: number
  get_quantity?: number
  start_date: string
  end_date: string
}

export interface UpdatePromotionRequest {
  name?: string
  description?: string
  type?: PromotionType
  discount_percentage?: number
  buy_quantity?: number
  get_quantity?: number
  start_date?: string
  end_date?: string
  active?: boolean
}

export interface UseMarketingPromotionsReturn {
  promotions: Promotion[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createPromotion: (data: CreatePromotionRequest) => Promise<Promotion>
  updatePromotion: (id: string, data: UpdatePromotionRequest) => Promise<Promotion>
  deletePromotion: (id: string) => Promise<void>
}

export const useMarketingPromotions = (): UseMarketingPromotionsReturn => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    refetch()
  }, [])

  const refetch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<{ data: Promotion[] }>('/marketing/promotions')
      setPromotions(response.data.data)
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>
      setError(new Error(axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to fetch promotions'))
    } finally {
      setIsLoading(false)
    }
  }

  const createPromotion = async (data: CreatePromotionRequest): Promise<Promotion> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.post<{ data: Promotion }>('/marketing/promotions', data)
      setPromotions(prev => [response.data.data, ...prev])
      return response.data.data
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>
      const message = axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to create promotion'
      setError(new Error(message))
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePromotion = async (id: string, data: UpdatePromotionRequest): Promise<Promotion> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.put<{ data: Promotion }>(`/marketing/promotions/${id}`, data)
      setPromotions(prev => prev.map(item => (item.id === id ? response.data.data : item)))
      return response.data.data
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>
      const message = axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to update promotion'
      setError(new Error(message))
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const deletePromotion = async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await apiClient.delete(`/marketing/promotions/${id}`)
      setPromotions(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>
      const message = axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to delete promotion'
      setError(new Error(message))
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    promotions,
    isLoading,
    error,
    refetch,
    createPromotion,
    updatePromotion,
    deletePromotion,
  }
}
