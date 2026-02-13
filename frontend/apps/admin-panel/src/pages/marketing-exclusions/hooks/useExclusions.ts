import { useState, useMemo } from 'react'
import { ExclusionTable, ExclusionsSort } from '../model/types'
import { SortDirection } from '../model/enums'

// Mock data - replace with actual API calls when available
const mockExclusions: ExclusionTable[] = [
  {
    id: '1',
    name: 'Алкоголь по акции',
    description: 'Исключить алкогольные напитки из всех акций',
    type: 'category',
    entity_id: 'cat_123',
    entity_name: 'Алкогольные напитки',
    is_active: true,
    number: 1,
    created_at: '2024-01-15',
    updated_at: '2024-02-10'
  },
  {
    id: '2',
    name: 'VIP клиенты',
    description: 'Исключить VIP клиентов из скидочных программ',
    type: 'customer_group',
    entity_id: 'group_1',
    entity_name: 'VIP',
    is_active: true,
    number: 2,
    created_at: '2024-01-20',
    updated_at: '2024-02-08'
  },
  {
    id: '3',
    name: 'Премиум товары',
    description: 'Исключить премиум товары из бонусной программы',
    type: 'product',
    entity_id: 'prod_456',
    entity_name: 'Премиум сет',
    is_active: false,
    number: 3,
    created_at: '2024-01-25',
    updated_at: '2024-02-05'
  }
]

export const useExclusions = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<ExclusionsSort>({ field: 'name', direction: SortDirection.ASC })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExclusionId, setEditingExclusionId] = useState<string | null>(null)

  // TODO: Replace with actual API calls
  // const { data: apiExclusions = [], isLoading, error } = useGetExclusions()
  const exclusions: ExclusionTable[] = mockExclusions
  const isLoading = false
  const error = null

  const filteredAndSortedExclusions = useMemo(() => {
    if (!exclusions || exclusions.length === 0) return []
    let filtered = exclusions.filter(exclusion => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        exclusion.name.toLowerCase().includes(searchLower) ||
        (exclusion.description && exclusion.description.toLowerCase().includes(searchLower)) ||
        (exclusion.entity_name && exclusion.entity_name.toLowerCase().includes(searchLower))

      return matchesSearch
    })

    filtered.sort((a, b) => {
      let aValue: string | number | Date | boolean = a[sort.field]
      let bValue: string | number | Date | boolean = b[sort.field]

      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1
      return 0
    })

    return filtered.map((exclusion, index) => ({
      ...exclusion,
      number: index + 1
    }))
  }, [exclusions, searchQuery, sort])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleSort = (field: keyof ExclusionTable) => {
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
    setEditingExclusionId(id)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingExclusionId(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingExclusionId(null)
  }

  const handleSuccess = () => {
    handleCloseModal()
  }

  const handleExport = () => {
    console.log('Export exclusions')
  }

  const handlePrint = () => {
    console.log('Print exclusions')
  }

  const handleColumns = () => {
    console.log('Manage columns')
  }

  return {
    exclusions: filteredAndSortedExclusions,
    totalExclusionsCount: exclusions.length,
    isLoading,
    error,
    searchQuery,
    sort,
    isModalOpen,
    editingExclusionId,
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
