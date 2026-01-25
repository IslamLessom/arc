import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

interface StockFilter {
  warehouse_id?: string
  search?: string
  type?: 'ingredient' | 'product'
  category_id?: string
}

interface Category {
  id: string
  name: string
}

interface Ingredient {
  id: string
  name: string
  category: Category
}

interface Product {
  id: string
  name: string
  category: Category
}

interface Warehouse {
  id: string
  name: string
}

interface Stock {
  id: string
  warehouse_id: string
  warehouse: Warehouse
  ingredient_id: string | null
  ingredient: Ingredient | null
  product_id: string | null
  product: Product | null
  quantity: number
  unit: string
  price_per_unit: number
  limit: number
  updated_at: string
}

interface StockResponse {
  data: Stock[]
}

export function useGetStock(filter?: StockFilter) {
  return useQuery({
    queryKey: ['stock', filter],
    queryFn: async (): Promise<Stock[]> => {
      const params = new URLSearchParams()
      if (filter?.warehouse_id) params.append('warehouse_id', filter.warehouse_id)
      if (filter?.search) params.append('search', filter.search)
      if (filter?.type) params.append('type', filter.type)
      if (filter?.category_id) params.append('category_id', filter.category_id)

      const response = await apiClient.get<StockResponse>(
        `/warehouse/stock?${params.toString()}`
      )
      return response.data.data
    },
  })
}

export function useUpdateStockLimit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      limit,
    }: {
      id: string
      limit: number
    }): Promise<void> => {
      await apiClient.put(`/warehouse/stock/${id}/limit`, { limit })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] })
    },
  })
}

