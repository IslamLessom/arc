import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../client'

export interface LogoutResponse {
  message: string
}

/**
 * POST /auth/logout
 * Завершает сессию пользователя
 *
 * Headers:
 * Authorization: Bearer {access_token}
 *
 * Response (200):
 * { "message": "Выход выполнен успешно" }
 *
 * Действия на фронтенде:
 * 1. Очистить localStorage
 * 2. Перенаправить на /auth
 */
export function useLogout() {
  return useMutation({
    mutationFn: async (): Promise<LogoutResponse> => {
      const response = await apiClient.post<LogoutResponse>('/auth/logout')
      return response.data
    },
    onSuccess: () => {
      // Очищаем localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_type')
      }
    },
  })
}
