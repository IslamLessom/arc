import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { AuthUser, AuthResponse } from './useAuth'

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        email: data.email,
        password: data.password,
        name: data.name,
      })

      // Сохраняем токен в localStorage
      if (typeof window !== 'undefined' && response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token)
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token)
        }
      }

      return response.data
    },
  })
}

