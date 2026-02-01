import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

interface IngredientFilter {
  search?: string
  category_id?: string
  unit?: 'шт' | 'л' | 'кг'
  active?: boolean
}

export interface Ingredient {
  id: string
  establishment_id: string
  category_id: string
  category?: {
    id: string
    name: string
  }
  name: string
  unit: 'шт' | 'л' | 'кг'
  barcode?: string
  loss_cleaning?: number
  loss_boiling?: number
  loss_frying?: number
  loss_stewing?: number
  loss_baking?: number
  active: boolean
  created_at: string
  updated_at: string
}

interface IngredientsResponse {
  data: Ingredient[]
}

interface IngredientResponse {
  data: Ingredient
}

export interface CreateIngredientRequest {
  name: string
  category_id: string
  unit: 'шт' | 'л' | 'кг'
  barcode?: string
  loss_cleaning?: number
  loss_boiling?: number
  loss_frying?: number
  loss_stewing?: number
  loss_baking?: number
  warehouse_id?: string
  quantity?: number
  price_per_unit?: number
}

export interface UpdateIngredientRequest {
  name?: string
  category_id?: string
  unit?: 'шт' | 'л' | 'кг'
  barcode?: string
  loss_cleaning?: number
  loss_boiling?: number
  loss_frying?: number
  loss_stewing?: number
  loss_baking?: number
}

export function useGetIngredients(filter?: IngredientFilter) {
  return useQuery({
    queryKey: ['ingredients', filter],
    queryFn: async (): Promise<Ingredient[]> => {
      const params = new URLSearchParams()
      if (filter?.search) params.append('search', filter.search)
      if (filter?.category_id) params.append('category_id', filter.category_id)
      if (filter?.unit) params.append('unit', filter.unit)
      if (filter?.active !== undefined) params.append('active', String(filter.active))

      const response = await apiClient.get<IngredientsResponse>(
        `/menu/ingredients?${params.toString()}`
      )
      return response.data.data
    },
  })
}

export function useGetIngredient(id: string) {
  return useQuery({
    queryKey: ['ingredient', id],
    queryFn: async (): Promise<Ingredient> => {
      const response = await apiClient.get<IngredientResponse>(
        `/menu/ingredients/${id}`
      )
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateIngredient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: CreateIngredientRequest
    ): Promise<Ingredient> => {
      const response = await apiClient.post<IngredientResponse>(
        '/menu/ingredients',
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
    },
  })
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateIngredientRequest
    }): Promise<Ingredient> => {
      const response = await apiClient.put<IngredientResponse>(
        `/menu/ingredients/${id}`,
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
    },
  })
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/menu/ingredients/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
    },
  })
}

