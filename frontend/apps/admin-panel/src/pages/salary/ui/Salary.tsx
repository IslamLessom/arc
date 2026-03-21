import { useSalary } from '../hooks/useSalary'
import { formatCurrency, formatNumber } from './lib/formatUtils'
import { PaySalaryModal } from './PaySalaryModal'
import type { SalaryEntry } from '@restaurant-pos/api-client'
import { getPositionName } from '../../positions/lib/positionNameMap'
import * as Styled from './styled'

export const Salary = () => {
  const {
    isLoading,
    error,
    report,
    isCreatingAdvance,
    isPayingSalary,
    paymentModal,
    handleBack,
    handleDateChange,
    handleGiveAdvance,
    handleOpenPaymentModal,
    handleClosePaymentModal,
    handleConfirmPayment,
  } = useSalary()

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
  const totalAdvances = entries.reduce((sum: number, entry: SalaryEntry) => sum + entry.advances_given, 0)
  const totalToPay = entries.reduce((sum: number, entry: SalaryEntry) => sum + entry.total_to_pay_after_advances, 0)

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
                <Styled.TableCell $width="140px">Сотрудник</Styled.TableCell>
                <Styled.TableCell $width="110px">Должность</Styled.TableCell>
                <Styled.TableCell $align="right" $width="90px">Мес. ставка</Styled.TableCell>
                <Styled.TableCell $align="right" $width="70px">Часы</Styled.TableCell>
                <Styled.TableCell $align="center" $width="60px">Смены</Styled.TableCell>
                <Styled.TableCell $align="right" $width="100px">% личн.</Styled.TableCell>
                <Styled.TableCell $align="right" $width="100px">% смены</Styled.TableCell>
                <Styled.TableCell $align="right" $width="90px">Начислено</Styled.TableCell>
                <Styled.TableCell $align="right" $width="90px">Авансы</Styled.TableCell>
                <Styled.TableCell $align="right" $width="90px">К выплате</Styled.TableCell>
                <Styled.TableCell $align="center" $width="160px">Действия</Styled.TableCell>
              </tr>
            </Styled.TableHeader>
            <tbody>
              {entries.map((entry: SalaryEntry) => (
                <Styled.TableRow key={entry.employee_id}>
                  <Styled.TableData>{entry.employee_name}</Styled.TableData>
                  <Styled.TableData>{getPositionName(entry.position_name)}</Styled.TableData>
                  <Styled.TableData $align="right">
                    {entry.monthly_rate ? formatCurrency(entry.monthly_rate) : '-'}
                  </Styled.TableData>
                  <Styled.TableData $align="right">
                    {formatNumber(entry.hours_worked)}
                    {entry.hourly_rate && (
                      <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '4px', display: 'block' }}>
                        ({formatCurrency(entry.hourly_rate)}/ч)
                      </span>
                    )}
                  </Styled.TableData>
                  <Styled.TableData $align="center">{entry.shifts_worked}</Styled.TableData>
                  <Styled.TableData $align="right">
                    {entry.personal_sales_commission > 0 ? (
                      <>
                        {formatCurrency(entry.personal_sales_commission)}
                        {entry.personal_sales_percentage && (
                          <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '2px', display: 'block' }}>
                            {entry.personal_sales_percentage}%
                          </span>
                        )}
                      </>
                    ) : (
                      '-'
                    )}
                  </Styled.TableData>
                  <Styled.TableData $align="right">
                    {entry.shift_sales_commission > 0 ? (
                      <>
                        {formatCurrency(entry.shift_sales_commission)}
                        {entry.shift_sales_percentage && (
                          <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '2px', display: 'block' }}>
                            {entry.shift_sales_percentage}%
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
                  <Styled.TableData $align="right">
                    {entry.advances_given > 0 ? formatCurrency(entry.advances_given) : '-'}
                  </Styled.TableData>
                  <Styled.TableData $align="right">
                    <Styled.SalaryValue $highlight>
                      {formatCurrency(entry.total_to_pay_after_advances)}
                    </Styled.SalaryValue>
                  </Styled.TableData>
                  <Styled.TableData $align="center">
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <Styled.ActionButton
                        onClick={() => handleGiveAdvance(entry.employee_id, entry.employee_name)}
                        disabled={isCreatingAdvance}
                        style={{ fontSize: '12px', padding: '6px 10px' }}
                      >
                        + Аванс
                      </Styled.ActionButton>
                      <Styled.PayButton
                        onClick={() =>
                          handleOpenPaymentModal(
                            entry.employee_id,
                            entry.employee_name,
                            entry.total_salary,
                            entry.advances_given,
                            entry.total_to_pay_after_advances
                          )
                        }
                        disabled={isPayingSalary || entry.total_to_pay_after_advances <= 0}
                        style={{ fontSize: '12px', padding: '6px 10px' }}
                      >
                        💰 Выплатить
                      </Styled.PayButton>
                    </div>
                  </Styled.TableData>
                </Styled.TableRow>
              ))}
              <Styled.TotalRow>
                <Styled.TotalCell $align="left" colSpan={7}>
                  Итого по всем сотрудникам:
                </Styled.TotalCell>
                <Styled.TotalCell $align="right">
                  <Styled.SalaryValue $highlight>
                    {formatCurrency(report?.total_salary || 0)}
                  </Styled.SalaryValue>
                </Styled.TotalCell>
                <Styled.TotalCell $align="right">{formatCurrency(totalAdvances)}</Styled.TotalCell>
                <Styled.TotalCell $align="right">
                  <Styled.SalaryValue $highlight>{formatCurrency(totalToPay)}</Styled.SalaryValue>
                </Styled.TotalCell>
                <Styled.TotalCell $align="center">-</Styled.TotalCell>
              </Styled.TotalRow>
            </tbody>
          </Styled.Table>
        )}
      </Styled.TableContainer>

      {paymentModal && (
        <PaySalaryModal
          employeeId={paymentModal.employeeId}
          employeeName={paymentModal.employeeName}
          totalSalary={paymentModal.totalSalary}
          advancesDeducted={paymentModal.advancesDeducted}
          amountToPay={paymentModal.amountToPay}
          periodStart={report?.start_date || ''}
          periodEnd={report?.end_date || ''}
          onClose={handleClosePaymentModal}
          onConfirm={handleConfirmPayment}
          isProcessing={isPayingSalary}
        />
      )}
    </Styled.PageContainer>
  )
}
