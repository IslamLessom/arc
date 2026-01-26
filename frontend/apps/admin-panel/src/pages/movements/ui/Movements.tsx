import { useMovements } from '../hooks/useMovements'
import { Table } from '@restaurant-pos/ui'
import { AddMovementModal } from '../../../features/add-movement-modal'
import { getMovementsTableColumns } from '../lib/constants'
import * as Styled from './styled'

export const Movements = () => {
  const {
    movements,
    isLoading,
    error,
    searchQuery,
    filters,
    warehouses,
    handleSearchChange,
    handleFilterChange,
    handleSort,
    handleBack,
    handleEdit,
    handleAdd,
    handleExport,
    handlePrint,
    handleColumns,
    isModalOpen,
    editingMovementId,
    handleCloseModal,
    handleSuccess,
  } = useMovements()

  const columns = getMovementsTableColumns({
    onEdit: handleEdit,
  })

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка перемещений...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>Ошибка при загрузке перемещений: {error.message}</Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Перемещения {movements.length}</Styled.Title>
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
        <Styled.FilterSelect
          value={filters.warehouse_id || ''}
          onChange={(e) => handleFilterChange({ warehouse_id: e.target.value || undefined })}
        >
          <option value="">Склады</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </Styled.FilterSelect>
        <Styled.FilterButton>+ Фильтр</Styled.FilterButton>
      </Styled.SearchContainer>

      <Styled.TableContainer>
        <Table
          columns={columns}
          dataSource={movements}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleEdit?.(record.id),
          })}
          pagination={false}
          emptyMessage="Нет данных, соответствующих выбранным фильтрам"
        />
      </Styled.TableContainer>

      <AddMovementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        movementId={editingMovementId}
      />
    </Styled.PageContainer>
  )
}

