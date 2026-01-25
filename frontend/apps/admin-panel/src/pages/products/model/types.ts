import type { Product, ProductFilter } from '@restaurant-pos/api-client'
import type { TableColumn } from '@restaurant-pos/ui'

export interface ProductTable {
  id: string
  name: string
  category: string
  costPrice: number
  price: number
  markup: number | null
  coverImage?: string
}

export interface ProductsSort {
  field: keyof ProductTable
  direction: 'asc' | 'desc'
}

export interface ProductsTableProps {
  onEdit: (id: string) => void
}

export type ProductsTableColumns = TableColumn<ProductTable>[]

export interface UseProductsResult {
  products: ProductTable[]
  isLoading: boolean
  error: Error | null
  searchQuery: string
  filters: ProductFilter
  categories: Array<{ id: string; name: string }>
  workshops: Array<{ id: string; name: string }>
  handleSearchChange: (query: string) => void
  handleFilterChange: (filters: Partial<ProductFilter>) => void
  handleSort: (field: keyof ProductTable) => void
  handleBack: () => void
  handleEdit: (id: string) => void
  handleDelete: (id: string) => void
  handleAdd: () => void
  handleExport: () => void
  handlePrint: () => void
  handleColumns: () => void
  handleCart: () => void
  sort: ProductsSort
  isModalOpen: boolean
  editingProductId?: string
  handleCloseModal: () => void
  handleSuccess: () => void
}

// Render cell props interfaces
export interface RenderNameCellProps {
  record: ProductTable
}

export interface RenderPriceCellProps {
  value: number
}

export interface RenderCostPriceCellProps {
  value: number
}

export interface RenderMarkupCellProps {
  value: number | null
}

export interface RenderEditCellProps {
  record: ProductTable
  onEdit: (id: string) => void
}

