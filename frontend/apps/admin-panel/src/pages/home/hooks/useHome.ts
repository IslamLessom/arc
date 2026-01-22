import { useCallback } from 'react'
import { SERVICES } from '@restaurant-pos/types'
import type { UseHomeResult } from '../model/types'

const CURRENT_SERVICE_ID = 'admin-panel'

export function useHome(): UseHomeResult {
  const services = SERVICES

  const handleServiceClick = useCallback((url: string) => {
    window.location.href = url
  }, [])

  return {
    services,
    currentServiceId: CURRENT_SERVICE_ID,
    handleServiceClick,
  }
}


