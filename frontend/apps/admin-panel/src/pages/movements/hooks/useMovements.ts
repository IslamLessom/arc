import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetMovements, useGetWarehouses, type MovementFilter } from '@restaurant-pos/api-client'
import type { MovementTable, MovementsSort, UseMovementsResult } from '../model/types'
import { SortDirection } from '../model/enums'

export const useMovements = (): UseMovementsResult => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<MovementsSort>({ field: 'date_time', direction: SortDirection.DESC })
  const [filters, setFilters] = useState<MovementFilter>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMovementId, setEditingMovementId] = useState<string | undefined>(undefined)

  const { data: apiMovements = [], isLoading, error } = useGetMovements(filters)
  const { data: warehouses = [] } = useGetWarehouses()

  const movements = useMemo(() => {
    return apiMovements.map(
      (movement): MovementTable => {
        const totalAmount =
          movement.items?.reduce((sum, item) => sum + (item.price_per_unit || 0) * (item.quantity || 0), 0) || 0

        const warehousesDisplay = movement.warehouse_name || '-'

        return {
          ...movement,
          number: 0,
          totalAmount,
          warehousesDisplay,
        }
      }
    )
  }, [apiMovements])

  const filteredAndSortedMovements = useMemo(() => {
    let filtered = movements.filter((movement) => {
      const matchesSearch =
        movement.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movement.warehouse_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movement.items?.some((item) => {
          const itemName = item.ingredient_id || item.product_id
          return itemName?.toLowerCase().includes(searchQuery.toLowerCase())
        })

      return matchesSearch
    })

    filtered.sort((a, b) => {
      let aValue: string | number | Date = a[sort.field]
      let bValue: string | number | Date = b[sort.field]

      if (sort.field === 'date_time') {
        aValue = new Date(a.date_time).getTime()
        bValue = new Date(b.date_time).getTime()
      }

      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1
      return 0
    })

    return filtered.map((movement, index) => ({
      ...movement,
      number: index + 1,
    }))
  }, [movements, searchQuery, sort])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleFilterChange = useCallback((newFilters: Partial<MovementFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const handleSort = useCallback((field: keyof MovementTable) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC,
    }))
  }, [])

  const handleBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  const handleEdit = useCallback((id: string) => {
    setEditingMovementId(id)
    setIsModalOpen(true)
  }, [])

  const handleAdd = useCallback(() => {
    setEditingMovementId(undefined)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingMovementId(undefined)
  }, [])

  const handleSuccess = useCallback(() => {
    setIsModalOpen(false)
    setEditingMovementId(undefined)
  }, [])

  const handleExport = useCallback(() => {
    console.log('Export movements')
  }, [])

  const handlePrint = useCallback(() => {
    console.log('Print movements')
  }, [])

  const handleColumns = useCallback(() => {
    console.log('Manage columns')
  }, [])

  return {
    movements: filteredAndSortedMovements,
    isLoading,
    error: error as Error | null,
    searchQuery,
    filters,
    warehouses: warehouses.map((w) => ({ id: w.id, name: w.name })),
    handleSearchChange,
    handleFilterChange,
    handleSort,
    handleBack,
    handleEdit,
    handleAdd,
    handleExport,
    handlePrint,
    handleColumns,
    sort,
    isModalOpen,
    editingMovementId,
    handleCloseModal,
    handleSuccess,
  }
}

