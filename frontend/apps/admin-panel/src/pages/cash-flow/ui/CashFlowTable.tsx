import type { CashFlowRow, MonthData } from '../lib/types'
import { formatMoney } from '../lib/cashFlowUtils'
import * as Styled from './styled'

interface CashFlowTableProps {
  months: MonthData[]
  rows: CashFlowRow[]
  expandedRows: Set<string>
  getCellValue: (row: CashFlowRow, monthIndex: number) => number
  getTotalForRow: (row: CashFlowRow) => number
  isRowVisible: (row: CashFlowRow) => boolean
  onToggleRow: (rowId: string) => void
}

export const CashFlowTable = ({
  months,
  rows,
  expandedRows,
  getCellValue,
  getTotalForRow,
  isRowVisible,
  onToggleRow
}: CashFlowTableProps) => {
  const getAmountType = (rowType: CashFlowRow['type']): 'income' | 'expense' | 'balance' | 'net' | 'transfer' => {
    switch (rowType) {
      case 'income':
        return 'income'
      case 'expense':
        return 'expense'
      case 'startBalance':
      case 'endBalance':
        return 'balance'
      case 'netCashFlow':
        return 'net'
      case 'transfer':
        return 'transfer'
      default:
        return 'balance'
    }
  }

  return (
    <Styled.TableContainer>
      <Styled.Table>
        <Styled.TableHead>
          <tr>
            <Styled.TableHeadCell $width="30%">Показатель</Styled.TableHeadCell>
            {months.map((month, index) => (
              <Styled.TableHeadCell key={month.label} $width="17%" $align="right">
                {month.label}
              </Styled.TableHeadCell>
            ))}
            <Styled.TableHeadCell $width="17%" $align="right">
              За период
            </Styled.TableHeadCell>
          </tr>
        </Styled.TableHead>

        <Styled.TableBody>
          {rows.filter(isRowVisible).map(row => {
            const totalValue = getTotalForRow(row)
            const isExpandable = row.level === 0 && rows.some(r => r.parentId === row.id)
            const isExpanded = expandedRows.has(row.id)

            return (
              <Styled.TableRow
                key={row.id}
                $level={row.level}
                $isHeader={row.level === 0}
              >
                <Styled.RowLabelCell $level={row.level}>
                  {isExpandable && (
                    <Styled.ExpandIcon
                      $isExpanded={isExpanded}
                      onClick={() => onToggleRow(row.id)}
                    >
                      ▾
                    </Styled.ExpandIcon>
                  )}
                  {!isExpandable && row.level === 1 && <span style={{ width: '16px' }} />}
                  {row.label}
                </Styled.RowLabelCell>

                {months.map((month, monthIndex) => {
                  const value = getCellValue(row, monthIndex)
                  const isNegative = value < 0
                  return (
                    <Styled.AmountCell
                      key={`${row.id}-${month.label}`}
                      $type={getAmountType(row.type)}
                      $align="right"
                      $isBold={row.level === 0}
                      $isNegative={isNegative}
                    >
                      {row.type === 'transfer' ? '' : row.type === 'expense' && row.level === 0 ? '-' : ''}
                      {row.type === 'transfer' ? '' : row.type === 'expense' && row.level === 1 ? '-' : ''}
                      {formatMoney(Math.abs(value))}
                    </Styled.AmountCell>
                  )
                })}

                <Styled.AmountCell
                  $type={getAmountType(row.type)}
                  $align="right"
                  $isBold={row.level === 0}
                  $isNegative={totalValue < 0}
                >
                  {row.type === 'transfer' ? '' : row.type === 'expense' && row.level === 0 ? '-' : ''}
                  {row.type === 'transfer' ? '' : row.type === 'expense' && row.level === 1 ? '-' : ''}
                  {formatMoney(Math.abs(totalValue))}
                </Styled.AmountCell>
              </Styled.TableRow>
            )
          })}
        </Styled.TableBody>
      </Styled.Table>
    </Styled.TableContainer>
  )
}
