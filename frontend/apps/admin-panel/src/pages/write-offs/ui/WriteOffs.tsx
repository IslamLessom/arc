import { useState } from 'react'
import { useWriteOffs } from '../hooks/useWriteOffs'
import { Table } from '@restaurant-pos/ui'
import { getWriteOffsTableColumns } from '../lib/constants'
import * as Styled from './styled'

export const WriteOffs = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'reasons'>('list')
  const {
    writeOffs,
    isLoading,
    error,
    searchQuery,
    filters,
    warehouses,
    handleSearchChange,
    handleFilterChange,
    handleSort,
    handleBack,
    handleAdd,
    handleExport,
    handlePrint,
    handleColumns,
  } = useWriteOffs()

  const columns = getWriteOffsTableColumns({})

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
          <Styled.Title>Списания {writeOffs.length}</Styled.Title>
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
        <Styled.FilterButton>+ Фильтр</Styled.FilterButton>
      </Styled.SearchContainer>

      <Styled.TableContainer>
        {writeOffs.length === 0 ? (
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
        )}
      </Styled.TableContainer>
    </Styled.PageContainer>
  )
}

