import { apiClient } from '../client'

export interface RefreshTokenResponse {
  access_token: string
  refresh_token: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

/**
 * Hook для обновления токена авторизации
 * Вызывает endpoint /auth/refresh для получения новой пары токенов
 */
export function useRefreshToken() {
  const refreshToken = async (): Promise<RefreshTokenResponse | null> => {
    if (typeof window === 'undefined') {
      return null
    }

    const currentRefreshToken = localStorage.getItem('refresh_token')

    if (!currentRefreshToken) {
      return null
    }

    try {
      const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
        refresh_token: currentRefreshToken
      } as RefreshTokenRequest)

      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token)
      }

      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token)
      }

      return response.data
    } catch (error) {
      console.error('Failed to refresh token:', error)
      return null
    }
  }

  return { refreshToken }
}
