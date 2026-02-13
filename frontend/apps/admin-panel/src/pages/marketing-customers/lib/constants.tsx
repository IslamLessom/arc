import { CustomerTable } from '../model/types'
import { CustomersTableProps } from '../model/types'
import { EditButton } from '@restaurant-pos/ui'

const formatNumber = (num: number) => {
  return num.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export const getCustomersTableColumns = ({ onEdit }: CustomersTableProps) => [
  {
    title: '№',
    dataIndex: 'number',
    key: 'number',
    width: 60,
    render: (_: unknown, _record: CustomerTable, index: number) => <span>{index + 1}</span>
  },
  {
    title: 'Имя',
    dataIndex: 'name',
    key: 'name',
    render: (name: string) => <span>{name || '-'}</span>
  },
  {
    title: 'Телефон',
    dataIndex: 'phone',
    key: 'phone',
    render: (phone: string | null) => <span>{phone || '-'}</span>
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    render: (email: string | null) => <span>{email || '-'}</span>
  },
  {
    title: 'Дата рождения',
    dataIndex: 'birthday',
    key: 'birthday',
    render: (birthday: string | null) => {
      if (!birthday) return <span>-</span>
      const date = new Date(birthday)
      return <span>{date.toLocaleDateString('ru-RU')}</span>
    }
  },
  {
    title: 'Группа',
    dataIndex: 'group',
    key: 'group',
    render: (group: CustomerTable['group']) => <span>{group?.name || '-'}</span>
  },
  {
    title: 'Баллы',
    dataIndex: 'loyalty_points',
    key: 'loyalty_points',
    width: 80,
    render: (points: number) => <span>{points ?? 0}</span>
  },
  {
    title: 'Заказов',
    dataIndex: 'total_orders',
    key: 'total_orders',
    width: 90,
    render: (orders: number) => <span>{orders ?? 0}</span>
  },
  {
    title: 'Всего потрачено',
    dataIndex: 'total_spent',
    key: 'total_spent',
    width: 120,
    render: (spent: number) => <span>{spent ? formatNumber(spent) + ' ₸' : '-'}</span>
  },
  {
    title: 'Ред.',
    dataIndex: 'edit',
    key: 'edit',
    align: 'center' as const,
    width: 80,
    render: (_: unknown, record: CustomerTable) => (
      <EditButton onClick={() => onEdit(record.id)} />
    )
  }
]
