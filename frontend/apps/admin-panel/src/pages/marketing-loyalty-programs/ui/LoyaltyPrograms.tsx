import { useLoyaltyPrograms } from '../hooks/useLoyaltyPrograms'
import { ColumnManager, Table } from '@restaurant-pos/ui'
import { getLoyaltyProgramsTableColumns } from '../lib/constants'
import type { LoyaltyProgramTable } from '../model/types'
import { AddLoyaltyProgramModal } from '../../../features/add-loyalty-program-modal'
import * as Styled from './styled'

export const LoyaltyPrograms = () => {
  const {
    loyaltyPrograms,
    isLoading,
    error,
    searchQuery,
    totalProgramsCount,
    isModalOpen,
    editingProgramId,
    handleSearchChange,
    handleBack,
    handleEdit,
    handleAdd,
    handleCloseModal,
    handleSuccess,
    handleExport,
    handlePrint,
    handleColumns,
    handleDelete,
    isColumnModalOpen,
    handleCloseColumnModal,
    visibleColumns,
    columnInfo,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    resetColumnVisibility,
  } = useLoyaltyPrograms()

  const columns = getLoyaltyProgramsTableColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  })

  const filteredColumns = columns.filter((col) => {
    if (!col.dataIndex) return true
    const key = Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex
    const visibleCol = visibleColumns.find((vc) => {
      const vcKey = Array.isArray(vc.dataIndex) ? vc.dataIndex.join('.') : vc.dataIndex
      return vcKey === key
    })
    return visibleCol !== undefined
  })

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка программ лояльности...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>
          Ошибка при загрузке программ лояльности: {(error as Error).message}
        </Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Программы лояльности {totalProgramsCount}</Styled.Title>
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
          columns={filteredColumns as any}
          dataSource={loyaltyPrograms}
          onRow={(record: LoyaltyProgramTable) => ({
            onClick: () => handleEdit(record.id)
          })}
        />
      </Styled.TableContainer>

      <AddLoyaltyProgramModal
        isOpen={isModalOpen}
        programId={editingProgramId}
        onSuccess={handleSuccess}
        onClose={handleCloseModal}
      />

      {isColumnModalOpen && (
        <ColumnManager
          columns={columnInfo}
          onToggle={toggleColumn}
          onShowAll={showAllColumns}
          onHideAll={hideAllColumns}
          onReset={resetColumnVisibility}
          onClose={handleCloseColumnModal}
        />
      )}
    </Styled.PageContainer>
  )
}
