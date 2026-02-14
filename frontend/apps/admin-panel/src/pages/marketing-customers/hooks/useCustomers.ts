import { useState, useMemo } from 'react'
import { useCustomers, type Customer } from '@restaurant-pos/api-client'
import { CustomerTable, CustomersSort } from '../model/types'
import { SortDirection } from '../model/enums'

export const useCustomers = () => {
  const { customers: apiCustomers, isLoading, error, refetch } = useCustomers()
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<CustomersSort>({ field: 'name', direction: SortDirection.ASC })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null)

  // Transform API customers to table format
  const customers: CustomerTable[] = useMemo(() => {
    return apiCustomers.map((customer, index) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      birthday: customer.birthday || '',
      group_id: customer.group_id || '',
      group: customer.group,
      loyalty_points: customer.loyalty_points,
      total_orders: customer.total_orders,
      total_spent: customer.total_spent,
      number: index + 1,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    }))
  }, [apiCustomers])

  const filteredAndSortedCustomers = useMemo(() => {
    if (!customers || customers.length === 0) return []
    let filtered = customers.filter(customer => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        customer.name.toLowerCase().includes(searchLower) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchLower)) ||
        (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
        (customer.group?.name && customer.group.name.toLowerCase().includes(searchLower))

      return matchesSearch
    })

    filtered.sort((a, b) => {
      let aValue: string | number | Date = a[sort.field]
      let bValue: string | number | Date = b[sort.field]

      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1
      return 0
    })

    return filtered.map((customer, index) => ({
      ...customer,
      number: index + 1
    }))
  }, [customers, searchQuery, sort])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleSort = (field: keyof CustomerTable) => {
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
    setEditingCustomerId(id)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingCustomerId(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCustomerId(null)
  }

  const handleSuccess = () => {
    handleCloseModal()
    refetch()
  }

  const handleExport = () => {
    console.log('Export customers')
  }

  const handlePrint = () => {
    console.log('Print customers')
  }

  const handleColumns = () => {
    console.log('Manage columns')
  }

  return {
    customers: filteredAndSortedCustomers,
    totalCustomersCount: customers.length,
    isLoading,
    error,
    searchQuery,
    sort,
    isModalOpen,
    editingCustomerId,
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
