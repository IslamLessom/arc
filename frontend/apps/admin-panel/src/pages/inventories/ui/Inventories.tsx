import { useInventories } from '../hooks/useInventories'
import { Table } from '@restaurant-pos/ui'
import type { InventoryListItem } from '../model/types'
import { getInventoriesTableColumns } from '../lib/constants'
import { AddInventoryModal } from '../../../features/add-inventory-modal'
import * as Styled from './styled'

export const Inventories = () => {
  const {
    inventories,
    isLoading,
    error,
    searchQuery,
    isAddModalOpen,
    filters,
    warehouses,
    totalCount,
    handleSearchChange,
    handleFilterChange,
    handleBack,
    handleAdd,
    handleAddModalClose,
    handleAddSuccess,
    handleEdit,
    handleExport,
    handlePrint,
    handleColumns,
  } = useInventories()

  const columns = getInventoriesTableColumns({
    onEdit: handleEdit,
  }) as unknown as import('@restaurant-pos/ui').TableColumn<Record<string, unknown>>[]

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка инвентаризаций...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>
          Ошибка при загрузке инвентаризаций: {error.message}
        </Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Инвентаризации {totalCount}</Styled.Title>
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

      {totalCount === 0 && (
        <Styled.InfoSection style={{ position: 'relative' }}>
          <Styled.InfoIcon>🥕</Styled.InfoIcon>
          <Styled.InfoContent>
            <Styled.InfoTitle>Добавьте инвентаризацию</Styled.InfoTitle>
            <Styled.InfoText>
              Чтобы сравнить планируемые и фактические остатки продуктов на складе, создайте
              инвентаризацию. Poster покажет результат проверки — разницу между остатками в
              количестве и деньгах.
            </Styled.InfoText>
          </Styled.InfoContent>
        </Styled.InfoSection>
      )}

      <Styled.SearchContainer>
        <Styled.DateTimeDisplay>
          {new Date().toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Styled.DateTimeDisplay>
        <Styled.ConductButton onClick={handleAdd}>
          <span>📋</span>
          Провести инвентаризацию
        </Styled.ConductButton>
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
          onChange={(e) =>
            handleFilterChange({ warehouse_id: e.target.value || undefined })
          }
        >
          <option value="">Склад</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </Styled.FilterSelect>
        <Styled.FilterButton>+ Фильтр</Styled.FilterButton>
      </Styled.SearchContainer>

      <Styled.TableContainer>
        {totalCount === 0 ? (
          <Styled.EmptyState>
            <Styled.EmptyStateTitle>Здесь будут инвентаризации</Styled.EmptyStateTitle>
            <Styled.EmptyStateText>
              Создавайте склады и проверяйте остатки продуктов, которые на них хранятся. Poster
              покажет излишки или недостачи и поможет найти причины расхождений.
            </Styled.EmptyStateText>
          </Styled.EmptyState>
        ) : (
          <Table<Record<string, unknown>>
            columns={columns}
            dataSource={inventories as unknown as Record<string, unknown>[]}
            rowKey="id"
            pagination={false}
            onRow={(record: Record<string, unknown>) => ({
              onClick: () => handleEdit((record as unknown as InventoryListItem).id),
            })}
          />
        )}
      </Styled.TableContainer>

      <AddInventoryModal
        isOpen={isAddModalOpen}
        onClose={handleAddModalClose}
        onSuccess={handleAddSuccess}
      />
    </Styled.PageContainer>
  )
}

