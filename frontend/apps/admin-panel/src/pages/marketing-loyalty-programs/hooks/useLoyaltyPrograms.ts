import { useState, useMemo } from 'react'
import { LoyaltyProgramTable, LoyaltyProgramsSort } from '../model/types'
import { SortDirection } from '../model/enums'

// Mock data - replace with actual API calls when available
const mockLoyaltyPrograms: LoyaltyProgramTable[] = [
  {
    id: '1',
    name: 'Бонусная программа',
    description: 'Начисляйте баллы за каждую покупку',
    type: 'points',
    points_per_currency: 10,
    cashback_percentage: null,
    max_cashback_amount: null,
    point_multiplier: 1,
    is_active: true,
    members_count: 575,
    number: 1,
    created_at: '2024-01-15',
    updated_at: '2024-02-10'
  },
  {
    id: '2',
    name: 'Кэшбэк 5%',
    description: 'Возврат 5% от суммы покупки на счет',
    type: 'cashback',
    points_per_currency: null,
    cashback_percentage: 5,
    max_cashback_amount: 5000,
    point_multiplier: 1,
    is_active: true,
    members_count: 320,
    number: 2,
    created_at: '2024-01-20',
    updated_at: '2024-02-08'
  },
  {
    id: '3',
    name: 'VIP уровни',
    description: 'Поступите на новый уровень с бонусами',
    type: 'tier',
    points_per_currency: null,
    cashback_percentage: null,
    max_cashback_amount: null,
    point_multiplier: 2,
    is_active: false,
    members_count: 0,
    number: 3,
    created_at: '2024-01-25',
    updated_at: '2024-02-05'
  }
]

export const useLoyaltyPrograms = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<LoyaltyProgramsSort>({ field: 'name', direction: SortDirection.ASC })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null)

  // TODO: Replace with actual API calls
  // const { data: apiPrograms = [], isLoading, error } = useGetLoyaltyPrograms()
  const loyaltyPrograms: LoyaltyProgramTable[] = mockLoyaltyPrograms
  const isLoading = false
  const error = null

  const filteredAndSortedPrograms = useMemo(() => {
    if (!loyaltyPrograms || loyaltyPrograms.length === 0) return []
    let filtered = loyaltyPrograms.filter(program => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        program.name.toLowerCase().includes(searchLower) ||
        (program.description && program.description.toLowerCase().includes(searchLower))

      return matchesSearch
    })

    filtered.sort((a, b) => {
      let aValue: string | number | Date | boolean = a[sort.field]
      let bValue: string | number | Date | boolean = b[sort.field]

      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1
      return 0
    })

    return filtered.map((program, index) => ({
      ...program,
      number: index + 1
    }))
  }, [loyaltyPrograms, searchQuery, sort])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleSort = (field: keyof LoyaltyProgramTable) => {
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
    setEditingProgramId(id)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingProgramId(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProgramId(null)
  }

  const handleSuccess = () => {
    handleCloseModal()
  }

  const handleExport = () => {
    console.log('Export loyalty programs')
  }

  const handlePrint = () => {
    console.log('Print loyalty programs')
  }

  const handleColumns = () => {
    console.log('Manage columns')
  }

  return {
    loyaltyPrograms: filteredAndSortedPrograms,
    totalProgramsCount: loyaltyPrograms.length,
    isLoading,
    error,
    searchQuery,
    sort,
    isModalOpen,
    editingProgramId,
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
