import { Workshop } from '../model/types'

interface WorkshopTableProps {
  onEdit: (id: string) => void
}

export const getWorkshopsTableColumns = ({ onEdit }: WorkshopTableProps) => [
  {
    title: 'Название',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    render: (text: string) => <span style={{ fontWeight: '500' }}>{text}</span>
  },
  {
    title: 'Печатать бегунки',
    dataIndex: 'print_slips',
    key: 'print_slips',
    sorter: true,
    render: (print_slips: boolean) => <span>{print_slips ? 'Да' : 'Нет'}</span>
  },
  {
    title: 'Действия',
    dataIndex: 'actions',
    key: 'actions',
    align: 'center' as const,
    width: 150,
    render: (_: unknown, record: Workshop) => (
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
          }}
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
          title="Дополнительно"
        >
          ...
        </button>
      </div>
    )
  }
]

