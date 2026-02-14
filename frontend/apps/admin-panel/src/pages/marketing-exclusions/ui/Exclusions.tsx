import { useExclusions } from '../hooks/useExclusions'
import { Table } from '@restaurant-pos/ui'
import { getExclusionsTableColumns } from '../lib/constants'
import type { ExclusionTable } from '../model/types'
import { AddExclusionModal } from '../../../features/add-exclusion-modal'
import * as Styled from './styled'

export const Exclusions = () => {
  const {
    exclusions,
    isLoading,
    error,
    searchQuery,
    totalExclusionsCount,
    isModalOpen,
    editingExclusionId,
    handleSearchChange,
    handleBack,
    handleEdit,
    handleAdd,
    handleCloseModal,
    handleSuccess,
    handleExport,
    handlePrint,
    handleColumns,
    handleDelete
  } = useExclusions()

  const columns = getExclusionsTableColumns({
    onEdit: handleEdit,
    onDelete: handleDelete
  })

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка исключений...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>
          Ошибка при загрузке исключений: {(error as Error).message}
        </Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Исключения {totalExclusionsCount}</Styled.Title>
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
          dataSource={exclusions}
          rowKey="id"
          onRow={(record: ExclusionTable) => ({
            onClick: () => handleEdit(record.id)
          })}
        />
      </Styled.TableContainer>

      <AddExclusionModal
        isOpen={isModalOpen}
        exclusionId={editingExclusionId}
        onSuccess={handleSuccess}
        onClose={handleCloseModal}
      />
    </Styled.PageContainer>
  )
}
