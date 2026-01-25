import type { TableColumn } from '@restaurant-pos/ui'
import type { InventoryListItem } from '../model/types'

interface InventoryTableProps {
  onEdit: (id: string) => void
}

export const getInventoriesTableColumns = ({
  onEdit,
}: InventoryTableProps): TableColumn<InventoryListItem>[] => [
  {
    title: 'Склад',
    dataIndex: 'warehouse',
    key: 'warehouse',
    sorter: true,
    render: (text: string) => <span style={{ fontWeight: '500' }}>{text}</span>,
  },
  {
    title: 'Начало периода',
    dataIndex: 'period_start',
    key: 'period_start',
    sorter: true,
    render: (value?: string) => {
      if (!value) return '—'
      return new Date(value).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    },
  },
  {
    title: 'Дата и время проведения',
    dataIndex: 'date_time',
    key: 'date_time',
    sorter: true,
  },
  {
    title: 'Тип',
    dataIndex: 'type',
    key: 'type',
    sorter: true,
    render: (value: 'full' | 'partial') => (
      <span>{value === 'full' ? 'Полная' : 'Частичная'}</span>
    ),
  },
  {
    title: 'Результат',
    dataIndex: 'result',
    key: 'result',
    align: 'right',
    render: (value: string) => <span>{value}</span>,
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status',
    sorter: true,
    render: (value: string) => {
      const statusLabels: Record<string, string> = {
        draft: 'Черновик',
        in_progress: 'В процессе',
        completed: 'Завершена',
        cancelled: 'Отменена',
      }
      const statusColors: Record<string, string> = {
        draft: '#64748b',
        in_progress: '#3b82f6',
        completed: '#10b981',
        cancelled: '#ef4444',
      }
      return (
        <span
          style={{
            color: statusColors[value] || '#64748b',
            fontWeight: '500',
          }}
        >
          {statusLabels[value] || value}
        </span>
      )
    },
  },
  {
    title: 'Действия',
    dataIndex: 'actions',
    key: 'actions',
    align: 'center',
    width: 100,
    render: (_: unknown, record: InventoryListItem) => (
      <button
        onClick={(e) => {
          e.stopPropagation()
          onEdit(record.id)
        }}
        style={{
          padding: '4px 12px',
          fontSize: '12px',
          fontWeight: '500',
          color: '#3b82f6',
          background: 'transparent',
          border: '1px solid #3b82f6',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#3b82f6'
          e.currentTarget.style.color = 'white'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#3b82f6'
        }}
      >
        Открыть
      </button>
    ),
  },
]

