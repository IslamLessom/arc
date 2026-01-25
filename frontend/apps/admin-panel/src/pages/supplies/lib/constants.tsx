import { SupplyTable } from '../model/types'
import { SupplyStatus } from '../model/enums'

interface SuppliesTableProps {
  onEdit: (id: string) => void
  onDetails: (id: string) => void
}

export const getSuppliesTableColumns = ({ onEdit, onDetails }: SuppliesTableProps) => [
  {
    title: '№',
    dataIndex: 'number',
    key: 'number',
    width: 60,
    render: (_: unknown, _record: SupplyTable, index: number) => <span>{index + 1}</span>
  },
  {
    title: 'Дата',
    dataIndex: 'delivery_date_time',
    key: 'delivery_date_time',
    sorter: true,
    render: (dateTime: string) => {
      const date = new Date(dateTime)
      const day = date.getDate()
      const month = date.toLocaleString('ru-RU', { month: 'long' })
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return <span>{day} {month}, {hours}:{minutes}</span>
    }
  },
  {
    title: 'Поставщик',
    dataIndex: 'supplier',
    key: 'supplier',
    render: (supplier: SupplyTable['supplier']) => (
      <span>{supplier?.name || '-'}</span>
    )
  },
  {
    title: 'Склад',
    dataIndex: 'warehouse',
    key: 'warehouse',
    render: (warehouse: SupplyTable['warehouse']) => (
      <span>{warehouse?.name || '-'}</span>
    )
  },
  {
    title: 'Счет',
    dataIndex: 'id',
    key: 'invoice',
    render: () => <span>-</span>
  },
  {
    title: 'Товары',
    dataIndex: 'goodsNames',
    key: 'goodsNames',
    render: (goodsNames: string) => (
      <span style={{ maxWidth: '200px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {goodsNames || '-'}
      </span>
    )
  },
  {
    title: 'Комментарий',
    dataIndex: 'comment',
    key: 'comment',
    render: (comment: string) => <span>{comment || '-'}</span>
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      const isPaid = status === SupplyStatus.COMPLETED
      return (
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: isPaid ? '#d1fae5' : '#dbeafe',
            color: isPaid ? '#065f46' : '#1e40af'
          }}
        >
          {isPaid ? 'Оплаченная' : 'Неоплаченная'}
        </span>
      )
    }
  },
  {
    title: 'Сумма',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    align: 'right' as const,
    render: (amount: number) => <span>{amount.toFixed(2)} ₽</span>
  },
  {
    title: 'Задолженность',
    dataIndex: 'debt',
    key: 'debt',
    align: 'right' as const,
    render: (debt: number) => <span>{debt.toFixed(2)} ₽</span>
  },
  {
    title: 'Детали',
    dataIndex: 'details',
    key: 'details',
    align: 'center' as const,
    width: 100,
    render: (_: unknown, record: SupplyTable) => (
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDetails(record.id)
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
        Детали
      </button>
    )
  },
  {
    title: 'Ред.',
    dataIndex: 'edit',
    key: 'edit',
    align: 'center' as const,
    width: 80,
    render: (_: unknown, record: SupplyTable) => (
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
    )
  },
  {
    title: '',
    dataIndex: 'more',
    key: 'more',
    align: 'center' as const,
    width: 40,
    render: () => (
      <span style={{ cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>...</span>
    )
  }
]

