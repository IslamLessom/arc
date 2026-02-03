import type { WriteOff } from '@restaurant-pos/api-client'
import { SortDirection } from './enums'

export interface WriteOffTable extends WriteOff {
  goodsNames: string
  totalAmount: number
}

export interface WriteOffsFilters {
  searchQuery: string
  warehouseId?: string
  categoryId?: string
  reason?: string
}

export interface WriteOffsSort {
  field: keyof WriteOffTable
  direction: SortDirection
}

export interface UseWriteOffsResult {
  writeOffs: WriteOffTable[]
  isLoading: boolean
  error: Error | null
  searchQuery: string
  filters: WriteOffsFilters
  warehouses: Array<{ id: string; name: string }>
  handleSearchChange: (query: string) => void
  handleFilterChange: (filters: Partial<WriteOffsFilters>) => void
  handleSort: (field: keyof WriteOffTable) => void
  handleBack: () => void
  handleAdd: () => void
  handleExport: () => void
  handlePrint: () => void
  handleColumns: () => void
  sort: WriteOffsSort
}

// Типы для причин списаний
export enum WriteOffReasonPnlBlock {
  COST = 'cost', // Себестоимость
  EXPENSES = 'expenses', // Расходы
}

export interface WriteOffReason {
  id: string
  name: string
  pnlBlock: WriteOffReasonPnlBlock
  writeOffCount: number
  totalCost: number
}

export interface WriteOffReasonFormData {
  name: string
  pnlBlock: WriteOffReasonPnlBlock
}

export interface UseWriteOffReasonsResult {
  reasons: WriteOffReason[]
  isLoading: boolean
  error: Error | null
  searchQuery: string
  handleSearchChange: (query: string) => void
  handleAdd: (data: WriteOffReasonFormData) => void
  handleEdit: (id: string, data: WriteOffReasonFormData) => void
  handleDelete: (id: string) => void
  handleExport: () => void
  handlePrint: () => void
  handleColumns: () => void
}
