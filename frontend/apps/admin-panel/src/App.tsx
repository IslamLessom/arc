import { useState, useEffect } from 'react'
import { Home } from './pages/home'
import { Auth } from './pages/auth'
import { Balances } from './pages/balances'
import { Sidebar } from './widgets/sidebar'
import { OnboardingModal } from './widgets/onboarding-modal'
import { useOnboardingStatus } from './shared/hooks/useOnboardingStatus'

export function App() {
  const currentPath = window.location.pathname
  const isAuthPage = currentPath === '/auth'
  const { needsOnboarding, isLoading } = useOnboardingStatus()
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)

  useEffect(() => {
    // Проверяем статус онбординга только если пользователь авторизован и данные загружены
    const token = localStorage.getItem('auth_token')
    if (token && !isLoading && needsOnboarding && !isAuthPage) {
      setShowOnboardingModal(true)
    }
  }, [needsOnboarding, isLoading, isAuthPage])

  if (isAuthPage) {
    return <Auth />
  }

  const renderPage = () => {
    switch (currentPath) {
      case '/warehouse/balances':
        return <Balances />
      case '/':
      default:
        return <Home />
    }
  }

  return (
    <>
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
      />
      <Sidebar currentPath={currentPath} userName="Maki" />
      <div style={{ marginLeft: '280px' }}>
        {renderPage()}
      </div>
    </>
  )
}

