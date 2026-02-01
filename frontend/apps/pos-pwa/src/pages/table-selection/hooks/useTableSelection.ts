import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetRooms, useCurrentUser, useCreateOrder, useGetTables } from '@restaurant-pos/api-client'
import type { Table, Room } from '@restaurant-pos/api-client'
import type { UseTableSelectionResult } from '../model/types'

interface DropdownPosition {
  x: number
  y: number
}

export function useTableSelection(): UseTableSelectionResult {
  const navigate = useNavigate()
  const { data: currentUser } = useCurrentUser()
  const establishmentId = currentUser?.establishment_id || ''

  const { data: rooms = [], isLoading } = useGetRooms(establishmentId)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false)
  const [selectedGuestsCount, setSelectedGuestsCount] = useState(1)
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ x: 0, y: 0 })
  const createOrder = useCreateOrder()

  // Получаем столы для выбранного зала
  const { data: tables = [], isLoading: isLoadingTables } = useGetTables(selectedRoomId || '')

  // Устанавливаем первый зал как выбранный при загрузке
  useMemo(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id)
    }
  }, [rooms, selectedRoomId])

  const handleTableClick = useCallback(async (table: Table) => {
    setSelectedTable(table)

    // Показываем dropdown с выбором количества гостей
    setShowGuestsDropdown(true)
    setSelectedGuestsCount(1)

    // Вычисляем позицию dropdown (над столом)
    const x = (table.position_x || 0) + (table.width || 80) / 2
    const y = table.position_y || 0
    setDropdownPosition({ x, y })
  }, [])

  const handleCancel = useCallback(() => {
    navigate('/')
  }, [navigate])

  const handleGuestsSelect = useCallback(async (count: number) => {
    setSelectedGuestsCount(count)
    setShowGuestsDropdown(false)

    if (!establishmentId || !selectedTable) return

    // Создаем заказ с выбранным количеством гостей
    try {
      const order = await createOrder.mutateAsync({
        establishmentId,
        tableNumber: selectedTable.number,
        items: [],
        totalAmount: 0,
        guestsCount: count
      })

      // Переходим к оформлению заказа
      navigate(`/order/${order.id}`)
    } catch (error) {
      console.error('Failed to create order:', error)
    }
  }, [establishmentId, selectedTable, createOrder, navigate])

  const handleGuestsDropdownClose = useCallback(() => {
    setShowGuestsDropdown(false)
    setSelectedTable(null)
  }, [])

  const getDropdownPosition = useCallback(() => {
    return dropdownPosition
  }, [dropdownPosition])

  const handleRoomChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRoomId(e.target.value)
    setSelectedTable(null) // Сбрасываем выбранный стол при смене зала
    setShowGuestsDropdown(false)
  }, [])

  // Преобразуем Room[] в RoomWithTables[]
  const roomsWithTables = useMemo(() => {
    return rooms.map((room: Room) => ({
      room,
      tables: room.id === selectedRoomId ? tables : []
    }))
  }, [rooms, selectedRoomId, tables])

  return {
    rooms: roomsWithTables,
    selectedRoomId,
    selectedTable,
    isLoading: isLoading || isLoadingTables,
    error: null,
    handleTableClick,
    handleCancel,
    handleRoomChange,
    isCreatingOrder: createOrder.isPending,
    showGuestsDropdown,
    selectedGuestsCount,
    handleGuestsSelect,
    handleGuestsDropdownClose,
    getDropdownPosition,
  }
}

