import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetWriteOffs, useGetWarehouses, useGetStock } from '@restaurant-pos/api-client'
import type { WriteOffTable, WriteOffsSort, UseWriteOffsResult, WriteOffsFilters } from '../model/types'
import { SortDirection } from '../model/enums'

export const useWriteOffs = (): UseWriteOffsResult => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<WriteOffsSort>({ field: 'writeOffDateTime', direction: SortDirection.DESC })
  const [filters, setFilters] = useState<WriteOffsFilters>({
    searchQuery: '',
    warehouseId: undefined,
    categoryId: undefined,
    reason: undefined,
  })

  const { data: apiWriteOffs = [], isLoading, error } = useGetWriteOffs({
    warehouse_id: filters.warehouseId
  })
  const { data: warehouses = [] } = useGetWarehouses()
  const { data: stock = [] } = useGetStock()

  const writeOffs = useMemo(() => {
    return apiWriteOffs.map((writeOff): WriteOffTable => {
      // Формируем список товаров
      const goodsNames = writeOff.items?.map(item => {
        if (item.ingredient) return item.ingredient.name
        if (item.product) return item.product.name
        return ''
      }).filter(Boolean).join(', ') || ''

      // Вычисляем общую сумму на основе цен остатков
      const totalAmount = writeOff.items?.reduce((sum, item) => {
        // Находим цену за единицу из остатков на складе
        const stockItem = stock.find(s =>
          (s.ingredientId === item.ingredientId || s.productId === item.productId) &&
          s.warehouseId === writeOff.warehouseId
        )
        const pricePerUnit = stockItem?.pricePerUnit || 0
        return sum + (pricePerUnit * item.quantity)
      }, 0) || 0

      // Используем write_off_date_time из API, так как он возвращается бэкендом
      const writeOffDateTime = writeOff.write_off_date_time || writeOff.writeOffDateTime || ''

      return {
        ...writeOff,
        writeOffDateTime,
        goodsNames,
        totalAmount
      }
    })
  }, [apiWriteOffs, stock])

  const filteredAndSortedWriteOffs = useMemo(() => {
    let filtered = writeOffs.filter(writeOff => {
      const matchesSearch = 
        writeOff.warehouse?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        writeOff.goodsNames.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (writeOff.comment || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (writeOff.reason || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesWarehouse = !filters.warehouseId || writeOff.warehouseId === filters.warehouseId
      const matchesReason = !filters.reason || writeOff.reason === filters.reason
      
      return matchesSearch && matchesWarehouse && matchesReason
    })

    filtered.sort((a, b) => {
      let aValue: string | number | Date = a[sort.field]
      let bValue: string | number | Date = b[sort.field]
      
      // Специальная обработка для даты
      if (sort.field === 'writeOffDateTime') {
        aValue = new Date(a.writeOffDateTime).getTime()
        bValue = new Date(b.writeOffDateTime).getTime()
      }
      
      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1
      return 0
    })

    return filtered
  }, [writeOffs, searchQuery, sort, filters])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setFilters(prev => ({ ...prev, searchQuery: query }))
  }

  const handleFilterChange = (newFilters: Partial<WriteOffsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleSort = (field: keyof WriteOffTable) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === SortDirection.ASC 
        ? SortDirection.DESC 
        : SortDirection.ASC
    }))
  }

  const handleBack = () => {
    navigate('/warehouse/balances')
  }

  const handleAdd = () => {
    navigate('/warehouse/write-offs/add')
  }

  const handleExport = () => {
    console.log('Export write-offs')
  }

  const handlePrint = () => {
    console.log('Print write-offs')
  }

  const handleColumns = () => {
    console.log('Manage columns')
  }

  return {
    writeOffs: filteredAndSortedWriteOffs,
    isLoading,
    error: error as Error | null,
    searchQuery,
    filters,
    warehouses: warehouses.map(w => ({ id: w.id, name: w.name })),
    handleSearchChange,
    handleFilterChange,
    handleSort,
    handleBack,
    handleAdd,
    handleExport,
    handlePrint,
    handleColumns,
    sort,
  }
}

