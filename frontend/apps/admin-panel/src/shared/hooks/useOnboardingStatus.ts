import { useCurrentUser } from '@restaurant-pos/api-client'

const USER_STORAGE_KEY = 'user_data'

export interface UserData {
  id: string
  email: string
  name: string
  onboarding_completed: boolean
  establishment_id?: string | null
}

export function useOnboardingStatus() {
  const { data: userData, isLoading, error } = useCurrentUser()

  // Если нет данных или ошибка авторизации, онбординг не нужен
  const hasValidUser = userData !== null && userData !== undefined && !error
  const isOnboardingCompleted = userData?.onboarding_completed ?? false
  const needsOnboarding = hasValidUser && !isOnboardingCompleted && !isLoading

  return {
    userData: userData ?? null,
    isOnboardingCompleted,
    needsOnboarding,
    isLoading,
    error,
  }
}

// Функция для обратной совместимости (используется в useAuthForm)
export function saveUserData(user: UserData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  }
}

export function clearUserData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_STORAGE_KEY)
  }
}

