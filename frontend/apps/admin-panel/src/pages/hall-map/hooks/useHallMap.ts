import { useState, useCallback, useRef, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useGetTables,
  useGetRooms,
  useGetEstablishments,
  useCreateTable,
  useDeleteTable,
  useCreateRoom,
  useCurrentUser,
  apiClient,
  type Table,
} from '@restaurant-pos/api-client'
import type { UseHallMapResult } from '../model/types'

type PendingTableUpdate = {
  tableId: string
  data: {
    position_x?: number
    position_y?: number
    width?: number
    height?: number
    shape?: 'round' | 'square'
  }
}

export const useHallMap = (): UseHallMapResult => {
  const queryClient = useQueryClient()
  const { data: currentUser } = useCurrentUser()
  const establishmentId = currentUser?.establishment_id || null

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [isAddHallModalOpen, setIsAddHallModalOpen] = useState(false)
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false)
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false)

  // Pass roomId to useGetTables for filtering
  const { data: tables = [], isLoading: isLoadingTables, error: tablesError } = useGetTables(
    selectedRoomId || ''
  )
  const { data: rooms = [], isLoading: isLoadingRooms } = useGetRooms(
    establishmentId || ''
  )
  const { data: establishments = [], isLoading: isLoadingEstablishments } = useGetEstablishments()

  const createTableMutation = useCreateTable()
  const deleteTableMutation = useDeleteTable()
  const createRoomMutation = useCreateRoom()

  // Хранилище отложенных изменений
  const pendingUpdatesRef = useRef<Map<string, PendingTableUpdate['data']>>(new Map())
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Функция оптимистичного обновления данных в кэше
  const optimisticallyUpdateTable = useCallback(
    (tableId: string, data: PendingTableUpdate['data']) => {
      if (!selectedRoomId) return

      queryClient.setQueryData<Table[]>(['tables', selectedRoomId], (oldTables) => {
        if (!oldTables) return oldTables
        return oldTables.map((table) =>
          table.id === tableId ? { ...table, ...data } : table
        )
      })
    },
    [selectedRoomId, queryClient]
  )

  // Функция применения всех накопленных изменений на сервер
  const applyPendingUpdates = useCallback(async () => {
    const updates = Array.from(pendingUpdatesRef.current.entries())
    if (updates.length === 0 || !selectedRoomId) return

    const updatesToApply = updates.map(([tableId, data]) => ({ tableId, data }))
    pendingUpdatesRef.current.clear()

    for (const { tableId, data } of updatesToApply) {
      try {
        await apiClient.put(`/rooms/${selectedRoomId}/tables/${tableId}`, data)
      } catch (error) {
        console.error('Failed to apply pending update:', error)
      }
    }
  }, [selectedRoomId])

  // Функция для немедленного сохранения (кнопка "Сохранить")
  const flushPendingUpdates = useCallback(async () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = null
    }
    await applyPendingUpdates()
  }, [applyPendingUpdates])

  // Функция обновления с debounce
  const scheduleUpdate = useCallback(
    (tableId: string, data: PendingTableUpdate['data']) => {
      // Сначала обновляем визуально (оптимистично)
      optimisticallyUpdateTable(tableId, data)

      // Обновляем или добавляем запись в очередь для отправки на сервер
      const existing = pendingUpdatesRef.current.get(tableId) || {}
      pendingUpdatesRef.current.set(tableId, { ...existing, ...data })

      // Очищаем предыдущий timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      // Устанавливаем новый timeout на 3 секунды
      debounceTimeoutRef.current = setTimeout(() => {
        applyPendingUpdates()
        debounceTimeoutRef.current = null
      }, 3000)
    },
    [optimisticallyUpdateTable, applyPendingUpdates]
  )

  // Очистка timeout при размонтировании
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const handleSelectRoom = useCallback((id: string | null) => {
    setSelectedRoomId(id)
  }, [])

  const handleAddHall = useCallback(() => {
    setIsAddHallModalOpen(true)
  }, [])

  const handleAddRoom = useCallback(() => {
    setIsAddRoomModalOpen(true)
  }, [])

  const handleAddTable = useCallback(() => {
    setIsAddTableModalOpen(true)
  }, [])

  const handleCloseAddHallModal = useCallback(() => {
    setIsAddHallModalOpen(false)
  }, [])

  const handleCloseAddRoomModal = useCallback(() => {
    setIsAddRoomModalOpen(false)
  }, [])

  const handleCloseAddTableModal = useCallback(() => {
    setIsAddTableModalOpen(false)
  }, [])

  const handleSaveHall = useCallback(
    async (name: string) => {
      // This is now creating a room, not an establishment
      if (!name.trim() || !establishmentId) return

      try {
        await createRoomMutation.mutateAsync({
          establishmentId,
          data: {
            name: name.trim(),
            floor: 1,
          },
        })
        setIsAddHallModalOpen(false)
      } catch (error) {
        console.error('Failed to create hall:', error)
        throw error
      }
    },
    [establishmentId, createRoomMutation]
  )

  const handleSaveRoom = useCallback(
    async (data: { name: string; description?: string; floor?: number }) => {
      if (!establishmentId || !data.name.trim()) return

      try {
        await createRoomMutation.mutateAsync({
          establishmentId,
          data: {
            name: data.name.trim(),
            description: data.description,
            floor: data.floor,
          },
        })
        setIsAddRoomModalOpen(false)
      } catch (error) {
        console.error('Failed to create room:', error)
        throw error
      }
    },
    [establishmentId, createRoomMutation]
  )

  const handleSaveTable = useCallback(
    async (data: {
      number: number
      name?: string
      capacity: number
      position_x: number
      position_y: number
      rotation?: number
      width?: number
      height?: number
      shape?: 'round' | 'square'
    }) => {
      if (!selectedRoomId) return

      try {
        await createTableMutation.mutateAsync({
          roomId: selectedRoomId,
          data: {
            number: data.number,
            name: data.name,
            capacity: data.capacity,
            position_x: data.position_x,
            position_y: data.position_y,
            rotation: data.rotation,
            width: data.width,
            height: data.height,
            shape: data.shape,
          },
        })
        setIsAddTableModalOpen(false)
      } catch (error) {
        console.error('Failed to create table:', error)
        throw error
      }
    },
    [selectedRoomId, createTableMutation]
  )

  const handleDeleteTable = useCallback(
    async (tableId: string) => {
      if (!selectedRoomId) return

      try {
        await deleteTableMutation.mutateAsync({
          roomId: selectedRoomId,
          tableId,
        })
      } catch (error) {
        console.error('Failed to delete table:', error)
        throw error
      }
    },
    [selectedRoomId, deleteTableMutation]
  )

  const handleUpdateTablePosition = useCallback(
    (tableId: string, x: number, y: number) => {
      if (!selectedRoomId) return
      scheduleUpdate(tableId, { position_x: x, position_y: y })
    },
    [selectedRoomId, scheduleUpdate]
  )

  const handleUpdateTableSize = useCallback(
    (tableId: string, width: number, height: number) => {
      if (!selectedRoomId) return
      scheduleUpdate(tableId, { width, height })
    },
    [selectedRoomId, scheduleUpdate]
  )

  const handleUpdateTableShape = useCallback(
    (tableId: string, shape: 'round' | 'square') => {
      if (!selectedRoomId) return
      scheduleUpdate(tableId, { shape })
    },
    [selectedRoomId, scheduleUpdate]
  )

  return {
    tables,
    rooms,
    establishments,
    selectedRoomId,
    isLoading: isLoadingTables || isLoadingEstablishments || isLoadingRooms,
    error: tablesError as Error | null,
    isAddHallModalOpen,
    isAddRoomModalOpen,
    isAddTableModalOpen,
    handleSelectRoom,
    handleAddHall,
    handleAddRoom,
    handleAddTable,
    handleCloseAddHallModal,
    handleCloseAddRoomModal,
    handleCloseAddTableModal,
    handleSaveHall,
    handleSaveRoom,
    handleSaveTable,
    handleDeleteTable,
    handleUpdateTablePosition,
    handleUpdateTableSize,
    handleUpdateTableShape,
    flushPendingUpdates,
  }
}
