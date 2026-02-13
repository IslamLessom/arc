import { useCustomerGroups } from '../hooks/useCustomerGroups'
import { Table } from '@restaurant-pos/ui'
import { getCustomerGroupsTableColumns } from '../lib/constants'
import * as Styled from './styled'

export const CustomerGroups = () => {
  const {
    customerGroups,
    isLoading,
    error,
    searchQuery,
    totalGroupsCount,
    isModalOpen,
    editingGroupId,
    handleSearchChange,
    handleBack,
    handleEdit,
    handleAdd,
    handleCloseModal,
    handleSuccess,
    handleExport,
    handlePrint,
    handleColumns
  } = useCustomerGroups()

  const columns = getCustomerGroupsTableColumns({
    onEdit: handleEdit
  })

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка групп клиентов...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>
          Ошибка при загрузке групп клиентов: {(error as Error).message}
        </Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Группы клиентов {totalGroupsCount}</Styled.Title>
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
          dataSource={customerGroups}
          onRowClick={(record) => handleEdit(record.id)}
          emptyMessage="Нет групп клиентов"
        />
      </Styled.TableContainer>

      {/* TODO: Add AddCustomerGroupModal component when ready */}
    </Styled.PageContainer>
  )
}
