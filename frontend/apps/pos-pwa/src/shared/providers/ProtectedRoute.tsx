import { Navigate, useLocation } from 'react-router-dom'
import { useCurrentUser } from '@restaurant-pos/api-client'
import { Suspense, lazy } from 'react'

const LazyAuthPage = lazy(() => import('@/pages/auth').then(m => ({ default: m.AuthPage })))
const LazyPinLogin = lazy(() => import('@/pages/pin-login').then(m => ({ default: m.PinLogin })))
const LazyHomePage = lazy(() => import('@/pages/home').then(m => ({ default: m.HomePage })))
const LazyTableSelection = lazy(() => import('@/pages/table-selection').then(m => ({ default: m.TableSelection })))
const LazyOrder = lazy(() => import('@/pages/order').then(m => ({ default: m.Order })))
const LazyPayment = lazy(() => import('@/pages/payment').then(m => ({ default: m.Payment })))
const LazyOrdersArchive = lazy(() => import('@/pages/orders-archive').then(m => ({ default: m.OrdersArchive })))
const LazyReceiptsArchive = lazy(() => import('@/pages/receipts-archive').then(m => ({ default: m.ReceiptsArchive })))
const LazySupplies = lazy(() => import('@/pages/supplies').then(m => ({ default: m.Supplies })))
const LazyAddSupply = lazy(() => import('@/pages/add-supply').then(m => ({ default: m.AddSupply })))

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

function isLocked(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('is_locked') === 'true'
}

function hasApplicationAccess(): boolean {
  if (typeof window === 'undefined') return false
  
  const authState = getAuthState()
  
  // Owner всегда имеет доступ
  if (authState === 'owner') return true
  
  // Для сотрудника пытаемся парсить permissions
  const permissionsStr = localStorage.getItem('employee_permissions')
  if (!permissionsStr) {
    // Если нет permissions строки вообще - у сотрудника нет доступа
    // (это значит что роль не имеет никаких разрешений)
    return false
  }
  
  try {
    const permissions = JSON.parse(permissionsStr)
    
    // Проверяем наличие реальных прав в админ-панели (не 'none')
    let hasAdminAccess = false
    if (permissions.admin_panel_access?.sections && Array.isArray(permissions.admin_panel_access.sections)) {
      hasAdminAccess = permissions.admin_panel_access.sections.some(
        (section: { access_level: string }) => section.access_level !== 'none'
      )
    }
    
    // Проверяем наличие хотя бы какого-то доступа
    if (permissions.cash_access?.work_with_cash || 
        permissions.cash_access?.admin_hall || 
        hasAdminAccess) {
      return true
    }
    return false
  } catch {
    // Если не можем парсить - считаем что нет доступа
    return false
  }
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
  const locked = isLocked()

  if (authState === 'none') {
    return <Navigate to="/auth" replace />
  }

  // Если приложение заблокировано - показываем pin-login
  if (authState === 'employee' && !locked) {
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
  const locked = isLocked()
  const hasAccess = hasApplicationAccess()

  if (authState === 'none') {
    return <Navigate to="/auth" replace />
  }

  // Если приложение заблокировано или владелец - перенаправляем на pin-login
  if (authState === 'owner' || locked) {
    return <Navigate to="/pin-login" replace />
  }

  // Если сотрудник не имеет доступа к приложению - перенаправляем обратно на pin-login
  if (!hasAccess) {
    return <Navigate to="/pin-login" replace />
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Загрузка...</div>}>
      <LazyHomePage />
    </Suspense>
  )
}

export function TableSelectionRoute() {
  const authState = getAuthState()
  const locked = isLocked()
  const hasAccess = hasApplicationAccess()

  if (authState === 'none') {
    return <Navigate to="/auth" replace />
  }

  // Если приложение заблокировано или владелец - перенаправляем на pin-login
  if (authState === 'owner' || locked) {
    return <Navigate to="/pin-login" replace />
  }

  // Если сотрудник не имеет доступа к приложению - перенаправляем обратно на pin-login
  if (!hasAccess) {
    return <Navigate to="/pin-login" replace />
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Загрузка...</div>}>
      <LazyTableSelection />
    </Suspense>
  )
}

