import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetSuppliers, useGetSupplies, useDeleteSupplier } from '@restaurant-pos/api-client'
import { SupplierTable, SuppliersSort } from '../model/types'
import { SortDirection } from '../model/enums'

export const useSuppliers = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<SuppliersSort>({ field: 'name', direction: SortDirection.ASC })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null)

  const { data: apiSuppliers = [], isLoading, error } = useGetSuppliers()
  const { data: supplies = [] } = useGetSupplies()
  const deleteSupplierMutation = useDeleteSupplier()

  // Calculate statistics for each supplier
  const suppliers = useMemo(() => {
    return apiSuppliers.map((supplier): SupplierTable => {
      const supplierSupplies = supplies.filter(supply => supply.supplier_id === supplier.id)
      
      const deliveriesCount = supplierSupplies.length
      const deliveriesAmount = supplierSupplies.reduce((sum, supply) => {
        const totalAmount = supply.items?.reduce((itemSum, item) => itemSum + (item.total_amount || 0), 0) || 0
        return sum + totalAmount
      }, 0)
      
      const debtAmount = supplierSupplies.reduce((sum, supply) => {
        if (supply.status !== 'completed') {
          const totalAmount = supply.items?.reduce((itemSum, item) => itemSum + (item.total_amount || 0), 0) || 0
          return sum + totalAmount
        }
        return sum
      }, 0)

      return {
        ...supplier,
        deliveriesCount,
        deliveriesAmount,
        debtAmount
      }
    })
  }, [apiSuppliers, supplies])

  const filteredAndSortedSuppliers = useMemo(() => {
    let filtered = suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.comment || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    filtered.sort((a, b) => {
      const aValue = a[sort.field]
      const bValue = b[sort.field]
      
      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1
      return 0
    })

    return filtered
  }, [suppliers, searchQuery, sort])

  const totalSuppliersCount = filteredAndSortedSuppliers.length
  const totalDeliveriesCount = filteredAndSortedSuppliers.reduce((sum, supplier) => sum + supplier.deliveriesCount, 0)
  const totalDeliveriesAmount = filteredAndSortedSuppliers.reduce((sum, supplier) => sum + supplier.deliveriesAmount, 0)
  const totalDebtAmount = filteredAndSortedSuppliers.reduce((sum, supplier) => sum + supplier.debtAmount, 0)

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleSort = (field: keyof SupplierTable) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === SortDirection.ASC 
        ? SortDirection.DESC 
        : SortDirection.ASC
    }))
  }

  const handleBack = () => {
    navigate('/warehouse/balances')
  }

  const handleEdit = (id: string) => {
    setEditingSupplierId(id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого поставщика?')) {
      try {
        await deleteSupplierMutation.mutateAsync(id)
      } catch (err) {
        console.error('Failed to delete supplier:', err)
      }
    }
  }

  const handleAdd = () => {
    setEditingSupplierId(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingSupplierId(null)
  }

  const handleSuccess = () => {
    handleCloseModal()
  }

  const handleExport = () => {
    // Экспорт функциональность
    console.log('Export suppliers')
  }

  const handlePrint = () => {
    // Печать функциональность
    console.log('Print suppliers')
  }

  const handleColumns = () => {
    // Управление столбцами
    console.log('Manage columns')
  }

  return {
    suppliers: filteredAndSortedSuppliers,
    isLoading,
    error,
    searchQuery,
    sort,
    totalSuppliersCount,
    totalDeliveriesCount,
    totalDeliveriesAmount,
    totalDebtAmount,
    isModalOpen,
    editingSupplierId,
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

