import type { Inventory } from '@restaurant-pos/api-client'

export interface InventoryListItem {
  id: string
  warehouse: string
  warehouse_id: string
  period_start?: string
  date_time: string
  type: 'full' | 'partial'
  result?: string
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled'
}

export interface InventoriesFilter {
  warehouse_id?: string
  type?: 'full' | 'partial'
  status?: 'draft' | 'in_progress' | 'completed' | 'cancelled'
}

export interface InventoriesSort {
  field: keyof InventoryListItem
  direction: 'asc' | 'desc'
}

export interface UseInventoriesResult {
  inventories: InventoryListItem[]
  isLoading: boolean
  error: Error | null
  searchQuery: string
  isAddModalOpen: boolean
  filters: InventoriesFilter
  sort: InventoriesSort
  warehouses: Array<{ id: string; name: string }>
  totalCount: number
  handleSearchChange: (query: string) => void
  handleFilterChange: (filters: Partial<InventoriesFilter>) => void
  handleSort: (field: keyof InventoryListItem) => void
  handleBack: () => void
  handleAdd: () => void
  handleAddModalClose: () => void
  handleAddSuccess: (inventoryId: string) => void
  handleEdit: (id: string) => void
  handleExport: () => void
  handlePrint: () => void
  handleColumns: () => void
}