export function OrderRoute() {
  const authState = getAuthState()
  const locked = isLocked()
  const hasAccess = hasApplicationAccess()

  if (authState === 'none') {
    return <Navigate to="/auth" replace />
  }

  // Если приложение заблокировано или владелец - перенаправляем на pin-login
  if (authState === 'owner' || locked) {
    return <Navigate to="/pin-login" replace />
  }

  // Если сотрудник не имеет доступа к приложению - перенаправляем обратно на pin-login
  if (!hasAccess) {
    return <Navigate to="/pin-login" replace />
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Загрузка...</div>}>
      <LazyOrder />
    </Suspense>
  )
}

export function PaymentRoute() {
  const authState = getAuthState()
  const locked = isLocked()
  const hasAccess = hasApplicationAccess()

  if (authState === 'none') {
    return <Navigate to="/auth" replace />
  }

  // Если приложение заблокировано или владелец - перенаправляем на pin-login
  if (authState === 'owner' || locked) {
    return <Navigate to="/pin-login" replace />
  }

  // Если сотрудник не имеет доступа к приложению - перенаправляем обратно на pin-login
  if (!hasAccess) {
    return <Navigate to="/pin-login" replace />
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Загрузка...</div>}>
      <LazyPayment />
    </Suspense>
  )
}

export function OrdersArchiveRoute() {
  const authState = getAuthState()
  const locked = isLocked()
  const hasAccess = hasApplicationAccess()

  if (authState === 'none') {
    return <Navigate to="/auth" replace />
  }

  // Если приложение заблокировано или владелец - перенаправляем на pin-login
  if (authState === 'owner' || locked) {
    return <Navigate to="/pin-login" replace />
  }

  // Если сотрудник не имеет доступа к приложению - перенаправляем обратно на pin-login
  if (!hasAccess) {
    return <Navigate to="/pin-login" replace />
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Загрузка...</div>}>
      <LazyOrdersArchive />
    </Suspense>
  )
}

export function ReceiptsArchiveRoute() {
  const authState = getAuthState()
  const locked = isLocked()
  const hasAccess = hasApplicationAccess()

  if (authState === 'none') {
    return <Navigate to="/auth" replace />
  }

  // Если приложение заблокировано или владелец - перенаправляем на pin-login
  if (authState === 'owner' || locked) {
    return <Navigate to="/pin-login" replace />
  }

  // Если сотрудник не имеет доступа к приложению - перенаправляем обратно на pin-login
  if (!hasAccess) {
    return <Navigate to="/pin-login" replace />
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Загрузка...</div>}>
      <LazyReceiptsArchive />
    </Suspense>
  )
}

export function SuppliesRoute() {
  const authState = getAuthState()
  const locked = isLocked()
  const hasAccess = hasApplicationAccess()

  if (authState === 'none') {
    return <Navigate to="/auth" replace />
  }

  if (authState === 'owner' || locked) {
    return <Navigate to="/pin-login" replace />
  }

  if (!hasAccess) {
    return <Navigate to="/pin-login" replace />
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Загрузка...</div>}>
      <LazySupplies />
    </Suspense>
  )
}

export function AddSupplyRoute() {
  const authState = getAuthState()
  const locked = isLocked()
  const hasAccess = hasApplicationAccess()

  if (authState === 'none') {
    return <Navigate to="/auth" replace />
  }

  if (authState === 'owner' || locked) {
    return <Navigate to="/pin-login" replace />
  }

  if (!hasAccess) {
    return <Navigate to="/pin-login" replace />
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Загрузка...</div>}>
      <LazyAddSupply />
    </Suspense>
  )
}
