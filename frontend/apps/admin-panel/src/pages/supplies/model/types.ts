import { Supply } from '@restaurant-pos/api-client'

export interface SupplyTable extends Supply {
  number: number
  totalAmount: number
  debt: number
  goodsNames: string
}

export interface SuppliesFilters {
  searchQuery: string
  supplierId?: string
  warehouseId?: string
}

export interface SuppliesSort {
  field: keyof SupplyTable
  direction: 'asc' | 'desc'
}

