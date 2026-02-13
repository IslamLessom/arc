import { useState, useMemo } from 'react'
import { useGetEmployees, useAllEmployeeStatistics } from '@restaurant-pos/api-client'
import { EmployeeTable, EmployeesSort } from '../model/types'
import { SortDirection } from '../model/enums'

export const useEmployees = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<EmployeesSort>({ field: 'name', direction: SortDirection.ASC })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null)

  // Get current month start and end dates for statistics
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endOfMonth = now.toISOString()

  const { data: apiEmployees = [], isLoading, error } = useGetEmployees()
  const { data: statistics = [] } = useAllEmployeeStatistics({
    startDate: startOfMonth,
    endDate: endOfMonth,
    enabled: !isLoading && apiEmployees.length > 0,
  })

  const employees = useMemo(() => {
    if (!apiEmployees) return []
    return apiEmployees.map((employee): EmployeeTable => {
      // Find statistics for this employee
      const empStats = statistics.find(s => s.user_id === employee.id)
      return {
        ...employee,
        number: 0,
        statistics: empStats ? {
          total_hours_worked: empStats.total_hours_worked,
          total_shifts: empStats.total_shifts,
          total_sales: empStats.total_sales,
        } : undefined,
      }
    })
  }, [apiEmployees, statistics])

  const filteredAndSortedEmployees = useMemo(() => {
    if (!employees || employees.length === 0) return []
    let filtered = employees.filter(employee => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        employee.name.toLowerCase().includes(searchLower) ||
        (employee.phone && employee.phone.toLowerCase().includes(searchLower)) ||
        employee.email.toLowerCase().includes(searchLower) ||
        (employee.role && employee.role.name.toLowerCase().includes(searchLower))

      return matchesSearch
    })

    filtered.sort((a, b) => {
      let aValue: string | number | Date = a[sort.field]
      let bValue: string | number | Date = b[sort.field]

      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1
      return 0
    })

    // Устанавливаем номера после сортировки
    return filtered.map((employee, index) => ({
      ...employee,
      number: index + 1
    }))
  }, [employees, searchQuery, sort])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleSort = (field: keyof EmployeeTable) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === SortDirection.ASC
        ? SortDirection.DESC
        : SortDirection.ASC
    }))
  }

  const handleBack = () => {
    // Возврат на предыдущую страницу или в меню Доступ
    window.history.back()
  }

  const handleEdit = (id: string) => {
    setEditingEmployeeId(id)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingEmployeeId(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingEmployeeId(null)
  }

  const handleSuccess = () => {
    handleCloseModal()
  }

  const handleExport = () => {
    console.log('Export employees')
  }

  const handlePrint = () => {
    console.log('Print employees')
  }

  const handleColumns = () => {
    console.log('Manage columns')
  }

  return {
    employees: filteredAndSortedEmployees,
    totalEmployeesCount: employees.length,
    isLoading,
    error,
    searchQuery,
    sort,
    isModalOpen,
    editingEmployeeId,
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
