import { SupplierTable } from '../model/types'

interface SupplierTableProps {
  onEdit: (id: string) => void
}

export const getSuppliersTableColumns = ({ onEdit }: SupplierTableProps) => [
  {
    title: 'Имя',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    render: (text: string) => <span style={{ fontWeight: '500' }}>{text}</span>
  },
  {
    title: 'Телефон',
    dataIndex: 'phone',
    key: 'phone',
    render: (phone: string) => phone || '-'
  },
  {
    title: 'Адрес',
    dataIndex: 'address',
    key: 'address',
    render: (address: string) => address || '-'
  },
  {
    title: 'Комментарий',
    dataIndex: 'comment',
    key: 'comment',
    render: (comment: string) => comment || '-'
  },
  {
    title: 'Количество поставок',
    dataIndex: 'deliveriesCount',
    key: 'deliveriesCount',
    align: 'center' as const,
    render: (count: number) => <span>{count}</span>
  },
  {
    title: 'Сумма поставок',
    dataIndex: 'deliveriesAmount',
    key: 'deliveriesAmount',
    align: 'right' as const,
    render: (amount: number) => <span>{amount.toFixed(2)} ₽</span>
  },
  {
    title: 'Сумма задолженности',
    dataIndex: 'debtAmount',
    key: 'debtAmount',
    align: 'right' as const,
    render: (amount: number) => (
      <span style={{ color: amount > 0 ? '#ef4444' : '#64748b' }}>
        {amount.toFixed(2)} ₽
      </span>
    )
  },
  {
    title: 'Действия',
    dataIndex: 'actions',
    key: 'actions',
    align: 'center' as const,
    width: 150,
    render: (_: unknown, record: SupplierTable) => (
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
          style={{
            padding: '4px 8px',
            fontSize: '14px',
            color: '#64748b',
            background: 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f1f5f9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
          title="Дополнительные действия"
        >
          ...
        </button>
      </div>
    )
  }
]

