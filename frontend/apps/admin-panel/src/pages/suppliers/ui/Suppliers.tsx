import { useSuppliers } from '../hooks/useSuppliers'
import { Table } from '@restaurant-pos/ui'
import { AddSupplierModal } from '../../../features/add-supplier-modal'
import { getSuppliersTableColumns } from '../lib/constants'
import * as Styled from './styled'

export const Suppliers = () => {
  const {
    suppliers,
    isLoading,
    error,
    searchQuery,
    sort,
    totalSuppliersCount,
    totalDeliveriesCount,
    totalDeliveriesAmount,
    totalDebtAmount,
    isModalOpen,
    editingSupplierId,
    handleSearchChange,
    handleSort,
    handleBack,
    handleEdit,
    handleAdd,
    handleCloseModal,
    handleSuccess,
    handleExport,
    handlePrint,
    handleColumns
  } = useSuppliers()

  const columns = getSuppliersTableColumns({
    onEdit: handleEdit
  })

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка поставщиков...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>
          Ошибка при загрузке поставщиков: {error.message}
        </Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Поставщики {totalSuppliersCount}</Styled.Title>
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
        <Styled.FilterButton>+ Фильтр</Styled.FilterButton>
      </Styled.SearchContainer>

      <Styled.TableContainer>
        <Table
          columns={columns}
          dataSource={suppliers}
          onRowClick={(record) => handleEdit(record.id)}
          summary={
            <Styled.TableSummaryContainer>
              <Styled.TableSummaryLabel>Итого</Styled.TableSummaryLabel>
              <div style={{ display: 'flex', gap: '24px' }}>
                <Styled.TableSummaryLabel>
                  Количество поставок: {totalDeliveriesCount}
                </Styled.TableSummaryLabel>
                <Styled.TableSummaryLabel>
                  Сумма поставок: {totalDeliveriesAmount.toFixed(2)} ₽
                </Styled.TableSummaryLabel>
                <Styled.TableSummaryLabel>
                  Сумма задолженности: {totalDebtAmount.toFixed(2)} ₽
                </Styled.TableSummaryLabel>
              </div>
            </Styled.TableSummaryContainer>
          }
          emptyMessage="Нет поставщиков"
        />
      </Styled.TableContainer>

      <AddSupplierModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        supplierId={editingSupplierId || undefined}
      />
    </Styled.PageContainer>
  )
}

