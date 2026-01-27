import { useState, useMemo } from 'react'
import { useGetPositions } from '@restaurant-pos/api-client'
import { PositionTable, PositionsSort } from '../model/types'
import { SortDirection } from '../model/enums'

export const usePositions = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<PositionsSort>({ field: 'name', direction: 'asc' })

  const { data: apiPositions = [], isLoading, error } = useGetPositions()

  const positions = useMemo(() => {
    if (!apiPositions) return []
    return apiPositions.map((position): PositionTable => {
      return {
        id: position.id,
        name: position.name,
        permissions: position.permissions,
        created_at: position.created_at,
        updated_at: position.updated_at,
        number: 0,
      }
    })
  }, [apiPositions])

  const filteredAndSortedPositions = useMemo(() => {
    if (!positions || positions.length === 0) return []
    let filtered = positions.filter(position => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        position.name.toLowerCase().includes(searchLower)

      return matchesSearch
    })

    filtered.sort((a, b) => {
      let aValue: string | number = a[sort.field] as string | number
      let bValue: string | number = b[sort.field] as string | number

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
      return 0
    })

    return filtered.map((position, index) => ({
      ...position,
      number: index + 1
    }))
  }, [positions, searchQuery, sort])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleSort = (field: keyof PositionTable) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc'
        ? 'desc'
        : 'asc'
    }))
  }

  const handleBack = () => {
    window.history.back()
  }

  const handleExport = () => {
    console.log('Export positions')
  }

  const handlePrint = () => {
    console.log('Print positions')
  }

  const handleColumns = () => {
    console.log('Manage columns')
  }

  return {
    positions: filteredAndSortedPositions,
    totalPositionsCount: positions.length,
    isLoading,
    error,
    searchQuery,
    sort,
    handleSearchChange,
    handleSort,
    handleBack,
    handleExport,
    handlePrint,
    handleColumns,
  }
}
