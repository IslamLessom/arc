import { useState, useMemo } from 'react'
import { CustomerGroupTable, CustomerGroupsSort } from '../model/types'
import { SortDirection } from '../model/enums'

// Mock data - replace with actual API calls when available
const mockCustomerGroups: CustomerGroupTable[] = [
  {
    id: '1',
    name: 'VIP',
    description: 'Особые клиенты с повышенными бонусами',
    discount_percentage: 15,
    min_orders: 50,
    min_spent: 500000,
    customers_count: 125,
    number: 1,
    created_at: '2024-01-15',
    updated_at: '2024-02-10'
  },
  {
    id: '2',
    name: 'Regular',
    description: 'Обычные клиенты',
    discount_percentage: 5,
    min_orders: 10,
    min_spent: 50000,
    customers_count: 450,
    number: 2,
    created_at: '2024-01-20',
    updated_at: '2024-02-08'
  },
  {
    id: '3',
    name: 'New',
    description: 'Новые клиенты',
    discount_percentage: 0,
    min_orders: null,
    min_spent: null,
    customers_count: 200,
    number: 3,
    created_at: '2024-01-25',
    updated_at: '2024-02-05'
  }
]

export const useCustomerGroups = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<CustomerGroupsSort>({ field: 'name', direction: SortDirection.ASC })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)

  // TODO: Replace with actual API calls
  // const { data: apiGroups = [], isLoading, error } = useGetCustomerGroups()
  const customerGroups: CustomerGroupTable[] = mockCustomerGroups
  const isLoading = false
  const error = null

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
