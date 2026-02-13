import { CustomerGroupTable } from '../model/types'
import { CustomerGroupsTableProps } from '../model/types'
import { EditButton } from '@restaurant-pos/ui'

export const getCustomerGroupsTableColumns = ({ onEdit }: CustomerGroupsTableProps) => [
  {
    title: '№',
    dataIndex: 'number',
    key: 'number',
    width: 60,
    render: (_: unknown, _record: CustomerGroupTable, index: number) => <span>{index + 1}</span>
  },
  {
    title: 'Название',
    dataIndex: 'name',
    key: 'name',
    render: (name: string) => <span>{name || '-'}</span>
  },
  {
    title: 'Описание',
    dataIndex: 'description',
    key: 'description',
    render: (description: string | null) => <span>{description || '-'}</span>
  },
  {
    title: 'Скидка %',
    dataIndex: 'discount_percentage',
    key: 'discount_percentage',
    width: 100,
    render: (discount: number) => <span>{discount}%</span>
  },
  {
    title: 'Мин. заказов',
    dataIndex: 'min_orders',
    key: 'min_orders',
    width: 110,
    render: (minOrders: number | null) => <span>{minOrders ?? '-'}</span>
  },
  {
    title: 'Мин. потрачено',
    dataIndex: 'min_spent',
    key: 'min_spent',
    width: 130,
    render: (minSpent: number | null) => <span>{minSpent ? `${minSpent.toLocaleString('ru-RU')} ₸` : '-'}</span>
  },
  {
    title: 'Клиентов',
    dataIndex: 'customers_count',
    key: 'customers_count',
    width: 100,
    render: (count: number) => <span>{count ?? 0}</span>
  },
  {
    title: 'Ред.',
    dataIndex: 'edit',
    key: 'edit',
    align: 'center' as const,
    width: 80,
    render: (_: unknown, record: CustomerGroupTable) => (
      <EditButton onClick={() => onEdit(record.id)} />
    )
  }
]
