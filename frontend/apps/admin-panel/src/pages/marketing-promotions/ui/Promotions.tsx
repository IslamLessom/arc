import { usePromotions } from '../hooks/usePromotions'
import { Table } from '@restaurant-pos/ui'
import { getPromotionsTableColumns } from '../lib/constants'
import * as Styled from './styled'

export const Promotions = () => {
  const {
    promotions,
    isLoading,
    error,
    searchQuery,
    totalPromotionsCount,
    isModalOpen,
    editingPromotionId,
    handleSearchChange,
    handleBack,
    handleEdit,
    handleAdd,
    handleCloseModal,
    handleSuccess,
    handleExport,
    handlePrint,
    handleColumns
  } = usePromotions()

  const columns = getPromotionsTableColumns({
    onEdit: handleEdit
  })

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка акций...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>
          Ошибка при загрузке акций: {(error as Error).message}
        </Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Акции {totalPromotionsCount}</Styled.Title>
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
          dataSource={promotions}
          onRowClick={(record) => handleEdit(record.id)}
          emptyMessage="Нет акций"
        />
      </Styled.TableContainer>

      {/* TODO: Add AddPromotionModal component when ready */}
    </Styled.PageContainer>
  )
}
