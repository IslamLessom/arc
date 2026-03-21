import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetWarehouses, useDeleteWarehouse, useGetStock } from '@restaurant-pos/api-client'
import { Warehouse, WarehousesSort } from '../model/types'
import { SortDirection } from '../model/enums'
import { exportToExcel, printTable, useColumnVisibility } from '@restaurant-pos/ui'
import { getWarehousesTableColumns } from '../lib/constants'

export const useWarehouses = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<WarehousesSort>({ field: 'id', direction: SortDirection.ASC })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false)
  const [editingWarehouseId, setEditingWarehouseId] = useState<string | null>(null)

  const { data: apiWarehouses = [], isLoading: isWarehousesLoading, error: warehousesError } = useGetWarehouses()
  const { data: stock = [], isLoading: isStockLoading, error: stockError } = useGetStock()

  const deleteWarehouseMutation = useDeleteWarehouse()

  const warehouseAmountsMap = useMemo(() => {
    return stock.reduce<Record<string, number>>((acc, stockItem) => {
      const stockValue = (stockItem.quantity || 0) * (stockItem.price_per_unit || 0)
      acc[stockItem.warehouse_id] = (acc[stockItem.warehouse_id] || 0) + stockValue
      return acc
    }, {})
  }, [stock])

  const warehouses = useMemo(() => {
    return apiWarehouses.map(warehouse => ({
      id: warehouse.id,
      name: warehouse.name,
      address: warehouse.address || '',
      amount: warehouseAmountsMap[warehouse.id] || 0
    }))
  }, [apiWarehouses, warehouseAmountsMap])

  const filteredAndSortedWarehouses = useMemo(() => {
    let filtered = warehouses.filter(warehouse =>
      warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.address.toLowerCase().includes(searchQuery.toLowerCase())
    )

    filtered.sort((a, b) => {
      const aValue = a[sort.field]
      const bValue = b[sort.field]
      
      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1
      return 0
    })

    return filtered
  }, [warehouses, searchQuery, sort])

  const totalWarehousesCount = filteredAndSortedWarehouses.length
  const totalAmount = filteredAndSortedWarehouses.reduce((sum, warehouse) => sum + warehouse.amount, 0)

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleSort = (field: keyof Warehouse) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === SortDirection.ASC 
        ? SortDirection.DESC 
        : SortDirection.ASC
    }))
  }

  const handleBack = () => {
    navigate('/warehouse')
  }

  const handleEdit = (id: string) => {
    setEditingWarehouseId(id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот склад?')) {
      try {
        await deleteWarehouseMutation.mutateAsync(id)
      } catch (err) {
        console.error('Failed to delete warehouse:', err)
      }
    }
  }

  const handleAdd = () => {
    setEditingWarehouseId(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingWarehouseId(null)
  }

  const handleSuccess = () => {
    handleCloseModal()
  }

  const allColumns = useMemo(() => getWarehousesTableColumns({ onEdit: () => {}, onDelete: () => {} }), [])

  const { visibleColumns, columnInfo, toggleColumn, showAllColumns, hideAllColumns, resetColumnVisibility } = 
    useColumnVisibility(allColumns, { storageKey: 'admin-panel-warehouses-columns' })

  const handleExport = () => {
    exportToExcel(filteredAndSortedWarehouses, visibleColumns, 'warehouses.xlsx')
  }

  const handlePrint = () => {
    printTable(filteredAndSortedWarehouses, visibleColumns, 'Склады', { showDate: true, orientation: 'portrait' })
  }

  const handleColumns = () => { setIsColumnModalOpen(true) }
  const handleCloseColumnModal = () => { setIsColumnModalOpen(false) }

  return {
    warehouses: filteredAndSortedWarehouses,
    isLoading: isWarehousesLoading || isStockLoading,
    error: warehousesError || stockError,
    searchQuery,
    sort,
    totalWarehousesCount,
    totalAmount,
    isModalOpen,
    editingWarehouseId,
    handleSearchChange,
    handleSort,
    handleBack,
    handleEdit,
    handleDelete,
    handleAdd,
    handleCloseModal,
    handleSuccess,
    handleExport,
    handlePrint,
    handleColumns,
    isColumnModalOpen,
    handleCloseColumnModal,
    visibleColumns,
    columnInfo,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    resetColumnVisibility,
  }
}

