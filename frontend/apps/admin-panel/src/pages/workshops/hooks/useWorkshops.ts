import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetWorkshops, useDeleteWorkshop } from '@restaurant-pos/api-client'
import { Workshop, WorkshopsSort } from '../model/types'
import { SortDirection } from '../model/enums'

export const useWorkshops = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<WorkshopsSort>({ field: 'name', direction: SortDirection.ASC })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorkshopId, setEditingWorkshopId] = useState<string | null>(null)

  const { data: apiWorkshops = [], isLoading, error } = useGetWorkshops()

  const deleteWorkshopMutation = useDeleteWorkshop()

  const workshops = useMemo(() => {
    return apiWorkshops.map(workshop => ({
      id: workshop.id,
      name: workshop.name,
      print_slips: workshop.print_slips || false
    }))
  }, [apiWorkshops])

  const filteredAndSortedWorkshops = useMemo(() => {
    let filtered = workshops.filter(workshop =>
      workshop.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    filtered.sort((a, b) => {
      const aValue = a[sort.field]
      const bValue = b[sort.field]
      
      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1
      return 0
    })

    return filtered
  }, [workshops, searchQuery, sort])

  const totalWorkshopsCount = filteredAndSortedWorkshops.length

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleSort = (field: keyof Workshop) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === SortDirection.ASC 
        ? SortDirection.DESC 
        : SortDirection.ASC
    }))
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleEdit = (id: string) => {
    setEditingWorkshopId(id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот цех?')) {
      try {
        await deleteWorkshopMutation.mutateAsync(id)
      } catch (err) {
        console.error('Failed to delete workshop:', err)
      }
    }
  }

  const handleAdd = () => {
    setEditingWorkshopId(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingWorkshopId(null)
  }

  const handleSuccess = () => {
    handleCloseModal()
  }

  const handleExport = () => {
    console.log('Export workshops')
  }

  const handlePrint = () => {
    console.log('Print workshops')
  }

  const handleColumns = () => {
    console.log('Manage columns')
  }

  return {
    workshops: filteredAndSortedWorkshops,
    isLoading,
    error,
    searchQuery,
    sort,
    totalWorkshopsCount,
    isModalOpen,
    editingWorkshopId,
    handleSearchChange,
    handleSort,
    handleBack,
    handleEdit,
    handleDelete,
    handleAdd,
    handleCloseModal,
    handleSuccess,
    handleExport,
    handlePrint,
    handleColumns
  }
}

