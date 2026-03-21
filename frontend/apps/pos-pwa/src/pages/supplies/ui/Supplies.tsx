// @ts-nocheck
import { useState } from 'react'
import { useSupplies } from '../hooks/useSupplies'
import { Table } from '@restaurant-pos/ui'
import { getSuppliesTableColumns } from '../lib/constants'
import { SupplyDetailsModal } from '@/features/supply-details-modal'
import * as Styled from './styled'

export const Supplies = () => {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedSupplyId, setSelectedSupplyId] = useState<string | undefined>()

  const {
    supplies,
    isLoading,
    error,
    searchQuery,
    sort,
    warehouses,
    suppliers,
    totalAmount,
    totalDebt,
    handleSearchChange,
    handleSort,
    handleBack,
    handleEdit,
    handleAdd,
    handleExport,
    handlePrint,
    handleColumns
  } = useSupplies()

  const handleDetails = (id: string) => {
    setSelectedSupplyId(id)
    setIsDetailsModalOpen(true)
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedSupplyId(undefined)
  }

  const columns = getSuppliesTableColumns({
    onEdit: handleDetails,
    onDetails: handleDetails
  })

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка поставок...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>
          Ошибка при загрузке поставок: {error.message}
        </Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Поставки {supplies.length}</Styled.Title>
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

      <Styled.SearchContainer>
        <Styled.SearchInputWrapper>
          <Styled.SearchIcon>🔍</Styled.SearchIcon>
          <Styled.SearchInput
            placeholder="Быстрый поиск"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </Styled.SearchInputWrapper>
        <select
          style={{
            padding: '10px 16px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#64748b',
            backgroundColor: '#ffffff',
            cursor: 'pointer'
          }}
        >
          <option value="">Поставщик</option>
          {suppliers.map(supplier => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
        <select
          style={{
            padding: '10px 16px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#64748b',
            backgroundColor: '#ffffff',
            cursor: 'pointer'
          }}
        >
          <option value="">Счет</option>
        </select>
        <select
          style={{
            padding: '10px 16px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#64748b',
            backgroundColor: '#ffffff',
            cursor: 'pointer'
          }}
        >
          <option value="">Категории</option>
        </select>
        <Styled.FilterButton>+ Фильтр</Styled.FilterButton>
      </Styled.SearchContainer>

      <Styled.TableContainer>
        <Table
          columns={columns}
          dataSource={supplies}
          onRowClick={(record) => handleDetails(record.id)}
          summary={
            <Styled.TableSummaryContainer>
              <Styled.TableSummaryLabel>Итого</Styled.TableSummaryLabel>
              <div style={{ display: 'flex', gap: '24px' }}>
                <Styled.TableSummaryLabel>Сумма: {totalAmount.toFixed(2)} ₽</Styled.TableSummaryLabel>
                <Styled.TableSummaryLabel>Задолженность: {totalDebt.toFixed(2)} ₽</Styled.TableSummaryLabel>
              </div>
            </Styled.TableSummaryContainer>
          }
          emptyMessage="Нет поставок"
        />
      </Styled.TableContainer>

      <SupplyDetailsModal
        isOpen={isDetailsModalOpen}
        supplyId={selectedSupplyId}
        onClose={handleCloseDetailsModal}
      />
    </Styled.PageContainer>
  )
}
