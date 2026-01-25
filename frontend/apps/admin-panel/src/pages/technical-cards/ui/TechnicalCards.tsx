import { useTechnicalCards } from '../hooks/useTechnicalCards'
import { Input, Button, ButtonVariant, ButtonSize, Table } from '@restaurant-pos/ui'
import { AddTechnicalCardModal } from '../../../features/add-technical-card-modal'
import { getTechnicalCardsTableColumns } from '../lib/constants'
import * as Styled from './styled'

export const TechnicalCards = () => {
  const {
    technicalCards,
    isLoading,
    error,
    searchQuery,
    sort,
    totalCardsCount,
    totalCost,
    isModalOpen,
    editingCardId,
    handleSearchChange,
    handleSort,
    handleBack,
    handleEdit,
    handleDelete,
    handleAdd,
    handleCloseModal,
    handleSuccess,
    handleExport,
    handlePrint,
    handleColumns
  } = useTechnicalCards()


  const columns = getTechnicalCardsTableColumns({
    onEdit: handleEdit,
    onDelete: handleDelete
  })

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка техкарт...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>
          Ошибка при загрузке техкарт: {error.message}
        </Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Техкарты {technicalCards.length}</Styled.Title>
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
          dataSource={technicalCards}
          onRowClick={(record: any) => handleEdit(record.id)}
          summary={
            <Styled.TableSummaryContainer>
              <Styled.TableSummaryLabel>Итого</Styled.TableSummaryLabel>
              <Styled.TableSummaryLabel>{totalCost.toFixed(2)} ₽</Styled.TableSummaryLabel>
            </Styled.TableSummaryContainer>
          }
          emptyMessage="Нет техкарт"
        />
      </Styled.TableContainer>

      <AddTechnicalCardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        cardId={editingCardId || undefined}
      />
    </Styled.PageContainer>
  )
}