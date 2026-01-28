import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useGetInventories,
  useGetWarehouses,
  type Inventory,
} from '@restaurant-pos/api-client'
import type {
  InventoryListItem,
  InventoriesFilter,
  InventoriesSort,
  UseInventoriesResult,
} from '../model/types'
import { SortDirection } from '../model/enums'

export const useInventories = (): UseInventoriesResult => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [sort, setSort] = useState<InventoriesSort>({
    field: 'date_time',
    direction: SortDirection.DESC,
  })
  const [filters, setFilters] = useState<InventoriesFilter>({})

  const { data: apiInventories = [], isLoading, error } = useGetInventories(filters)
  const { data: warehouses = [] } = useGetWarehouses()

  const inventories = useMemo(() => {
    return apiInventories.map((inventory: Inventory): InventoryListItem => {
      const dateTime = inventory.actual_date || inventory.scheduled_date || inventory.created_at
      const formattedDate = dateTime
        ? new Date(dateTime).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '—'

      // Вычисляем результат (разница в деньгах)
      let result = '—'
      if (inventory.items && inventory.items.length > 0) {
        const totalDifference = inventory.items.reduce(
          (sum, item) => sum + (item.difference_value || 0),
          0
        )
        if (totalDifference !== 0) {
          result = `${totalDifference > 0 ? '+' : ''}${totalDifference.toFixed(2)} ₽`
        }
      }

      return {
        id: inventory.id,
        warehouse: inventory.warehouse?.name || 'Неизвестный склад',
        warehouse_id: inventory.warehouse_id,
        period_start: inventory.scheduled_date,
        date_time: formattedDate,
        type: inventory.type,
        result,
        status: inventory.status,
      }
    })
  }, [apiInventories])

  const filteredAndSortedInventories = useMemo(() => {
    let filtered = inventories

    // Фильтрация по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (inventory) =>
          inventory.warehouse.toLowerCase().includes(query) ||
          inventory.date_time.toLowerCase().includes(query)
      )
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
  }, [inventories, searchQuery, sort])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleFilterChange = useCallback((newFilters: Partial<InventoriesFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const handleSort = useCallback((field: keyof InventoryListItem) => {
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

  const handleAdd = useCallback(() => {
    setIsAddModalOpen(true)
  }, [])

  const handleAddModalClose = useCallback(() => {
    setIsAddModalOpen(false)
  }, [])

  const handleAddSuccess = useCallback(
    (inventoryId: string) => {
      setIsAddModalOpen(false)
      navigate(`/warehouse/inventories/${inventoryId}`)
    },
    [navigate]
  )

  const handleEdit = useCallback(
    (id: string) => {
      navigate(`/warehouse/inventories/${id}`)
    },
    [navigate]
  )

  const handleExport = useCallback(() => {
    console.log('Export inventories')
  }, [])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleColumns = useCallback(() => {
    console.log('Manage columns')
  }, [])

  return {
    inventories: filteredAndSortedInventories,
    isLoading,
    error: error as Error | null,
    searchQuery,
    isAddModalOpen,
    filters,
    sort,
    warehouses: warehouses.map((w) => ({ id: w.id, name: w.name })),
    totalCount: filteredAndSortedInventories.length,
    handleSearchChange,
    handleFilterChange,
    handleSort,
    handleBack,
    handleAdd,
    handleAddModalClose,
    handleAddSuccess,
    handleEdit,
    handleExport,
    handlePrint,
    handleColumns,
  }
}

