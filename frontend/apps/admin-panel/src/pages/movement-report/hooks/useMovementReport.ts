import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useGetMovements,
  useGetStock,
  useGetWarehouses,
  useGetCategories,
} from '@restaurant-pos/api-client'
import type {
  MovementReportFilter,
  MovementReportSort,
  MovementReportItem,
  UseMovementReportResult,
} from '../model/types'
import { SortDirection } from '../model/enums'
import { aggregateMovementReport } from '../lib/aggregateReport'

const getDefaultDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 7) // Последние 7 дней по умолчанию

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

export const useMovementReport = (): UseMovementReportResult => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<MovementReportSort>({
    field: 'name',
    direction: SortDirection.ASC,
  })
  const defaultDateRange = getDefaultDateRange()
  const [dateRange, setDateRange] = useState(defaultDateRange)
  const [filters, setFilters] = useState<MovementReportFilter>({
    start_date: defaultDateRange.start,
    end_date: defaultDateRange.end,
  })

  const { data: movements = [], isLoading: isLoadingMovements, error: movementsError } =
    useGetMovements({
      warehouse_id: filters.warehouse_id,
      start_date: filters.start_date,
      end_date: filters.end_date,
    })

  const { data: stock = [], isLoading: isLoadingStock, error: stockError } = useGetStock({
    warehouse_id: filters.warehouse_id,
    type: filters.type,
    category_id: filters.category_id,
    search: searchQuery || undefined,
  })

  const { data: warehouses = [] } = useGetWarehouses()
  const { data: categories = [] } = useGetCategories({
    type: filters.type || undefined,
  })

  const stockItems = useMemo(() => {
    return stock.map((item) => ({
      id: item.ingredient_id || item.product_id || '',
      name: item.ingredient?.name || item.product?.name || 'Неизвестно',
      type: (item.ingredient_id ? 'ingredient' : 'product') as 'ingredient' | 'product',
      unit: item.unit,
      quantity: item.quantity,
      price_per_unit: item.price_per_unit,
    }))
  }, [stock])

  const reportItems = useMemo(() => {
    if (!filters.start_date || !filters.end_date) return []

    const aggregated = aggregateMovementReport(
      movements,
      stockItems,
      filters.start_date,
      filters.end_date
    )

    // Фильтрация по поисковому запросу
    let filtered = aggregated
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = aggregated.filter((item) => item.name.toLowerCase().includes(query))
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue: string | number = a[sort.field]
      let bValue: string | number = b[sort.field]

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue)
        return sort.direction === SortDirection.ASC ? comparison : -comparison
      }

      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1
      return 0
    })

    return filtered
  }, [movements, stockItems, filters.start_date, filters.end_date, searchQuery, sort])

  const totalFinalSum = useMemo(() => {
    return reportItems.reduce((sum, item) => sum + item.finalSum, 0)
  }, [reportItems])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleFilterChange = useCallback((newFilters: Partial<MovementReportFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const handleSort = useCallback((field: keyof MovementReportItem) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === SortDirection.ASC
          ? SortDirection.DESC
          : SortDirection.ASC,
    }))
  }, [])

  const handleBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  const handleExport = useCallback(() => {
    console.log('Export movement report')
  }, [])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleColumns = useCallback(() => {
    console.log('Manage columns')
  }, [])

  const handleDateRangeChange = useCallback(
    (start: string, end: string) => {
      setDateRange({ start, end })
      setFilters((prev) => ({ ...prev, start_date: start, end_date: end }))
    },
    []
  )

  return {
    reportItems,
    isLoading: isLoadingMovements || isLoadingStock,
    error: (movementsError || stockError) as Error | null,
    searchQuery,
    filters,
    sort,
    warehouses: warehouses.map((w) => ({ id: w.id, name: w.name })),
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
    dateRange,
    totalFinalSum,
    handleSearchChange,
    handleFilterChange,
    handleSort,
    handleBack,
    handleExport,
    handlePrint,
    handleColumns,
    handleDateRangeChange,
  }
}

