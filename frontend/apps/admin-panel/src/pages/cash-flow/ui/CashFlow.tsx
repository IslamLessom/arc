import { useCashFlow } from '../hooks/useCashFlow'
import { CashFlowTable } from './CashFlowTable'
import { AccountFilter } from './AccountFilter'
import * as Styled from './styled'

export const CashFlow = () => {
  const {
    isLoading,
    months,
    rows,
    accounts,
    expandedRows,
    selectedAccountIds,
    getCellValue,
    getTotalForRow,
    isRowVisible,
    toggleRowExpansion,
    handleBack,
    handleExport,
    handlePrint,
    handleAccountToggle
  } = useCashFlow()

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка данных о потоке денег...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  const hasData = rows.length > 0 && months.length > 0

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Поток денег</Styled.Title>
        </Styled.HeaderLeft>
        <Styled.HeaderActions>
          <Styled.ActionButton onClick={handleExport}>
            <span>📤</span>
            Экспорт
          </Styled.ActionButton>
          <Styled.ActionButton onClick={handlePrint}>
            <span>🖨️</span>
            Печать
          </Styled.ActionButton>
        </Styled.HeaderActions>
      </Styled.Header>

      <Styled.InfoBanner>
        Это новая версия отчета о движении денежных средств. Нажмите на название категории, чтобы развернуть или свернуть детализацию.
        Нажмите на ячейку с суммой, чтобы увидеть детализацию по операциям.
      </Styled.InfoBanner>

      <AccountFilter
        accounts={accounts}
        selectedAccountIds={selectedAccountIds}
        onAccountToggle={handleAccountToggle}
      />

      {!hasData ? (
        <Styled.TableContainer>
          <Styled.EmptyState>
            <Styled.EmptyIcon>💵</Styled.EmptyIcon>
            <Styled.EmptyText>Данные о потоке денег отсутствуют</Styled.EmptyText>
            <Styled.EmptySubtext>
              За выбранный период нет транзакций. Выберите другой период или измените параметры фильтрации.
            </Styled.EmptySubtext>
          </Styled.EmptyState>
        </Styled.TableContainer>
      ) : (
        <CashFlowTable
          months={months}
          rows={rows}
          expandedRows={expandedRows}
          getCellValue={getCellValue}
          getTotalForRow={getTotalForRow}
          isRowVisible={isRowVisible}
          onToggleRow={toggleRowExpansion}
        />
      )}
    </Styled.PageContainer>
  )
}

