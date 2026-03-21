import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { Subscription } from '@restaurant-pos/types'

export interface UserSubscriptionResponse {
  subscription: Subscription | null
  days_remaining: number
  is_expired: boolean
  is_trial: boolean
}

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async (): Promise<UserSubscriptionResponse | null> => {
      if (typeof window === 'undefined') {
        return null
      }
      
      const token = localStorage.getItem('auth_token')
      if (!token) {
        return null
      }

      try {
        // Получаем данные текущего пользователя, включая subscription_id
        const userResponse = await apiClient.get<{
          id: string
          subscription_id?: string
          subscription?: Subscription
        }>('/auth/me')

        // Если у пользователя нет подписки, возвращаем null
        if (!userResponse.data.subscription_id) {
          return {
            subscription: null,
            days_remaining: 0,
            is_expired: true,
            is_trial: false
          }
        }

        // Если подписка уже загружена в объекте пользователя
        if (userResponse.data.subscription) {
          const subscription = userResponse.data.subscription
          const endDate = new Date(subscription.end_date)
          const now = new Date()
          const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          const isExpired = endDate < now
          const isTrial = subscription.plan?.name.toLowerCase().includes('trial') || false

          return {
            subscription,
            days_remaining: Math.max(0, daysRemaining),
            is_expired: isExpired,
            is_trial: isTrial
          }
        }

        return null
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
        return null
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('auth_token'),
  })
}
