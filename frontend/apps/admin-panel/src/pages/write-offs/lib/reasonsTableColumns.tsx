import type { TableColumn } from '@restaurant-pos/ui'
import type { WriteOffReason } from '../model/types'
import { WriteOffReasonPnlBlock } from '../model/types'

interface ReasonsTableProps {
  onEdit?: (reason: WriteOffReason) => void
  onDelete?: (id: string) => void
}

type ReasonTableRow = WriteOffReason & { id: string }

export const getReasonsTableColumns = (props: ReasonsTableProps = {}): TableColumn<ReasonTableRow>[] => [
  {
    title: 'Название',
    dataIndex: 'name',
    key: 'name',
    render: (name: string, record: ReasonTableRow) => (
      <span style={{ fontWeight: record.id === 'total' ? '600' : '400' }}>
        {name || '-'}
      </span>
    )
  },
  {
    title: 'Блок в P&L',
    dataIndex: 'pnlBlock',
    key: 'pnlBlock',
    render: (pnlBlock: WriteOffReasonPnlBlock | null, record: ReasonTableRow) => {
      if (record.id === 'total') {
        return <span>-</span>
      }
      return (
        <span>
          {pnlBlock === WriteOffReasonPnlBlock.COST ? 'Себестоимость' : 'Расходы'}
        </span>
      )
    }
  },
  {
    title: 'Количество списаний',
    dataIndex: 'writeOffCount',
    key: 'writeOffCount',
    align: 'right',
    render: (count: number, record: ReasonTableRow) => (
      <span style={{ fontWeight: record.id === 'total' ? '600' : '400' }}>
        {count}
      </span>
    )
  },
  {
    title: 'Стоимость продуктов',
    dataIndex: 'totalCost',
    key: 'totalCost',
    align: 'right',
    render: (cost: number, record: ReasonTableRow) => (
      <span style={{ fontWeight: record.id === 'total' ? '600' : '400' }}>
        {cost.toFixed(2)} ₽
      </span>
    )
  },
  {
    title: 'Действия',
    key: 'actions',
    render: (_: unknown, record: ReasonTableRow) => {
      if (record.id === 'total') {
        return <span>-</span>
      }
      return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => props.onEdit?.(record as WriteOffReason)}
            style={{
              padding: '4px 8px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#64748b',
            }}
          >
            Ред.
          </button>
          <button
            onClick={() => {
              if (confirm(`Удалить причину "${record.name}"?`)) {
                props.onDelete?.(record.id)
              }
            }}
            style={{
              padding: '4px 8px',
              border: '1px solid #ef4444',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#ef4444',
            }}
          >
            Удалить
          </button>
        </div>
      )
    }
  },
]

