import { useMemo, useState } from 'react'
import { useMarketingLoyaltyPrograms, type MarketingLoyaltyProgram } from '@restaurant-pos/api-client'
import { LoyaltyProgramTable, LoyaltyProgramsSort } from '../model/types'
import { SortDirection } from '../model/enums'

const normalizeProgram = (program: MarketingLoyaltyProgram, number: number): LoyaltyProgramTable => ({
  id: program.id,
  name: program.name,
  description: program.description ?? null,
  type: program.type,
  points_per_currency: program.points_per_currency ?? null,
  cashback_percentage: program.cashback_percentage ?? null,
  max_cashback_amount: program.max_cashback_amount ?? null,
  point_multiplier: program.point_multiplier,
  is_active: program.active,
  members_count: program.members_count ?? 0,
  created_at: program.created_at,
  updated_at: program.updated_at,
  number,
})

export const useLoyaltyPrograms = () => {
  const { loyaltyPrograms: apiPrograms, isLoading, error, refetch } = useMarketingLoyaltyPrograms()

  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<LoyaltyProgramsSort>({ field: 'name', direction: SortDirection.ASC })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null)

  const loyaltyPrograms = useMemo(
    () => apiPrograms.map((program, index) => normalizeProgram(program, index + 1)),
    [apiPrograms]
  )

  const filteredAndSortedPrograms = useMemo(() => {
    if (!loyaltyPrograms.length) return []

    const filtered = loyaltyPrograms.filter((program) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        program.name.toLowerCase().includes(searchLower) ||
        (program.description && program.description.toLowerCase().includes(searchLower))
      )
    })

    filtered.sort((a, b) => {
      const aValue: string | number | Date | boolean | null | undefined = a[sort.field]
      const bValue: string | number | Date | boolean | null | undefined = b[sort.field]

      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sort.direction === SortDirection.ASC ? -1 : 1
      if (bValue == null) return sort.direction === SortDirection.ASC ? 1 : -1

      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1
      return 0
    })

    return filtered.map((program, index) => ({
      ...program,
      number: index + 1,
    }))
  }, [loyaltyPrograms, searchQuery, sort])

  const handleSearchChange = (query: string) => setSearchQuery(query)

  const handleSort = (field: keyof LoyaltyProgramTable) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === SortDirection.ASC
          ? SortDirection.DESC
          : SortDirection.ASC,
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

  const handleSuccess = async () => {
    await refetch()
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
