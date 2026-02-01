import type { Table, Room } from '@restaurant-pos/api-client'

export interface TableSelectionProps {
  // Пропсы для TableSelection
}

export interface RoomWithTables {
  room: Room
  tables: Table[]
}

export interface UseTableSelectionResult {
  rooms: RoomWithTables[]
  selectedRoomId: string | null
  selectedTable: Table | null
  isLoading: boolean
  error: Error | null
  handleTableClick: (table: Table) => void
  handleCancel: () => void
  handleRoomChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  isCreatingOrder: boolean
  showGuestsDropdown: boolean
  selectedGuestsCount: number
  handleGuestsSelect: (count: number) => void
  handleGuestsDropdownClose: () => void
  getDropdownPosition: () => { x: number; y: number }
}

