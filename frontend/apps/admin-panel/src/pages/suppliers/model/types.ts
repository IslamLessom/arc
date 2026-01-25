import { Supplier } from '@restaurant-pos/api-client'

export interface SupplierTable extends Supplier {
  deliveriesCount: number
  deliveriesAmount: number
  debtAmount: number
}

export interface SuppliersFilters {
  searchQuery: string
}

export interface SuppliersSort {
  field: keyof SupplierTable
  direction: 'asc' | 'desc'
}

