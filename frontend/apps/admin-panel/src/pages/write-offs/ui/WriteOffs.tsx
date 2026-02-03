import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useWriteOffs } from '../hooks/useWriteOffs'
import { useWriteOffReasons } from '../hooks/useWriteOffReasons'
import { Table } from '@restaurant-pos/ui'
import { getWriteOffsTableColumns } from '../lib/constants'
import { getReasonsTableColumns } from '../lib/reasonsTableColumns'
import { AddWriteOffReasonModal } from './AddWriteOffReasonModal'
import type { WriteOffReasonFormData } from '../model/types'
import * as Styled from './styled'

export const WriteOffs = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as 'list' | 'reasons') || 'list'

  const setActiveTab = (tab: 'list' | 'reasons') => {
    setSearchParams({ tab })
  }
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false)
  const [editingReason, setEditingReason] = useState<ReturnType<typeof useWriteOffReasons>['reasons'][0] | null>(null)

  const {
    writeOffs,
    isLoading: isLoadingWriteOffs,
    error: writeOffsError,
    searchQuery: writeOffsSearchQuery,
    filters,
    warehouses,
    handleSearchChange: handleWriteOffsSearchChange,
    handleFilterChange,
    handleSort,
    handleBack,
    handleAdd: handleAddWriteOff,
    handleExport: handleWriteOffsExport,
    handlePrint: handleWriteOffsPrint,
    handleColumns: handleWriteOffsColumns,
  } = useWriteOffs()

  const {
    reasons,
    isLoading: isLoadingReasons,
    error: reasonsError,
    searchQuery: reasonsSearchQuery,
    handleSearchChange: handleReasonsSearchChange,
    handleAdd: handleAddReason,
    handleEdit: handleEditReason,
    handleDelete: handleDeleteReason,
    handleExport: handleReasonsExport,
    handlePrint: handleReasonsPrint,
    handleColumns: handleReasonsColumns,
  } = useWriteOffReasons()

  const columns = getWriteOffsTableColumns({})
  const reasonsColumns = getReasonsTableColumns({
    onEdit: (reason) => {
      setEditingReason(reason)
      setIsReasonModalOpen(true)
    },
    onDelete: (id) => {
      handleDeleteReason(id)
    },
  })

  const isLoading = activeTab === 'list' ? isLoadingWriteOffs : isLoadingReasons
  const error = activeTab === 'list' ? writeOffsError : reasonsError
  const searchQuery = activeTab === 'list' ? writeOffsSearchQuery : reasonsSearchQuery
  const handleSearchChange = activeTab === 'list' ? handleWriteOffsSearchChange : handleReasonsSearchChange
  const handleExport = activeTab === 'list' ? handleWriteOffsExport : handleReasonsExport
  const handlePrint = activeTab === 'list' ? handleWriteOffsPrint : handleReasonsPrint
  const handleColumns = activeTab === 'list' ? handleWriteOffsColumns : handleReasonsColumns

  const handleAdd = () => {
    if (activeTab === 'reasons') {
      setEditingReason(null)
      setIsReasonModalOpen(true)
    } else {
      handleAddWriteOff()
    }
  }

  const handleReasonModalClose = () => {
    setIsReasonModalOpen(false)
    setEditingReason(null)
  }

  const handleReasonModalSubmit = (id: string | null, data: WriteOffReasonFormData) => {
    if (id) {
      handleEditReason(id, data)
    } else {
      handleAddReason(data)
    }
    setIsReasonModalOpen(false)
    setEditingReason(null)
  }

  // Подготовка данных для таблицы причин с итоговой строкой
  const reasonsWithTotal = [
    ...reasons,
    {
      id: 'total',
      name: 'Итого',
      pnlBlock: null as any,
      writeOffCount: reasons.reduce((sum, r) => sum + r.writeOffCount, 0),
      totalCost: reasons.reduce((sum, r) => sum + r.totalCost, 0),
    } as any,
  ]

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка списаний...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>
          Ошибка при загрузке списаний: {error.message}
        </Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>
            {activeTab === 'list' ? `Списания ${writeOffs.length}` : `Причины ${reasons.length}`}
          </Styled.Title>
        </Styled.HeaderLeft>
        <Styled.HeaderActions>
          <Styled.ActionButton onClick={handleColumns}>
            <span>📋</span>
            Столбцы
          </Styled.ActionButton>
          <Styled.ActionButton onClick={handleExport}>
            <span>📤</span>
            Экспорт
          </Styled.ActionButton>
          <Styled.ActionButton onClick={handlePrint}>
            <span>🖨️</span>
            Печать
          </Styled.ActionButton>
          <Styled.ActionButton>
            <span>📅</span>
            За все время
          </Styled.ActionButton>
          <Styled.AddButton onClick={handleAdd}>Добавить</Styled.AddButton>
        </Styled.HeaderActions>
      </Styled.Header>

      <Styled.TabsContainer>
        <Styled.Tab $active={activeTab === 'list'} onClick={() => setActiveTab('list')}>
          Список
        </Styled.Tab>
        <Styled.Tab $active={activeTab === 'reasons'} onClick={() => setActiveTab('reasons')}>
          Причины
        </Styled.Tab>
      </Styled.TabsContainer>

      <Styled.SearchContainer>
        <Styled.SearchInputWrapper>
          <Styled.SearchIcon>🔍</Styled.SearchIcon>
          <Styled.SearchInput
            placeholder="Быстрый поиск"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </Styled.SearchInputWrapper>
        {activeTab === 'list' && (
          <>
            <Styled.FilterSelect
              value={filters.warehouseId || ''}
              onChange={(e) => handleFilterChange({ warehouseId: e.target.value || undefined })}
            >
              <option value="">Склад</option>
              {warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </Styled.FilterSelect>
            <Styled.FilterSelect
              value={filters.categoryId || ''}
              onChange={(e) => handleFilterChange({ categoryId: e.target.value || undefined })}
            >
              <option value="">Категории</option>
            </Styled.FilterSelect>
            <Styled.FilterSelect
              value={filters.reason || ''}
              onChange={(e) => handleFilterChange({ reason: e.target.value || undefined })}
            >
              <option value="">Причина</option>
            </Styled.FilterSelect>
          </>
        )}
        <Styled.FilterButton>+ Фильтр</Styled.FilterButton>
      </Styled.SearchContainer>

      <Styled.TableContainer>
        {activeTab === 'list' ? (
          writeOffs.length === 0 ? (
            <Styled.EmptyMessage>
              Нет данных, соответствующих выбранным фильтрам
            </Styled.EmptyMessage>
          ) : (
            <Table
              columns={columns}
              dataSource={writeOffs}
              rowKey="id"
              onRowClick={(record) => console.log('Row clicked', record.id)}
              pagination={false}
            />
          )
        ) : (
          reasonsWithTotal.length === 0 ? (
            <Styled.EmptyMessage>
              Нет причин списаний
            </Styled.EmptyMessage>
          ) : (
            <Table
              columns={reasonsColumns}
              dataSource={reasonsWithTotal}
              rowKey="id"
              pagination={false}
            />
          )
        )}
      </Styled.TableContainer>

      <AddWriteOffReasonModal
        isOpen={isReasonModalOpen}
        reason={editingReason || undefined}
        onClose={handleReasonModalClose}
        onSubmit={handleReasonModalSubmit}
      />
    </Styled.PageContainer>
  )
}

