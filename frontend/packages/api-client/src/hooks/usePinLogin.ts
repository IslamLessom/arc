import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../client'

export interface PinLoginRequest {
  pin: string
  initial_cash: number
  establishment_id: string
}

export interface PinAuthUser {
  id: string
  email: string
  name: string
  onboarding_completed: boolean
}

export interface PinLoginResponse {
  access_token: string
  refresh_token: string
  user: PinAuthUser
}

export function usePinLogin() {
  return useMutation({
    mutationFn: async (request: PinLoginRequest): Promise<PinLoginResponse> => {
      const response = await apiClient.post<PinLoginResponse>('/auth/employee/login', {
        pin: request.pin,
        initial_cash: request.initial_cash,
        establishment_id: request.establishment_id,
      })

      // Сохраняем токен и тип пользователя в localStorage
      if (typeof window !== 'undefined' && response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token)
        localStorage.setItem('user_type', 'employee')
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token)
        }
      }

      return response.data
    },
  })
}
