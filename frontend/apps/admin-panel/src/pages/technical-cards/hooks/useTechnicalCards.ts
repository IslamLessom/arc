import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetTechnicalCards, useDeleteTechnicalCard } from '@restaurant-pos/api-client'
import { TechnicalCard, TechnicalCardsFilters, TechnicalCardsSort } from '../model/types'
import { TechnicalCardStatus, SortDirection } from '../model/enums'

export const useTechnicalCards = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<TechnicalCardsSort>({ field: 'name', direction: SortDirection.ASC })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)

  const { data: apiTechnicalCards = [], isLoading, error } = useGetTechnicalCards({
    search: searchQuery || undefined,
    active: undefined
  })

  const deleteTechnicalCardMutation = useDeleteTechnicalCard()

  const technicalCards = useMemo(() => {
    return apiTechnicalCards.map(card => ({
      id: card.id,
      name: card.name,
      category: card.category,
      ingredients: card.ingredients?.length || 0,
      weight: 0,
      cost: card.cost_price,
      price: card.price,
      margin: card.cost_price > 0 ? ((card.price - card.cost_price) / card.cost_price * 100) : 0,
      status: card.active ? TechnicalCardStatus.ACTIVE : TechnicalCardStatus.INACTIVE,
      lastModified: new Date(card.updated_at).toLocaleDateString('ru-RU')
    }))
  }, [apiTechnicalCards])

  const filteredAndSortedCards = useMemo(() => {
    let filtered = technicalCards.filter(card =>
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    filtered.sort((a, b) => {
      const aValue = a[sort.field]
      const bValue = b[sort.field]
      
      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1
      return 0
    })

    return filtered
  }, [technicalCards, searchQuery, sort])
  

  const totalCardsCount = filteredAndSortedCards.length
  const totalCost = filteredAndSortedCards.reduce((sum, card) => sum + card.cost, 0)

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleSort = (field: keyof TechnicalCard) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === SortDirection.ASC 
        ? SortDirection.DESC 
        : SortDirection.ASC
    }))
  }

  const handleBack = () => {
    navigate('/menu')
  }

  const handleEdit = (id: string) => {
    setEditingCardId(id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту техкарту?')) {
      try {
        await deleteTechnicalCardMutation.mutateAsync(id)
      } catch (err) {
        console.error('Failed to delete technical card:', err)
      }
    }
  }

  const handleAdd = () => {
    setEditingCardId(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCardId(null)
  }

  const handleSuccess = () => {
    handleCloseModal()
  }

  const handleExport = () => {
    // Экспорт функциональность
    console.log('Export technical cards')
  }

  const handlePrint = () => {
    // Печать функциональность
    console.log('Print technical cards')
  }

  const handleColumns = () => {
    // Управление столбцами
    console.log('Manage columns')
  }

  return {
    technicalCards: filteredAndSortedCards,
    isLoading,
    error,
    searchQuery,
    sort,
    totalCardsCount,
    totalCost,
    isModalOpen,
    editingCardId,
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