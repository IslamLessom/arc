import { QueryProvider } from '@restaurant-pos/api-client'
import { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <QueryProvider>{children}</QueryProvider>
    </BrowserRouter>
  )
}


