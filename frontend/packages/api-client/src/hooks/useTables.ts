import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { Room } from './useRooms'

export interface Table {
  id: string
  room_id: string
  room?: Room
  number: number
  name?: string
  capacity: number
  position_x: number
  position_y: number
  rotation: number
  width: number
  height: number
  shape: 'round' | 'square'
  status: 'available' | 'occupied' | 'reserved'
  active: boolean
  created_at: string
  updated_at: string
}

export interface CreateTableRequest {
  number: number
  name?: string
  capacity: number
  position_x?: number
  position_y?: number
  rotation?: number
  width?: number
  height?: number
  shape?: 'round' | 'square'
}

export interface UpdateTableRequest {
  number?: number
  name?: string
  capacity?: number
  position_x?: number
  position_y?: number
  rotation?: number
  width?: number
  height?: number
  shape?: 'round' | 'square'
  status?: 'available' | 'occupied' | 'reserved'
  active?: boolean
}

export function useGetTables(roomId: string) {
  return useQuery({
    queryKey: ['tables', roomId],
    queryFn: async (): Promise<Table[]> => {
      const response = await apiClient.get<Table[]>(
        `/rooms/${roomId}/tables`
      )
      return response.data
    },
    enabled: !!roomId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useGetTable(roomId: string, tableId: string) {
  return useQuery({
    queryKey: ['table', roomId, tableId],
    queryFn: async (): Promise<Table> => {
      const response = await apiClient.get<Table>(
        `/rooms/${roomId}/tables/${tableId}`
      )
      return response.data
    },
    enabled: !!roomId && !!tableId,
  })
}

export function useCreateTable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      roomId,
      data,
    }: {
      roomId: string
      data: CreateTableRequest
    }): Promise<Table> => {
      const response = await apiClient.post<Table>(
        `/rooms/${roomId}/tables`,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tables', variables.roomId] })
    },
  })
}

export function useUpdateTable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      roomId,
      tableId,
      data,
    }: {
      roomId: string
      tableId: string
      data: UpdateTableRequest
    }): Promise<Table> => {
      const response = await apiClient.put<Table>(
        `/rooms/${roomId}/tables/${tableId}`,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tables', variables.roomId] })
      queryClient.invalidateQueries({ queryKey: ['table', variables.roomId, variables.tableId] })
    },
  })
}

export function useDeleteTable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      roomId,
      tableId,
    }: {
      roomId: string
      tableId: string
    }): Promise<void> => {
      await apiClient.delete(`/rooms/${roomId}/tables/${tableId}`)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tables', variables.roomId] })
    },
  })
}
