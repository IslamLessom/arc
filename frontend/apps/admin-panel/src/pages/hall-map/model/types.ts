export interface HallMapTable {
  id: string
  room_id: string
  number: number
  name?: string
  capacity: number
  position_x: number
  position_y: number
  rotation: number
  width?: number
  height?: number
  shape?: 'round' | 'square'
  status: 'available' | 'occupied' | 'reserved'
  active: boolean
}

export interface HallMapEstablishment {
  id: string
  name: string
}

export interface HallMapRoom {
  id: string
  establishment_id: string
  name: string
  description?: string
  floor?: number
  active: boolean
}

export interface UseHallMapResult {
  tables: HallMapTable[]
  rooms: HallMapRoom[]
  establishments: HallMapEstablishment[]
  selectedRoomId: string | null
  isLoading: boolean
  error: Error | null
  isAddHallModalOpen: boolean
  isAddTableModalOpen: boolean
  isAddRoomModalOpen: boolean
  handleSelectRoom: (id: string | null) => void
  handleAddHall: () => void
  handleAddRoom: () => void
  handleAddTable: () => void
  handleCloseAddHallModal: () => void
  handleCloseAddRoomModal: () => void
  handleCloseAddTableModal: () => void
  handleSaveHall: (name: string) => Promise<void>
  handleSaveRoom: (data: { name: string; description?: string; floor?: number }) => Promise<void>
  handleSaveTable: (data: {
    number: number
    name?: string
    capacity: number
    position_x: number
    position_y: number
    rotation?: number
    width?: number
    height?: number
    shape?: 'round' | 'square'
  }) => Promise<void>
  handleDeleteTable: (tableId: string) => Promise<void>
  handleUpdateTablePosition: (tableId: string, x: number, y: number) => void
  handleUpdateTableSize: (tableId: string, width: number, height: number) => void
  handleUpdateTableShape: (tableId: string, shape: 'round' | 'square') => void
  flushPendingUpdates: () => Promise<void>
}

