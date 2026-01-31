import { Navigate, useLocation } from 'react-router-dom'
import { useCurrentUser } from '@restaurant-pos/api-client'
import { Suspense, lazy } from 'react'

const LazyAuthPage = lazy(() => import('@/pages/auth').then(m => ({ default: m.AuthPage })))
const LazyPinLogin = lazy(() => import('@/pages/pin-login').then(m => ({ default: m.PinLogin })))
const LazyHomePage = lazy(() => import('@/pages/home').then(m => ({ default: m.HomePage })))

interface ProtectedRouteProps {
  children: React.ReactNode
}

// Типы авторизации
type AuthState = 'none' | 'owner' | 'employee'

function getAuthState(): AuthState {
  if (typeof window === 'undefined') return 'none'

  const token = localStorage.getItem('auth_token')
  if (!token) return 'none'

  const user_type = localStorage.getItem('user_type')
  return user_type === 'employee' ? 'employee' : 'owner'
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const { data: currentUser, isLoading } = useCurrentUser()

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>
  }

  const authState = getAuthState()

  // Определяем доступные маршруты для текущего состояния
  const getAccessibleRoute = (): string => {
    switch (authState) {
      case 'none':
        return '/auth'
      case 'owner':
        return '/pin-login'
      case 'employee':
        return '/'
      default:
        return '/auth'
    }
  }

  const accessibleRoute = getAccessibleRoute()

  // Если пользователь пытается перейти на недоступный маршрут - редиректим
  if (location.pathname !== accessibleRoute && location.pathname !== accessibleRoute + '/') {
    return <Navigate to={accessibleRoute} replace />
  }

  return <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Загрузка...</div>}>{children}</Suspense>
}

// Компоненты для маршрутов с автоматической проверкой
export function AuthRoute() {
  const authState = getAuthState()

  if (authState !== 'none') {
    const targetRoute = authState === 'employee' ? '/' : '/pin-login'
    return <Navigate to={targetRoute} replace />
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Загрузка...</div>}>
      <LazyAuthPage />
    </Suspense>
  )
}

export function PinLoginRoute() {
  const authState = getAuthState()

  if (authState === 'none') {
    return <Navigate to="/auth" replace />
  }

  if (authState === 'employee') {
    return <Navigate to="/" replace />
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Загрузка...</div>}>
      <LazyPinLogin />
    </Suspense>
  )
}

export function HomeRoute() {
  const authState = getAuthState()

  if (authState === 'none') {
    return <Navigate to="/auth" replace />
  }

  if (authState === 'owner') {
    return <Navigate to="/pin-login" replace />
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Загрузка...</div>}>
      <LazyHomePage />
    </Suspense>
  )
}
