import axios from 'axios'
import { applyApiErrorMessage } from './errors'

// Универсальная функция для получения переменных окружения
// Работает как в Vite (import.meta.env), так и в Next.js (process.env)
const getEnvVar = (key: string, defaultValue: string): string => {
  const proc = (globalThis as { process?: { env?: Record<string, string> } }).process
  if (proc?.env) {
    const viteKey = key.replace('NEXT_PUBLIC_', 'VITE_')
    return proc.env[viteKey] || proc.env[key] || defaultValue
  }
  return defaultValue
}

export const apiClient = axios.create({
  baseURL: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:8081/api/v1'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor для добавления токена
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Добавляем establishment_id в заголовок если он есть в localStorage
    const establishmentId = localStorage.getItem('establishment_id')
    if (establishmentId && config.headers) {
      config.headers['X-Establishment-ID'] = establishmentId
    }
  }
  return config
})

// Response interceptor для обработки ошибок и автоматического обновления токена
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => {
    // Проверяем если это ответ с флагом read_only (от админ-панели при истекшей подписке)
    if (response.data?.read_only) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('subscription_read_only', 'true')
      }
    }
    return response
  },
  async (error) => {
    applyApiErrorMessage(error, 'Не удалось выполнить запрос. Попробуйте еще раз.')
    const originalRequest = error.config

    // Обработка ошибок подписки (403 - Forbidden с read_only флагом)
    if (error.response?.status === 403) {
      const errorData = error.response.data
      if (errorData?.read_only === true) {
        // Это ошибка истекшей подписки - админка работает в read-only режиме
        if (typeof window !== 'undefined') {
          localStorage.setItem('subscription_read_only', 'true')
        }
        return Promise.reject(error)
      } else if (errorData?.error === 'subscription expired') {
        // Это ошибка для POS - полная блокировка доступа
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_type')
          window.location.href = '/auth'
        }
        return Promise.reject(error)
      }
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (typeof window === 'undefined') {
      return Promise.reject(error)
    }

    // Если это запрос на refresh - сразу выходим
    if (originalRequest.url?.includes('/auth/refresh')) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_type')
      localStorage.removeItem('owner_token_backup')
      localStorage.removeItem('owner_refresh_token_backup')
      return Promise.reject(error)
    }

    // Если уже обновляем токен - добавляем запрос в очередь
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(() => {
          return apiClient(originalRequest)
        })
        .catch((err) => {
          return Promise.reject(err)
        })
    }

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = localStorage.getItem('refresh_token')

    if (!refreshToken) {
      processQueue(error, null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_type')
      isRefreshing = false
      return Promise.reject(error)
    }

    try {
      const response = await apiClient.post<{
        access_token: string
        refresh_token: string
      }>('/auth/refresh', {
        refresh_token: refreshToken
      })

      const { access_token, refresh_token: newRefreshToken } = response.data

      localStorage.setItem('auth_token', access_token)
      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken)
      }

      processQueue(null, access_token)

      // Обновляем заголовок и повторяем запрос
      originalRequest.headers.Authorization = `Bearer ${access_token}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_type')
      localStorage.removeItem('owner_token_backup')
      localStorage.removeItem('owner_refresh_token_backup')

      // Перезагружаем страницу для перенаправления на логин
      if (typeof window !== 'undefined') {
        window.location.href = '/auth'
      }

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

