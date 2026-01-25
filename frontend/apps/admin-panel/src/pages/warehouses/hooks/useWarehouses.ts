import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetWarehouses, useDeleteWarehouse } from '@restaurant-pos/api-client'
import { Warehouse, WarehousesSort } from '../model/types'
import { SortDirection } from '../model/enums'

export const useWarehouses = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<WarehousesSort>({ field: 'id', direction: SortDirection.ASC })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWarehouseId, setEditingWarehouseId] = useState<string | null>(null)

  const { data: apiWarehouses = [], isLoading, error } = useGetWarehouses()

  const deleteWarehouseMutation = useDeleteWarehouse()

  const warehouses = useMemo(() => {
    return apiWarehouses.map(warehouse => ({
      id: warehouse.id,
      name: warehouse.name,
      address: warehouse.address || '',
      amount: 0 // TODO: Calculate from stock
    }))
  }, [apiWarehouses])

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

  const handleExport = () => {
    // Экспорт функциональность
    console.log('Export warehouses')
  }

  const handlePrint = () => {
    // Печать функциональность
    console.log('Print warehouses')
  }

  const handleColumns = () => {
    // Управление столбцами
    console.log('Manage columns')
  }

  return {
    warehouses: filteredAndSortedWarehouses,
    isLoading,
    error,
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
    handleColumns
  }
}

