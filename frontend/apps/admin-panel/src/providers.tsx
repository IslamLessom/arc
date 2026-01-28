import { QueryProvider } from '@restaurant-pos/api-client'
import { ThemeProvider, AntdProvider } from '@restaurant-pos/ui'
import { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <QueryProvider>
        <ThemeProvider>
          <AntdProvider>{children}</AntdProvider>
        </ThemeProvider>
      </QueryProvider>
    </BrowserRouter>
  )
}
