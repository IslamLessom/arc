import type { Stock, StockFilter } from '@restaurant-pos/api-client'

export interface UseBalancesResult {
  stock: Stock[] | undefined
  isLoading: boolean
  error: Error | null
  filters: StockFilter
  handleFilterChange: (filters: Partial<StockFilter>) => void
  handleUpdateLimit: (id: string, limit: number) => Promise<void>
  isUpdatingLimit: boolean
}

