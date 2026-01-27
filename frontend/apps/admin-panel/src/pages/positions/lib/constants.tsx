import type { PositionTable } from '../model/types'
import { EditButton } from '@restaurant-pos/ui'
import type { TableColumn } from '@restaurant-pos/ui'
import { TableAlign } from '@restaurant-pos/ui'
import { getPositionName } from './positionNameMap'
import { Link } from 'react-router-dom'

export const getPositionsTableColumns = (): TableColumn<PositionTable>[] => [
  {
    title: '№',
    dataIndex: 'number',
    key: 'number',
    width: 60,
    render: (_: unknown, _record: PositionTable, index: number) => <span>{index + 1}</span>
  },
  {
    title: 'Название',
    dataIndex: 'name',
    key: 'name',
    render: (value: unknown) => {
      const name = value as string
      return <span>{getPositionName(name) || '-'}</span>
    }
  },
  {
    title: 'Дата создания',
    dataIndex: 'created_at',
    key: 'created_at',
    render: (value: unknown) => {
      const date = value as string
      if (!date) return '-'
      return new Date(date).toLocaleDateString('ru-RU')
    }
  },
  {
    title: 'Ред.',
    dataIndex: 'edit',
    key: 'edit',
    align: TableAlign.Center,
    width: 80,
    render: (_: unknown, record: PositionTable) => (
      <Link to={`/access/positions/${record.id}/edit`}>
        <EditButton />
      </Link>
    )
  }
]
