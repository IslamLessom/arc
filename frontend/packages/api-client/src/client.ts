import axios from 'axios'

// Универсальная функция для получения переменных окружения
// Работает как в Vite (import.meta.env), так и в Next.js (process.env)
const getEnvVar = (key: string, defaultValue: string): string => {
  // Vite использует import.meta.env
  if (typeof import.meta !== 'undefined') {
    const meta = import.meta as { env?: Record<string, string> }
    if (meta.env) {
      const viteKey = key.replace('NEXT_PUBLIC_', 'VITE_')
      return meta.env[viteKey] || meta.env[key] || defaultValue
    }
  }
  // Next.js использует process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue
  }
  return defaultValue
}

export const apiClient = axios.create({
  baseURL: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:8080/api/v1'),
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
  }
  return config
})

// Response interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Refresh token logic - очищаем все данные авторизации
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_type')
    }
    return Promise.reject(error)
  }
)

