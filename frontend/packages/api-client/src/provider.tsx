'use client'

import React, { ReactNode, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = useMemo(
    () => new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими
            gcTime: 10 * 60 * 1000, // 10 минут - время хранения в кэше
            refetchOnWindowFocus: false, // Не обновлять при фокусе окна
            refetchOnReconnect: false, // Не обновлять при реконекте
            retry: 1, // Макс 1 повторная попытка
          }
        }
      }),
    []
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

