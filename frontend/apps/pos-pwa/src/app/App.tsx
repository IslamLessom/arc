import { Routes, Route } from 'react-router-dom'
import { Providers } from './providers'
import { AuthRoute, PinLoginRoute, HomeRoute, TableSelectionRoute, OrderRoute, PaymentRoute, OrdersArchiveRoute, ReceiptsArchiveRoute } from '@/shared/providers/ProtectedRoute'
import { NotFoundPage } from '@/pages/not-found'

export function App() {
  return (
    <Providers>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/auth" element={<AuthRoute />} />
        <Route path="/pin-login" element={<PinLoginRoute />} />
        <Route path="/table-selection" element={<TableSelectionRoute />} />
        <Route path="/order/:orderId" element={<OrderRoute />} />
        <Route path="/payment/:orderId" element={<PaymentRoute />} />
        <Route path="/orders" element={<OrdersArchiveRoute />} />
        <Route path="/receipts" element={<ReceiptsArchiveRoute />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Providers>
  )
}
