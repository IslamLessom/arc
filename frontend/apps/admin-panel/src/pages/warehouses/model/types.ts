export interface Warehouse {
  id: string
  name: string
  address: string
  amount: number
}

export interface WarehousesFilters {
  searchQuery: string
}

export interface WarehousesSort {
  field: keyof Warehouse
  direction: 'asc' | 'desc'
}

