import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../client'

export interface PinLoginRequest {
  pin: string
  establishment_id: string
  initial_cash?: number
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

/**
 * POST /auth/employee/login
 *
 * Авторизация сотрудника по PIN-коду
 *
 * Flow:
 * 1. Owner логинится (user_type='owner')
 * 2. Redirect на /pin-login (ввод PIN сотрудника)
 * 3. GET /auth/me (получить establishment_id от владельца)
 * 4. POST /auth/employee/login (заменить токены, user_type='employee')
 * 5. Redirect на / (главная страница POS)
 */
export function usePinLogin() {
  return useMutation({
    mutationFn: async (request: PinLoginRequest): Promise<PinLoginResponse> => {
      const response = await apiClient.post<PinLoginResponse>('/auth/employee/login', {
        pin: request.pin,
        establishment_id: request.establishment_id,
        ...(request.initial_cash !== undefined && { initial_cash: request.initial_cash }),
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
