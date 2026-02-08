import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../client'

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  onboarding_completed: boolean
  establishment_id?: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: AuthUser
}

export function useAuth() {
  return useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      })

      // Сохраняем токен и тип пользователя в localStorage
      if (typeof window !== 'undefined' && response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token)
        localStorage.setItem('user_type', 'owner')
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token)
        }

        // Получаем establishment_id из user data или из /establishments
        if (response.data.user.establishment_id) {
          localStorage.setItem('establishment_id', response.data.user.establishment_id)
        } else {
          // Если establishment_id нет в ответе, получаем его из /establishments
          try {
            const estResponse = await apiClient.get('/establishments')
            if (estResponse.data.data && estResponse.data.data.length > 0) {
              localStorage.setItem('establishment_id', estResponse.data.data[0].id)
            }
          } catch (e) {
            console.error('Failed to get establishment_id:', e)
          }
        }
      }

      return response.data
    },
  })
}

