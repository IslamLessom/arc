import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

interface TechnicalCardFilter {
  search?: string
  category_id?: string
  workshop_id?: string
  active?: boolean
}

export interface ModifierOption {
  name: string
  price: number
}

export interface ModifierSet {
  name: string
  selection_type: 'single' | 'multiple'
  options: ModifierOption[]
}

export interface Category {
  id: string
  establishment_id: string
  name: string
  type: string
  created_at: string
  updated_at: string
}

export interface Workshop {
  id: string
  establishment_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface TechCardIngredient {
  id: string
  ingredient_id: string
  ingredient?: {
    id: string
    name: string
    category_id: string
    unit: string
    active: boolean
    created_at: string
    updated_at: string
  }
  quantity: number
  unit: string
}

export interface TechnicalCard {
  id: string
  establishment_id: string
  establishment?: {
    id: string
    name: string
  }
  category_id: string
  category?: Category
  workshop_id?: string
  workshop?: Workshop
  warehouse_id?: string
  name: string
  description?: string
  cover_image?: string
  is_weighted: boolean
  exclude_from_discounts: boolean
  cost_price: number
  markup: number
  price: number
  active: boolean
  ingredients?: TechCardIngredient[]
  modifier_sets?: ModifierSet[]
  created_at: string
  updated_at: string
}

interface TechnicalCardsResponse {
  data: TechnicalCard[]
}

interface TechnicalCardResponse {
  data: TechnicalCard
}

interface TechCardIngredientRequest {
  ingredient_id: string
  quantity: number
  unit: string
}

export interface CreateTechnicalCardRequest {
  name: string
  category_id: string
  workshop_id?: string
  description?: string
  cover_image?: string
  is_weighted: boolean
  cost_price?: number
  markup?: number
  warehouse_id?: string
  ingredients?: TechCardIngredientRequest[]
  modifier_sets?: ModifierSet[]
}

export interface UpdateTechnicalCardRequest {
  name?: string
  category_id?: string
  workshop_id?: string
  description?: string
  cover_image?: string
  is_weighted?: boolean
  cost_price?: number
  markup?: number
  warehouse_id?: string
  ingredients?: TechCardIngredientRequest[]
  modifier_sets?: ModifierSet[]
}

export function useGetTechnicalCards(filter?: TechnicalCardFilter) {
  return useQuery({
    queryKey: ['technical-cards', filter],
    queryFn: async (): Promise<TechnicalCard[]> => {
      const params = new URLSearchParams()
      if (filter?.search) params.append('search', filter.search)
      if (filter?.category_id) params.append('category_id', filter.category_id)
      if (filter?.workshop_id) params.append('workshop_id', filter.workshop_id)
      if (filter?.active !== undefined) params.append('active', String(filter.active))

      const response = await apiClient.get<TechnicalCardsResponse>(
        `/menu/tech-cards?${params.toString()}`
      )
      return response.data.data
    },
  })
}

export function useGetTechnicalCard(id: string) {
  return useQuery({
    queryKey: ['technical-card', id],
    queryFn: async (): Promise<TechnicalCard> => {
      const response = await apiClient.get<TechnicalCardResponse>(
        `/menu/tech-cards/${id}`
      )
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateTechnicalCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: CreateTechnicalCardRequest
    ): Promise<TechnicalCard> => {
      const response = await apiClient.post<TechnicalCardResponse>(
        '/menu/tech-cards',
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-cards'] })
    },
  })
}

export function useUpdateTechnicalCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateTechnicalCardRequest
    }): Promise<TechnicalCard> => {
      const response = await apiClient.put<TechnicalCardResponse>(
        `/menu/tech-cards/${id}`,
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-cards'] })
    },
  })
}

export function useDeleteTechnicalCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/menu/tech-cards/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-cards'] })
    },
  })
}