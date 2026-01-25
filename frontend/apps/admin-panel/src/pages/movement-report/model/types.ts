export interface MovementReportItem {
  id: string
  name: string
  type: 'ingredient' | 'product'
  unit: string
  initialBalance: number
  initialAverageCost: number
  initialSum: number
  receipts: number
  expenses: number
  finalBalance: number
  finalAverageCost: number
  finalSum: number
}

export interface MovementReportFilter {
  warehouse_id?: string
  establishment_id?: string
  type?: 'ingredient' | 'product'
  category_id?: string
  start_date?: string
  end_date?: string
  search?: string
}

export interface MovementReportSort {
  field: keyof MovementReportItem
  direction: 'asc' | 'desc'
}

export interface UseMovementReportResult {
  reportItems: MovementReportItem[]
  isLoading: boolean
  error: Error | null
  searchQuery: string
  filters: MovementReportFilter
  sort: MovementReportSort
  warehouses: Array<{ id: string; name: string }>
  categories: Array<{ id: string; name: string }>
  dateRange: { start: string; end: string }
  totalFinalSum: number
  handleSearchChange: (query: string) => void
  handleFilterChange: (filters: Partial<MovementReportFilter>) => void
  handleSort: (field: keyof MovementReportItem) => void
  handleBack: () => void
  handleExport: () => void
  handlePrint: () => void
  handleColumns: () => void
  handleDateRangeChange: (start: string, end: string) => void
}

