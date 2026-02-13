import { useCustomers } from '../hooks/useCustomers'
import { Table } from '@restaurant-pos/ui'
import { getCustomersTableColumns } from '../lib/constants'
import * as Styled from './styled'

export const Customers = () => {
  const {
    customers,
    isLoading,
    error,
    searchQuery,
    totalCustomersCount,
    isModalOpen,
    editingCustomerId,
    handleSearchChange,
    handleBack,
    handleEdit,
    handleAdd,
    handleCloseModal,
    handleSuccess,
    handleExport,
    handlePrint,
    handleColumns
  } = useCustomers()

  const columns = getCustomersTableColumns({
    onEdit: handleEdit
  })

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка клиентов...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>
          Ошибка при загрузке клиентов: {(error as Error).message}
        </Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Клиенты {totalCustomersCount}</Styled.Title>
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
          dataSource={customers}
          onRowClick={(record) => handleEdit(record.id)}
          emptyMessage="Нет клиентов"
        />
      </Styled.TableContainer>

      {/* TODO: Add AddCustomerModal component when ready */}
    </Styled.PageContainer>
  )
}
