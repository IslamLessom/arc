import { useState, useCallback } from 'react'
import {
  useGetStock,
  useUpdateStockLimit,
  type StockFilter,
} from '@restaurant-pos/api-client'
import type { UseBalancesResult } from '../model/types'

export function useBalances(): UseBalancesResult {
  const [filters, setFilters] = useState<StockFilter>({})

  const { data: stock, isLoading, error } = useGetStock(filters)
  const { mutateAsync: updateLimit, isPending: isUpdatingLimit } =
    useUpdateStockLimit()

  const handleFilterChange = useCallback((newFilters: Partial<StockFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const handleUpdateLimit = useCallback(
    async (id: string, limit: number) => {
      await updateLimit({ id, limit })
    },
    [updateLimit]
  )

  return {
    stock,
    isLoading,
    error: error as Error | null,
    filters,
    handleFilterChange,
    handleUpdateLimit,
    isUpdatingLimit,
  }
}

