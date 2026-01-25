import { useWorkshops } from '../hooks/useWorkshops'
import { Table, Button } from '@restaurant-pos/ui'
import { ButtonVariant } from '@restaurant-pos/ui'
import { AddWorkshopModal } from '../../../features/add-workshop-modal'
import { getWorkshopsTableColumns } from '../lib/constants'
import * as Styled from './styled'

export const Workshops = () => {
  const {
    workshops,
    isLoading,
    error,
    searchQuery,
    sort,
    totalWorkshopsCount,
    isModalOpen,
    editingWorkshopId,
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
  } = useWorkshops()

  const columns = getWorkshopsTableColumns({
    onEdit: handleEdit
  })

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка цехов...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>
          Ошибка при загрузке цехов: {error.message}
        </Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Button variant={ButtonVariant.Outline} onClick={handleBack}>←</Button>
          <Styled.Title>Цехи {totalWorkshopsCount}</Styled.Title>
        </Styled.HeaderLeft>
        <Styled.HeaderActions>
          <Button variant={ButtonVariant.Outline} onClick={handleColumns} icon={<span>📋</span>}>
            Столбцы
          </Button>
          <Button variant={ButtonVariant.Outline} onClick={handleExport} icon={<span>📤</span>}>
            Экспорт
          </Button>
          <Button variant={ButtonVariant.Outline} onClick={handlePrint} icon={<span>🖨️</span>}>
            Печать
          </Button>
          <Button variant={ButtonVariant.Primary} onClick={handleAdd}>Добавить</Button>
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
          dataSource={workshops}
          onRowClick={(record) => handleEdit(record.id)}
          emptyMessage="Нет цехов"
        />
      </Styled.TableContainer>

      <AddWorkshopModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        workshopId={editingWorkshopId || undefined}
      />
    </Styled.PageContainer>
  )
}

