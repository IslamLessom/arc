import { useProfitAndLoss } from '../hooks/useProfitAndLoss'
import * as Styled from './styled'

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const ProfitAndLoss = () => {
  const { isLoading, report, handleBack, handleExport, handlePrint } = useProfitAndLoss()

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка отчёта P&L...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (!report) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Нет данных для отображения</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  const netProfitType = report.netProfit >= 0 ? ('positive' as const) : ('negative' as const)

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>P&L (Отчёт о прибылях и убытках)</Styled.Title>
          <Styled.Period>{formatDate(report.startDate)} - {formatDate(report.endDate)}</Styled.Period>
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

      <Styled.ContentContainer>
        <Styled.Section>
          <Styled.SectionTitle>Доходы</Styled.SectionTitle>
          <Styled.DataRow>
            <Styled.DataLabel>Выручка</Styled.DataLabel>
            <Styled.DataValue type="positive">{formatCurrency(report.revenue)}</Styled.DataValue>
          </Styled.DataRow>
          <Styled.DataRow>
            <Styled.DataLabel>Прочие доходы</Styled.DataLabel>
            <Styled.DataValue type="positive">{formatCurrency(report.otherIncome)}</Styled.DataValue>
          </Styled.DataRow>
          <Styled.DataRow>
            <Styled.DataLabel bold>Всего доходов</Styled.DataLabel>
            <Styled.DataValue type="positive" bold>{formatCurrency(report.totalIncome)}</Styled.DataValue>
          </Styled.DataRow>
        </Styled.Section>

        <Styled.Section>
          <Styled.SectionTitle>Расходы</Styled.SectionTitle>
          <Styled.DataRow>
            <Styled.DataLabel>Себестоимость товаров</Styled.DataLabel>
            <Styled.DataValue type="negative">{formatCurrency(report.costOfGoods)}</Styled.DataValue>
          </Styled.DataRow>
          <Styled.DataRow>
            <Styled.DataLabel>Зарплата</Styled.DataLabel>
            <Styled.DataValue type="negative">{formatCurrency(report.salary)}</Styled.DataValue>
          </Styled.DataRow>
          <Styled.DataRow>
            <Styled.DataLabel>Аренда</Styled.DataLabel>
            <Styled.DataValue type="negative">{formatCurrency(report.rent)}</Styled.DataValue>
          </Styled.DataRow>
          <Styled.DataRow>
            <Styled.DataLabel>Прочие расходы</Styled.DataLabel>
            <Styled.DataValue type="negative">{formatCurrency(report.otherExpenses)}</Styled.DataValue>
          </Styled.DataRow>
          <Styled.DataRow>
            <Styled.DataLabel bold>Всего расходов</Styled.DataLabel>
            <Styled.DataValue type="negative" bold>{formatCurrency(report.totalExpenses)}</Styled.DataValue>
          </Styled.DataRow>
        </Styled.Section>

        <Styled.SummarySection>
          <Styled.SummaryLabel>Чистая прибыль</Styled.SummaryLabel>
          <Styled.SummaryValue type={netProfitType}>{formatCurrency(report.netProfit)}</Styled.SummaryValue>
        </Styled.SummarySection>
      </Styled.ContentContainer>
    </Styled.PageContainer>
  )
}
