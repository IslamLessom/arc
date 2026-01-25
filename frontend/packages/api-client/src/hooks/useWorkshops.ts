import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

interface Workshop {
  id: string
  establishment_id: string
  name: string
  active: boolean
  print_slips?: boolean
  created_at: string
  updated_at: string
}

interface WorkshopsResponse {
  data: Workshop[]
}

interface WorkshopResponse {
  data: Workshop
}

interface CreateWorkshopRequest {
  name: string
  print_slips?: boolean
}

interface UpdateWorkshopRequest {
  name?: string
  print_slips?: boolean
  active?: boolean
}

export function useGetWorkshops() {
  return useQuery({
    queryKey: ['workshops'],
    queryFn: async (): Promise<Workshop[]> => {
      const response = await apiClient.get<WorkshopsResponse>('/workshops')
      return response.data.data
    },
  })
}

export function useGetWorkshop(id: string) {
  return useQuery({
    queryKey: ['workshop', id],
    queryFn: async (): Promise<Workshop> => {
      const response = await apiClient.get<WorkshopResponse>(
        `/workshops/${id}`
      )
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateWorkshop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: CreateWorkshopRequest
    ): Promise<Workshop> => {
      const response = await apiClient.post<WorkshopResponse>(
        '/workshops',
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] })
    },
  })
}

export function useUpdateWorkshop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateWorkshopRequest
    }): Promise<Workshop> => {
      const response = await apiClient.put<WorkshopResponse>(
        `/workshops/${id}`,
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] })
    },
  })
}

export function useDeleteWorkshop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/workshops/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] })
    },
  })
}

export type { Workshop, CreateWorkshopRequest, UpdateWorkshopRequest }

