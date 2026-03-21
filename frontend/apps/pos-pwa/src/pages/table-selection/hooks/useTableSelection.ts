import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetRooms, useCurrentUser, useGetTables, useActiveOrders } from '@restaurant-pos/api-client'
import type { Table, Room } from '@restaurant-pos/api-client'
import type { UseTableSelectionResult, TableWithOrder } from '../model/types'

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
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

  // Получаем столы для выбранного зала
  const { data: tables = [], isLoading: isLoadingTables } = useGetTables(selectedRoomId || '')

  // Получаем активные заказы (draft, confirmed, preparing, ready)
  const { data: activeOrders = [], isLoading: isLoadingOrders } = useActiveOrders()

  // Логируем активные заказы для отладки
  useMemo(() => {
    if (activeOrders.length > 0) {
      console.log('🔍 Active orders:', activeOrders)
      activeOrders.forEach(order => {
        console.log(`📋 Order ${order.id}: status=${order.status}, table_id=${order.table_id}, total=${order.total_amount}`)
      })
    }
  }, [activeOrders])

  // Устанавливаем первый зал как выбранный при загрузке
  useMemo(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id)
    }
  }, [rooms, selectedRoomId])

  // Получаем заказ для конкретного стола
  const getOrderForTable = useCallback((tableId: string) => {
    // Ищем неоплаченный заказ по table_id (любой статус кроме paid и cancelled)
    // Проверяем оба варианта: order.table_id и order.table?.id
    const activeOrder = activeOrders.find(order => 
      (order.table_id === tableId || order.table?.id === tableId) && 
      ['draft', 'confirmed', 'preparing', 'ready'].includes(order.status)
    )
    console.log(`🚪 Table ${tableId}: found order`, activeOrder?.id, `status: ${activeOrder?.status}`)
    return activeOrder
  }, [activeOrders])

  const handleTableClick = useCallback(async (table: Table) => {
    // Проверяем, есть ли черновик для этого стола
    const existingOrder = getOrderForTable(table.id)
    
    if (existingOrder) {
      // Если есть черновик, переходим к редактированию заказа
      navigate(`/order/${existingOrder.id}`, {
        state: {
          guestsCount: existingOrder.guests_count || 1,
          tableNumber: table.number,
          tableId: table.id,
          isExistingOrder: true,
        },
      })
    } else {
      // Если черновика нет, показываем dropdown с выбором количества гостей
      setSelectedTable(table)
      setShowGuestsDropdown(true)
      setSelectedGuestsCount(1)

      // Вычисляем позицию dropdown (над столом)
      const x = (table.position_x || 0) + (table.width || 80) / 2
      const y = table.position_y || 0
      setDropdownPosition({ x, y })
    }
  }, [getOrderForTable, navigate])

  const handleCancel = useCallback(() => {
    navigate('/')
  }, [navigate])

  const handleGuestsSelect = useCallback(async (count: number) => {
    setSelectedGuestsCount(count)
    setShowGuestsDropdown(false)

    if (!selectedTable) return

    // Генерируем временный ID для заказа (будет заменен на UUID при оплате)
    const tempOrderId = `table_${selectedTable.id}_${Date.now()}`

    // Переходим к оформлению заказа и передаем количество гостей
    // Заказ на сервере будет создан только при добавлении товаров или оплате
    navigate(`/order/${tempOrderId}`, {
      state: {
        guestsCount: count,
        tableNumber: selectedTable.number,
        tableId: selectedTable.id,
      },
    })
  }, [selectedTable, navigate])

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
    isLoading: isLoading || isLoadingTables || isLoadingOrders,
    error: null,
    handleTableClick,
    handleCancel,
    handleRoomChange,
    isCreatingOrder,
    showGuestsDropdown,
    selectedGuestsCount,
    handleGuestsSelect,
    handleGuestsDropdownClose,
    getDropdownPosition,
    getOrderForTable,
    activeOrders,
  }
}
