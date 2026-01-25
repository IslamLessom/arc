import type { Movement, MovementFilter } from '@restaurant-pos/api-client'
import type { TableColumn } from '@restaurant-pos/ui'

export interface MovementTable extends Movement {
  number: number
  totalAmount: number
  employeeName?: string
  warehousesDisplay: string
}

export interface MovementsSort {
  field: keyof MovementTable
  direction: 'asc' | 'desc'
}

export interface MovementsTableProps {
  onEdit?: (id: string) => void
}

export type MovementsTableColumns = TableColumn<MovementTable>[]

export interface UseMovementsResult {
  movements: MovementTable[]
  isLoading: boolean
  error: Error | null
  searchQuery: string
  filters: MovementFilter
  warehouses: Array<{ id: string; name: string }>
  handleSearchChange: (query: string) => void
  handleFilterChange: (filters: Partial<MovementFilter>) => void
  handleSort: (field: keyof MovementTable) => void
  handleBack: () => void
  handleEdit?: (id: string) => void
  handleAdd: () => void
  handleExport: () => void
  handlePrint: () => void
  handleColumns: () => void
  sort: MovementsSort
  isModalOpen: boolean
  editingMovementId?: string
  handleCloseModal: () => void
  handleSuccess: () => void
}

