import type { TableColumn } from '@restaurant-pos/ui'
import type { WriteOffTable } from '../model/types'

interface WriteOffsTableProps {
  onEdit?: (id: string) => void
}

export const getWriteOffsTableColumns = (props: WriteOffsTableProps = {}): TableColumn<WriteOffTable>[] => [
  {
    title: 'Дата',
    dataIndex: 'writeOffDateTime',
    key: 'writeOffDateTime',
    sorter: true,
    render: (dateTime: string) => {
      if (!dateTime) return <span>-</span>
      
      const date = new Date(dateTime)
      if (isNaN(date.getTime())) return <span>-</span>
      
      const day = date.getDate()
      const month = date.toLocaleString('ru-RU', { month: 'long' })
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return <span>{day} {month}, {hours}:{minutes}</span>
    }
  },
  {
    title: 'Склад',
    dataIndex: 'warehouse',
    key: 'warehouse',
    render: (warehouse: WriteOffTable['warehouse']) => (
      <span>{warehouse?.name || '-'}</span>
    )
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
    title: 'Сумма',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    align: 'right',
    render: (amount: number) => <span>{amount.toFixed(2)} ₽</span>
  },
  {
    title: 'Сотрудник',
    dataIndex: 'id',
    key: 'employee',
    render: () => <span>-</span>
  },
  {
    title: 'Причина',
    dataIndex: 'reason',
    key: 'reason',
    render: (reason: string) => <span>{reason || '-'}</span>
  },
]

