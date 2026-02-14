import { useState, useMemo } from 'react'
import { useCustomerGroups as useApiCustomerGroups, type CustomerGroup } from '@restaurant-pos/api-client'
import { CustomerGroupTable, CustomerGroupsSort } from '../model/types'
import { SortDirection } from '../model/enums'

export const useCustomerGroups = () => {
  const { customerGroups: apiGroups, isLoading, error, refetch } = useApiCustomerGroups()
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<CustomerGroupsSort>({ field: 'name', direction: SortDirection.ASC })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)

  // Transform API groups to table format
  const customerGroups: CustomerGroupTable[] = useMemo(() => {
    return apiGroups.map((group, index) => ({
      id: group.id,
      name: group.name,
      description: group.description || '',
      discount_percentage: group.discount_percentage,
      min_orders: group.min_orders || null,
      min_spent: group.min_spent || null,
      customers_count: 0, // TODO: get from API
      number: index + 1,
      created_at: group.created_at,
      updated_at: group.updated_at,
    }))
  }, [apiGroups])

  const filteredAndSortedGroups = useMemo(() => {
    if (!customerGroups || customerGroups.length === 0) return []
    let filtered = customerGroups.filter(group => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        group.name.toLowerCase().includes(searchLower) ||
        (group.description && group.description.toLowerCase().includes(searchLower))

      return matchesSearch
    })

    filtered.sort((a, b) => {
      let aValue: string | number | Date = a[sort.field]
      let bValue: string | number | Date = b[sort.field]

      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1
      return 0
    })

    return filtered.map((group, index) => ({
      ...group,
      number: index + 1
    }))
  }, [customerGroups, searchQuery, sort])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleSort = (field: keyof CustomerGroupTable) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === SortDirection.ASC
        ? SortDirection.DESC
        : SortDirection.ASC
    }))
  }

  const handleBack = () => {
    window.history.back()
  }

  const handleEdit = (id: string) => {
    setEditingGroupId(id)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingGroupId(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingGroupId(null)
  }

  const handleSuccess = () => {
    handleCloseModal()
    refetch()
  }

  const handleExport = () => {
    console.log('Export customer groups')
  }

  const handlePrint = () => {
    console.log('Print customer groups')
  }

  const handleColumns = () => {
    console.log('Manage columns')
  }

  return {
    customerGroups: filteredAndSortedGroups,
    totalGroupsCount: customerGroups.length,
    isLoading,
    error,
    searchQuery,
    sort,
    isModalOpen,
    editingGroupId,
    handleSearchChange,
    handleSort,
    handleBack,
    handleEdit,
    handleAdd,
    handleCloseModal,
    handleSuccess,
    handleExport,
    handlePrint,
    handleColumns,
  }
}
