import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetShifts, useDeleteShift, transformApiShiftToShift } from '@restaurant-pos/api-client'
import type { CashRegisterShiftTable, CashRegisterShiftsFilter } from '../model'
import { transformShiftToTable } from '../lib'

export const useCashRegisterShifts = () => {
  const navigate = useNavigate()

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<CashRegisterShiftsFilter>({})

  // API
  const { data: shifts = [], isLoading, error } = useGetShifts(filter)
  const deleteShiftMutation = useDeleteShift()

  // Transform data for table
  const shiftsTable = useMemo(() => {
    return shifts.map((shift) => {
      const transformed = transformApiShiftToShift(shift)
      return transformShiftToTable(transformed)
    })
  }, [shifts])

  // Filter and sort by default (openedAt desc)
  const filteredAndSortedShifts = useMemo(() => {
    let result = [...shiftsTable]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((shift) => {
        return (
          shift.employee?.name?.toLowerCase().includes(query) ||
          shift.establishment?.name?.toLowerCase().includes(query) ||
          shift.id.toLowerCase().includes(query)
        )
      })
    }

    // Default sort by openedAt desc
    result.sort((a, b) => {
      const aTime = new Date(a.openedAt).getTime()
      const bTime = new Date(b.openedAt).getTime()
      return bTime - aTime
    })

    // Рассчитываем разницу открытия текущей смены к остатку предыдущей смены
    // (предыдущая в хронологическом порядке при сортировке DESC находится на index + 1).
    return result.map((shift, index) => {
      const previousShift = result[index + 1]
      let difference = 0

      if (previousShift) {
        const previousCarryOver = previousShift.leaveCash
          ?? previousShift.closingBalance
          ?? previousShift.openingBalance
        difference = shift.openingBalance - previousCarryOver
        if (Math.abs(difference) < 0.01) {
          difference = 0
        }
      }

      return {
        ...shift,
        number: index + 1,
        difference,
      }
    })
  }, [shiftsTable, searchQuery])

  // Handlers
  const handleBack = () => {
    navigate('/finance')
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту смену?')) {
      try {
        await deleteShiftMutation.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete shift:', error)
        alert('Не удалось удалить смену')
      }
    }
  }

  const handleFilterChange = (newFilter: Partial<CashRegisterShiftsFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }))
  }

  return {
    // Data
    shifts: filteredAndSortedShifts,
    totalShiftsCount: shiftsTable.length,

    // State
    isLoading,
    error,
    searchQuery,
    filter,
    isDeleting: deleteShiftMutation.isPending,

    // Handlers
    handleBack,
    handleSearchChange,
    handleDelete,
    handleFilterChange,
  }
}
