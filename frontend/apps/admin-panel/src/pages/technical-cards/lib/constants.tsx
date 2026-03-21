import { TechnicalCard } from '../model/types'

interface TechnicalCardTableProps {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export const getTechnicalCardsTableColumns = ({ onEdit, onDelete }: TechnicalCardTableProps) => [
  {
    title: 'Наименование',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    render: (value: unknown) => <span style={{ fontWeight: '500' }}>{value as string}</span>
  },
  {
    title: 'Категория',
    dataIndex: 'category',
    key: 'category',
    sorter: true,
    render: (value: unknown) => <span>{(value as string) || '-'}</span>
  },
  {
    title: 'Ингредиенты',
    dataIndex: 'ingredients',
    key: 'ingredients',
    align: 'center' as const,
    render: (value: unknown) => <span>{value as number} шт.</span>
  },
  {
    title: 'Выход, г',
    dataIndex: 'weight',
    key: 'weight',
    align: 'center' as const,
    sorter: true,
    render: (value: unknown) => {
      const weight = value as number
      return (
        <span style={{ fontWeight: '500' }}>
          {weight > 0 ? `${weight} г` : '-'}
        </span>
      )
    }
  },
  {
    title: 'Себестоимость, ₽',
    dataIndex: 'cost',
    key: 'cost',
    align: 'right' as const,
    render: (value: unknown) => <span>{(value as number).toFixed(2)}</span>
  },
  {
    title: 'Цена, ₽',
    dataIndex: 'price',
    key: 'price',
    align: 'right' as const,
    render: (value: unknown) => <span>{(value as number).toFixed(2)}</span>
  },
  {
    title: 'Наценка, %',
    dataIndex: 'margin',
    key: 'margin',
    align: 'right' as const,
    render: (value: unknown) => {
      const margin = value as number
      return (
        <span style={{ color: margin > 50 ? '#10b981' : '#f59e0b' }}>
          {margin.toFixed(1)}
        </span>
      )
    }
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status',
    align: 'center' as const,
    render: (value: unknown) => {
      const status = value as string
      return (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: status === 'active' ? '#dcfce7' : '#fee2e2',
            color: status === 'active' ? '#166534' : '#991b1b'
          }}
        >
          {status === 'active' ? 'Активна' : 'Неактивна'}
        </span>
      )
    }
  },
  {
    title: 'Изменено',
    dataIndex: 'lastModified',
    key: 'lastModified',
    align: 'center' as const,
    render: (value: unknown) => <span>{value as string}</span>
  },
  {
    title: 'Действия',
    dataIndex: 'actions',
    key: 'actions',
    align: 'center' as const,
    width: 150,
    render: (_: unknown, record: TechnicalCard) => (
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
            if (window.confirm('Вы уверены, что хотите удалить эту техкарту?')) {
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
          🗑️
        </button>
      </div>
    )
  }
]

// Keep backward compatibility
export const TECHNICAL_CARDS_TABLE_COLUMNS = getTechnicalCardsTableColumns({
  onEdit: (id: string) => console.log('Edit', id),
  onDelete: (id: string) => console.log('Delete', id)
})