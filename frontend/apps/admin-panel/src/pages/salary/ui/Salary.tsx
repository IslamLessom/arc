import { useSalary } from '../hooks/useSalary'
import { formatCurrency, formatNumber } from './lib/formatUtils'
import * as Styled from './styled'

export const Salary = () => {
  const { isLoading, error, report, handleBack, handleDateChange } = useSalary()

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка данных о зарплате...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.Header>
          <Styled.HeaderLeft>
            <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
            <Styled.Title>Зарплата</Styled.Title>
          </Styled.HeaderLeft>
        </Styled.Header>
        <Styled.ErrorMessage>Ошибка при загрузке данных: {(error as Error).message}</Styled.ErrorMessage>
      </Styled.PageContainer>
    )
  }

  const entries = report?.entries || []

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Зарплата</Styled.Title>
        </Styled.HeaderLeft>
        <Styled.HeaderActions>
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

      <Styled.FilterContainer>
        <Styled.DateFilter>
          <Styled.DateLabel>Период с:</Styled.DateLabel>
          <Styled.DateInput
            type="date"
            value={report?.start_date ? new Date(report.start_date).toISOString().split('T')[0] : ''}
            onChange={(e) => {
              if (report) {
                const start = new Date(e.target.value).toISOString()
                handleDateChange(start, report.end_date)
              }
            }}
          />
          <Styled.DateLabel>по:</Styled.DateLabel>
          <Styled.DateInput
            type="date"
            value={report?.end_date ? new Date(report.end_date).toISOString().split('T')[0] : ''}
            onChange={(e) => {
              if (report) {
                const end = new Date(e.target.value).toISOString()
                handleDateChange(report.start_date, end)
              }
            }}
          />
        </Styled.DateFilter>
      </Styled.FilterContainer>

      <Styled.TableContainer>
        {entries.length === 0 ? (
          <Styled.EmptyState>
            <Styled.EmptyIcon>💸</Styled.EmptyIcon>
            <Styled.EmptyText>Данные о зарплате отсутствуют</Styled.EmptyText>
            <Styled.EmptySubtext>За выбранный период нет данных о сменах сотрудников</Styled.EmptySubtext>
          </Styled.EmptyState>
        ) : (
          <Styled.Table>
            <Styled.TableHeader>
              <tr>
                <Styled.TableCell $width="200px">Сотрудник</Styled.TableCell>
                <Styled.TableCell $width="150px">Должность</Styled.TableCell>
                <Styled.TableCell $align="right" $width="120px">Месячная ставка</Styled.TableCell>
                <Styled.TableCell $align="right" $width="100px">Часы</Styled.TableCell>
                <Styled.TableCell $align="center" $width="80px">Смены</Styled.TableCell>
                <Styled.TableCell $align="right" $width="120px">% от продаж за смены</Styled.TableCell>
                <Styled.TableCell $align="right" $width="120px">Итого</Styled.TableCell>
              </tr>
            </Styled.TableHeader>
            <tbody>
              {entries.map((entry) => (
                <Styled.TableRow key={entry.employee_id}>
                  <Styled.TableData>{entry.employee_name}</Styled.TableData>
                  <Styled.TableData>{entry.position_name}</Styled.TableData>
                  <Styled.TableData $align="right">
                    {entry.monthly_rate ? formatCurrency(entry.monthly_rate) : '-'}
                  </Styled.TableData>
                  <Styled.TableData $align="right">
                    {formatNumber(entry.hours_worked)}
                    {entry.hourly_rate && (
                      <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '4px' }}>
                        ({formatCurrency(entry.hourly_rate)}/ч)
                      </span>
                    )}
                  </Styled.TableData>
                  <Styled.TableData $align="center">{entry.shifts_worked}</Styled.TableData>
                  <Styled.TableData $align="right">
                    {entry.shift_sales_commission > 0 ? (
                      <>
                        {formatCurrency(entry.shift_sales_commission)}
                        {entry.shift_sales_percentage && (
                          <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '4px' }}>
                            ({entry.shift_sales_percentage}% от {formatCurrency(entry.shift_sales_amount)})
                          </span>
                        )}
                      </>
                    ) : (
                      '-'
                    )}
                  </Styled.TableData>
                  <Styled.TableData $align="right">
                    <Styled.SalaryValue $highlight>
                      {formatCurrency(entry.total_salary)}
                    </Styled.SalaryValue>
                  </Styled.TableData>
                </Styled.TableRow>
              ))}
              <Styled.TotalRow>
                <Styled.TotalCell $align="left" colSpan={6}>
                  Итого по всем сотрудникам:
                </Styled.TotalCell>
                <Styled.TotalCell $align="right">
                  <Styled.SalaryValue $highlight>
                    {formatCurrency(report?.total_salary || 0)}
                  </Styled.SalaryValue>
                </Styled.TotalCell>
              </Styled.TotalRow>
            </tbody>
          </Styled.Table>
        )}
      </Styled.TableContainer>
    </Styled.PageContainer>
  )
}
