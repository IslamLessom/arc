import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Home } from './pages/home'
import { Auth } from './pages/auth'
import { Balances } from './pages/balances'
import { ProductCategories } from './pages/product-categories'
import { IngredientCategories } from './pages/ingredient-categories'
import { SemiFinished } from './pages/semi-finished'
import { AddSemiFinished } from './pages/add-semi-finished'
import { Ingredients } from './pages/ingredients'
import { TechnicalCards } from './pages/technical-cards'
import { Warehouses } from './pages/warehouses'
import { Supplies } from './pages/supplies'
import { AddSupply } from './pages/add-supply'
import { Suppliers } from './pages/suppliers'
import { WriteOffs } from './pages/write-offs'
import { AddWriteOff } from './pages/add-write-off'
import { MovementReport } from './pages/movement-report'
import { Movements } from './pages/movements'
import { Products } from './pages/products'
import { Inventories } from './pages/inventories'
import { Sidebar } from './widgets/sidebar'
import { OnboardingModal } from './widgets/onboarding-modal'
import { useOnboardingStatus } from './shared/hooks/useOnboardingStatus'
import { Workshops } from './pages/workshops'
import { Employees } from './pages/employees'
import { Positions } from './pages/positions'
import { CashRegisters } from './pages/cash-registers'
import { Establishments } from './pages/establishments'
import { Integrations } from './pages/integrations'
import { NotFound } from './pages/not-found'

export function App() {
  const location = useLocation()
  const currentPath = location.pathname
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

  return (
    <>
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
      />
      <Sidebar currentPath={currentPath} userName="Maki" />
      <div style={{ marginLeft: '280px' }}>
        <Routes>
          <Route path="/warehouse/balances" element={<Balances />} />
          <Route path="/warehouse/warehouses" element={<Warehouses />} />
          <Route path="/warehouse/deliveries" element={<Supplies />} />
          <Route path="/warehouse/deliveries/add" element={<AddSupply />} />
          <Route path="/warehouse/deliveries/:id/edit" element={<AddSupply />} />
          <Route path="/warehouse/deliveries/:id" element={<AddSupply />} />
          <Route path="/warehouse/suppliers" element={<Suppliers />} />
          <Route path="/warehouse/write-offs" element={<WriteOffs />} />
          <Route path="/warehouse/write-offs/add" element={<AddWriteOff />} />
          <Route path="/warehouse/movements" element={<Movements />} />
          <Route path="/warehouse/movement-report" element={<MovementReport />} />
          <Route path="/warehouse/inventories" element={<Inventories />} />
          <Route path="/menu/products" element={<Products />} />
          <Route path="/menu/product-categories" element={<ProductCategories />} />
          <Route path="/menu/ingredient-categories" element={<IngredientCategories />} />
          <Route path="/menu/semi-finished" element={<SemiFinished />} />
          <Route path="/menu/semi-finished/add" element={<AddSemiFinished />} />
          <Route path="/menu/ingredients" element={<Ingredients />} />
          <Route path="/menu/tech-cards" element={<TechnicalCards />} />
          <Route path="/menu/workshops" element={<Workshops />} />
          <Route path="/access/employees" element={<Employees />} />
          <Route path="/access/positions" element={<Positions />} />
          <Route path="/access/cash-registers" element={<CashRegisters />} />
          <Route path="/access/establishments" element={<Establishments />} />
          <Route path="/access/integrations" element={<Integrations />} />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  )
}

