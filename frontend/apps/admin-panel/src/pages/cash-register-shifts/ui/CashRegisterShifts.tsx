import { useCashRegisterShifts } from '../hooks/useCashRegisterShifts'
import {
  formatDateTime,
  formatCurrency,
  formatDifference,
  getStatusText,
  calculateEncashment,
} from '../lib'
import * as Styled from './styled'

export const CashRegisterShifts = () => {
  const {
    shifts,
    isLoading,
    searchQuery,
    isDeleting,
    handleBack,
    handleSearchChange,
    handleDelete,
  } = useCashRegisterShifts()

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка кассовых смен...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  const hasShifts = shifts.length > 0
  const showEmptyState = !hasShifts
  const showNoResults = hasShifts && shifts.length === 0

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Кассовые смены</Styled.Title>
        </Styled.HeaderLeft>
        <Styled.HeaderActions>
          <Styled.ActionButton>
            <span>🗑️</span>
            Корзина
          </Styled.ActionButton>
          <Styled.ActionButton>
            <span>📋</span>
            Столбцы
          </Styled.ActionButton>
          <Styled.ActionButton>
            <span>📤</span>
            Экспорт
          </Styled.ActionButton>
          <Styled.ActionButton>
            <span>🖨️</span>
            Печать
          </Styled.ActionButton>
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
        {showEmptyState && (
          <Styled.EmptyState>
            <Styled.EmptyIcon>🕐</Styled.EmptyIcon>
            <Styled.EmptyText>Кассовые смены не найдены</Styled.EmptyText>
            <Styled.EmptySubtext>Создайте смену через POS терминал</Styled.EmptySubtext>
          </Styled.EmptyState>
        )}

        {showNoResults && (
          <Styled.NoResultsMessage>
            Не найдено кассовых смен, соответствующих критериям поиска
          </Styled.NoResultsMessage>
        )}

        {hasShifts && shifts.length > 0 && (
          <Styled.Table>
            <Styled.TableHeader>
              <tr>
                <Styled.TableHeadCell $width={60}>№</Styled.TableHeadCell>
                <Styled.TableHeadCell>Статус</Styled.TableHeadCell>
                <Styled.TableHeadCell>Начало смены</Styled.TableHeadCell>
                <Styled.TableHeadCell>Смена закрыта</Styled.TableHeadCell>
                <Styled.TableHeadCell $align="right">Инкассация</Styled.TableHeadCell>
                <Styled.TableHeadCell $align="right">В кассе</Styled.TableHeadCell>
                <Styled.TableHeadCell $align="right">Разница</Styled.TableHeadCell>
                <Styled.TableHeadCell $width={80} $align="center">Действия</Styled.TableHeadCell>
              </tr>
            </Styled.TableHeader>
            <tbody>
              {shifts.map((shift) => {
                const encashment = calculateEncashment(shift)
                return (
                  <Styled.TableRow key={shift.id}>
                    <Styled.TableCell>{shift.number}</Styled.TableCell>
                    <Styled.TableCell>
                      <Styled.StatusBadge $status={shift.isOpen ? 'open' : 'closed'}>
                        {getStatusText(shift.isOpen ? 'open' : 'closed')}
                      </Styled.StatusBadge>
                    </Styled.TableCell>
                    <Styled.TableCell>{formatDateTime(shift.openedAt)}</Styled.TableCell>
                    <Styled.TableCell>
                      {shift.closedAt ? formatDateTime(shift.closedAt) : '-'}
                    </Styled.TableCell>
                    <Styled.TableCell $align="right">
                      {encashment > 0 ? formatCurrency(encashment) : '-'}
                    </Styled.TableCell>
                    <Styled.TableCell $align="right">
                      {formatCurrency(shift.inCash)}
                    </Styled.TableCell>
                    <Styled.TableCell $align="right">
                      {formatDifference(shift.difference, shift.isOpen ? 'open' : 'closed')}
                    </Styled.TableCell>
                    <Styled.TableCell $align="center">
                      <Styled.ActionCell>
                        <Styled.ActionIconButton
                          onClick={() => handleDelete(shift.id)}
                          disabled={isDeleting}
                          title="Удалить"
                        >
                          🗑️
                        </Styled.ActionIconButton>
                      </Styled.ActionCell>
                    </Styled.TableCell>
                  </Styled.TableRow>
                )
              })}
            </tbody>
          </Styled.Table>
        )}
      </Styled.TableContainer>
    </Styled.PageContainer>
  )
}
