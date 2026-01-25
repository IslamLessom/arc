import type { TableColumn } from '@restaurant-pos/ui'
import type { MovementTable, MovementsTableProps } from '../model/types'
import * as Styled from '../ui/styled'

export const getMovementsTableColumns = ({ onEdit }: MovementsTableProps): TableColumn<MovementTable>[] => [
  {
    title: 'Дата',
    dataIndex: 'date_time',
    key: 'date_time',
    sorter: true,
    render: (value: string) => {
      const date = new Date(value)
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    },
  },
  {
    title: 'Наименование',
    dataIndex: 'comment',
    key: 'comment',
    render: (value: string, record: MovementTable) => {
      if (value) return value
      const itemsCount = record.items?.length || 0
      return `Перемещение (${itemsCount} ${itemsCount === 1 ? 'товар' : 'товаров'})`
    },
  },
  {
    title: 'Сумма',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    align: 'right',
    sorter: true,
    render: (value: number) => {
      return <span style={{ fontWeight: 600 }}>{value.toFixed(2)} ₽</span>
    },
  },
  {
    title: 'Сотрудник',
    dataIndex: 'employeeName',
    key: 'employeeName',
    render: (value?: string) => value || '-',
  },
  {
    title: 'Склады',
    dataIndex: 'warehousesDisplay',
    key: 'warehousesDisplay',
    render: (value: string) => value,
  },
]

