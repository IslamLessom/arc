import type { Service } from '@restaurant-pos/types'

export interface UseHomeResult {
  services: Service[]
  currentServiceId: string
  handleServiceClick: (url: string) => void
}

