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
import { InventoryDetail } from './pages/inventory-detail'
import { Sidebar } from './widgets/sidebar'
import { OnboardingModal } from './widgets/onboarding-modal'
import { useOnboardingStatus } from './shared/hooks/useOnboardingStatus'
import { Workshops } from './pages/workshops'
import { Employees } from './pages/employees'
import { Positions } from './pages/positions'
import { AddPositionPage } from './pages/add-position'
import { CashRegisters } from './pages/cash-registers'
import { Establishments } from './pages/establishments'
import { Integrations } from './pages/integrations'
import { NotFound } from './pages/not-found'
import { Transactions } from './pages/transactions'
import { CashFlow } from './pages/cash-flow'
import { CashRegisterShifts } from './pages/cash-register-shifts'
import { Salary } from './pages/salary'
import { Invoices } from './pages/invoices'
import { FinanceCategories } from './pages/finance-categories'
import { ProfitAndLoss } from './pages/profit-and-loss'
import { HallMap } from './pages/hall-map'
import { Customers } from './pages/marketing-customers'
import { CustomerGroups } from './pages/marketing-customer-groups'
import { LoyaltyPrograms } from './pages/marketing-loyalty-programs'
import { Exclusions } from './pages/marketing-exclusions'
import { Promotions } from './pages/marketing-promotions'
import { StatisticsSales } from './pages/statistics-sales'
import { StatisticsCustomers } from './pages/statistics-customers'
import { StatisticsEmployees } from './pages/statistics-employees'
import { StatisticsWorkshops } from './pages/statistics-workshops'
import { StatisticsTables } from './pages/statistics-tables'
import { StatisticsCategories } from './pages/statistics-categories'
import { StatisticsProducts } from './pages/statistics-products'
import { StatisticsAbc } from './pages/statistics-abc'
import { StatisticsChecks } from './pages/statistics-checks'
import { StatisticsReviews } from './pages/statistics-reviews'
import { StatisticsPayments } from './pages/statistics-payments'
import { StatisticsTaxes } from './pages/statistics-taxes'

export function App() {
  const location = useLocation()
  const currentPath = location.pathname
  const isAuthPage = currentPath === '/auth'
  const { needsOnboarding, isLoading, userData } = useOnboardingStatus()
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
      <Sidebar currentPath={currentPath} userName={userData?.name || 'Гость'} />
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
          <Route path="/warehouse/inventories/new" element={<InventoryDetail />} />
          <Route path="/warehouse/inventories/:id" element={<InventoryDetail />} />
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
          <Route path="/access/positions/add" element={<AddPositionPage />} />
          <Route path="/access/positions/:id/edit" element={<AddPositionPage />} />
          <Route path="/access/cash-registers" element={<CashRegisters />} />
          <Route path="/access/establishments" element={<Establishments />} />
          <Route path="/access/integrations" element={<Integrations />} />
          <Route path="/finance/transactions" element={<Transactions />} />
          <Route path="/finance/cash-flow" element={<CashFlow />} />
          <Route path="/finance/cash-register-shifts" element={<CashRegisterShifts />} />
          <Route path="/finance/salary" element={<Salary />} />
          <Route path="/finance/invoices" element={<Invoices />} />
          <Route path="/finance/categories" element={<FinanceCategories />} />
          <Route path="/finance/profit-and-loss" element={<ProfitAndLoss />} />
          <Route path="/marketing/customers" element={<Customers />} />
          <Route path="/marketing/customer-groups" element={<CustomerGroups />} />
          <Route path="/marketing/loyalty-programs" element={<LoyaltyPrograms />} />
          <Route path="/marketing/exclusions" element={<Exclusions />} />
          <Route path="/marketing/promotions" element={<Promotions />} />
          <Route path="/statistics/sales" element={<StatisticsSales />} />
          <Route path="/statistics/customers" element={<StatisticsCustomers />} />
          <Route path="/statistics/employees" element={<StatisticsEmployees />} />
          <Route path="/statistics/workshops" element={<StatisticsWorkshops />} />
          <Route path="/statistics/tables" element={<StatisticsTables />} />
          <Route path="/statistics/categories" element={<StatisticsCategories />} />
          <Route path="/statistics/products" element={<StatisticsProducts />} />
          <Route path="/statistics/abc" element={<StatisticsAbc />} />
          <Route path="/statistics/checks" element={<StatisticsChecks />} />
          <Route path="/statistics/reviews" element={<StatisticsReviews />} />
          <Route path="/statistics/payments" element={<StatisticsPayments />} />
          <Route path="/statistics/taxes" element={<StatisticsTaxes />} />
          <Route path="/settings/tables" element={<HallMap />} />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  )
}

