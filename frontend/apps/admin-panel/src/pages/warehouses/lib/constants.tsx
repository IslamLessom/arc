import { Warehouse } from '../model/types'

interface WarehouseTableProps {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export const getWarehousesTableColumns = ({ onEdit, onDelete }: WarehouseTableProps) => [
  {
    title: '#',
    dataIndex: 'id',
    key: 'id',
    sorter: true,
    width: 60,
    render: (_: string, _record: Warehouse, index: number) => <span>{index + 1}</span>
  },
  {
    title: 'Название',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    render: (text: string) => <span style={{ fontWeight: '500' }}>{text}</span>
  },
  {
    title: 'Адрес',
    dataIndex: 'address',
    key: 'address',
    sorter: true
  },
  {
    title: 'Сумма',
    dataIndex: 'amount',
    key: 'amount',
    align: 'right' as const,
    render: (amount: number) => <span>{amount.toFixed(2)} ₽</span>
  },
  {
    title: 'Действия',
    dataIndex: 'actions',
    key: 'actions',
    align: 'center' as const,
    width: 150,
    render: (_: unknown, record: Warehouse) => (
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
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
            transition: 'all 0.2s'
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
          Ред.
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (window.confirm('Вы уверены, что хотите удалить этот склад?')) {
              onDelete(record.id)
            }
          }}
          style={{
            padding: '4px 8px',
            fontSize: '14px',
            color: '#ef4444',
            background: 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fee2e2'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
          title="Удалить"
        >
          ...
        </button>
      </div>
    )
  }
]

