import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'

interface CurrentUserResponse {
  id: string
  email: string
  name: string
  onboarding_completed: boolean
  establishment_id?: string | null
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<CurrentUserResponse | null> => {
      // Проверяем наличие токена перед запросом
      if (typeof window === 'undefined') {
        return null
      }
      
      const token = localStorage.getItem('auth_token')
      if (!token) {
        return null
      }

      try {
        const response = await apiClient.get<CurrentUserResponse>('/auth/me')
        return response.data
      } catch (error) {
        // Если ошибка 401, удаляем токен и тип пользователя
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } }
          if (axiosError.response?.status === 401) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user_type')
          }
        }
        throw error
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('auth_token'),
  })
}

