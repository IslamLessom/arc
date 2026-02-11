import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

export interface ProductFilter {
  category_id?: string
  workshop_id?: string
  search?: string
  active?: boolean
}

export interface Product {
  id: string
  establishment_id: string
  category_id: string
  category?: {
    id: string
    name: string
  }
  warehouse_id: string
  workshop_id?: string
  workshop?: {
    id: string
    name: string
  }
  name: string
  description: string
  cover_image: string
  is_weighted: boolean
  exclude_from_discounts: boolean
  has_modifications: boolean
  barcode: string
  cost_price: number
  markup: number
  price: number
  active: boolean
  created_at: string
  updated_at: string
}

interface ProductsResponse {
  data: Product[]
}

interface SingleProductResponse {
  data: Product
}

export interface CreateProductRequest {
  name: string
  category_id: string
  workshop_id?: string
  description?: string
  cover_image?: string
  is_weighted?: boolean
  exclude_from_discounts?: boolean
  has_modifications?: boolean
  barcode?: string
  cost_price?: number
  markup?: number
  price?: number
  active?: boolean
  warehouse_id?: string
}

export interface UpdateProductRequest {
  name?: string
  category_id?: string
  workshop_id?: string
  description?: string
  cover_image?: string
  is_weighted?: boolean
  exclude_from_discounts?: boolean
  has_modifications?: boolean
  barcode?: string
  cost_price?: number
  markup?: number
  price?: number
  active?: boolean
}

export function useGetProducts(filter?: ProductFilter) {
  return useQuery({
    queryKey: ['products', filter],
    queryFn: async (): Promise<Product[]> => {
      const params = new URLSearchParams()
      if (filter?.category_id) params.append('category_id', filter.category_id)
      if (filter?.workshop_id) params.append('workshop_id', filter.workshop_id)
      if (filter?.search) params.append('search', filter.search)
      if (filter?.active !== undefined) params.append('active', filter.active.toString())

      const response = await apiClient.get<ProductsResponse>(
        `/menu/products?${params.toString()}`
      )
      return response.data.data
    },
  })
}

export function useGetProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async (): Promise<Product> => {
      const response = await apiClient.get<SingleProductResponse>(`/menu/products/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateProductRequest): Promise<Product> => {
      const response = await apiClient.post<SingleProductResponse>('/menu/products', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateProductRequest
    }): Promise<Product> => {
      const response = await apiClient.put<SingleProductResponse>(`/menu/products/${id}`, data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/menu/products/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

