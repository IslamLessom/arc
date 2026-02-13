import { useState, useMemo } from 'react'
import { CustomerTable, CustomersSort } from '../model/types'
import { SortDirection } from '../model/enums'

// Mock data - replace with actual API calls when available
const mockCustomers: CustomerTable[] = [
  {
    id: '1',
    name: 'Иванов Иван',
    phone: '+7 777 123 4567',
    email: 'ivanov@example.com',
    birthday: '1990-05-15',
    group_id: '1',
    group: { id: '1', name: 'VIP' },
    loyalty_points: 1500,
    total_orders: 45,
    total_spent: 250000,
    number: 1,
    created_at: '2024-01-15',
    updated_at: '2024-02-10'
  },
  {
    id: '2',
    name: 'Петрова Мария',
    phone: '+7 777 234 5678',
    email: 'petrova@example.com',
    birthday: '1985-08-22',
    group_id: '2',
    group: { id: '2', name: 'Regular' },
    loyalty_points: 500,
    total_orders: 12,
    total_spent: 75000,
    number: 2,
    created_at: '2024-01-20',
    updated_at: '2024-02-08'
  }
]

export const useCustomers = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<CustomersSort>({ field: 'name', direction: SortDirection.ASC })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null)

  // TODO: Replace with actual API calls
  // const { data: apiCustomers = [], isLoading, error } = useGetCustomers()
  const customers: CustomerTable[] = mockCustomers
  const isLoading = false
  const error = null

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
