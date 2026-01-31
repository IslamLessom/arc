import { ReactNode } from 'react'
import { QueryProvider } from '@restaurant-pos/api-client'
import { ThemeProvider } from '@restaurant-pos/ui'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryProvider>
  )
}
