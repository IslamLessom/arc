'use client'

import { QueryProvider } from '@restaurant-pos/api-client'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>
}

