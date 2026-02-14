import { useLoyaltyPrograms } from '../hooks/useLoyaltyPrograms'
import { Table } from '@restaurant-pos/ui'
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
    handleColumns
  } = useLoyaltyPrograms()

  const columns = getLoyaltyProgramsTableColumns({
    onEdit: handleEdit
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
          columns={columns}
          dataSource={loyaltyPrograms}
          onRowClick={(record: LoyaltyProgramTable) => handleEdit(record.id)}
          emptyMessage="Нет программ лояльности"
        />
      </Styled.TableContainer>

      <AddLoyaltyProgramModal
        isOpen={isModalOpen}
        programId={editingProgramId}
        onSuccess={handleSuccess}
        onClose={handleCloseModal}
      />
    </Styled.PageContainer>
  )
}
