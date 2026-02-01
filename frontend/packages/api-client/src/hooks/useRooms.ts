import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

export interface Room {
  id: string
  establishment_id: string
  name: string
  description?: string
  floor?: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface CreateRoomRequest {
  name: string
  description?: string
  floor?: number
}

export interface UpdateRoomRequest {
  name?: string
  description?: string
  floor?: number
  active?: boolean
}

export function useGetRooms(establishmentId: string) {
  return useQuery({
    queryKey: ['rooms', establishmentId],
    queryFn: async (): Promise<Room[]> => {
      const response = await apiClient.get<Room[]>(
        `/establishments/${establishmentId}/rooms`
      )
      return response.data
    },
    enabled: !!establishmentId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useGetRoom(establishmentId: string, roomId: string) {
  return useQuery({
    queryKey: ['room', establishmentId, roomId],
    queryFn: async (): Promise<Room> => {
      const response = await apiClient.get<Room>(
        `/establishments/${establishmentId}/rooms/${roomId}`
      )
      return response.data
    },
    enabled: !!establishmentId && !!roomId,
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      establishmentId,
      data,
    }: {
      establishmentId: string
      data: CreateRoomRequest
    }): Promise<Room> => {
      const response = await apiClient.post<Room>(
        `/establishments/${establishmentId}/rooms`,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', variables.establishmentId] })
    },
  })
}

export function useUpdateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      establishmentId,
      roomId,
      data,
    }: {
      establishmentId: string
      roomId: string
      data: UpdateRoomRequest
    }): Promise<Room> => {
      const response = await apiClient.put<Room>(
        `/establishments/${establishmentId}/rooms/${roomId}`,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', variables.establishmentId] })
      queryClient.invalidateQueries({ queryKey: ['room', variables.establishmentId, variables.roomId] })
    },
  })
}

export function useDeleteRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      establishmentId,
      roomId,
    }: {
      establishmentId: string
      roomId: string
    }): Promise<void> => {
      await apiClient.delete(`/establishments/${establishmentId}/rooms/${roomId}`)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', variables.establishmentId] })
    },
  })
}
