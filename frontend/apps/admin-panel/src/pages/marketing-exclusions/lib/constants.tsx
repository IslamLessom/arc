import { ExclusionTable } from '../model/types'
import { ExclusionsTableProps } from '../model/types'
import { ExclusionType } from '../model/enums'
import { EditButton, DeleteButton } from '@restaurant-pos/ui'
import { TypeBadge, StatusBadge } from '../ui/styled'
import { TableAlign } from '@restaurant-pos/ui'

const getTypeLabel = (type: string) => {
  switch (type) {
    case ExclusionType.PRODUCT:
      return 'Товар'
    case ExclusionType.CATEGORY:
      return 'Категория'
    case ExclusionType.CUSTOMER:
      return 'Клиент'
    case ExclusionType.CUSTOMER_GROUP:
      return 'Группа клиентов'
    default:
      return type
  }
}

export const getExclusionsTableColumns = ({ onEdit, onDelete }: ExclusionsTableProps) => [
  {
    title: '№',
    dataIndex: 'number',
    key: 'number',
    width: 60,
    render: (_: unknown, _record: ExclusionTable, index: number) => <span>{index + 1}</span>
  },
  {
    title: 'Название',
    dataIndex: 'name',
    key: 'name',
    render: (name: unknown) => <span>{(name as string) || '-'}</span>
  },
  {
    title: 'Описание',
    dataIndex: 'description',
    key: 'description',
    render: (description: unknown) => <span>{(description as string | null) || '-'}</span>
  },
  {
    title: 'Тип',
    dataIndex: 'type',
    key: 'type',
    width: 130,
    render: (type: unknown) => <TypeBadge $type={(type as string) || ''}>{getTypeLabel((type as string) || '')}</TypeBadge>
  },
  {
    title: 'Объект',
    dataIndex: 'entity_name',
    key: 'entity_name',
    render: (entityName: unknown) => <span>{(entityName as string) || '-'}</span>
  },
  {
    title: 'Статус',
    dataIndex: 'is_active',
    key: 'is_active',
    width: 100,
    render: (isActive: unknown) => (
      <StatusBadge $active={Boolean(isActive)}>{isActive ? 'Активен' : 'Неактивен'}</StatusBadge>
    )
  },
  {
    title: 'Ред.',
    dataIndex: 'edit',
    key: 'edit',
    align: TableAlign.Center,
    width: 80,
    render: (_: unknown, record: ExclusionTable) => (
      <EditButton onClick={() => onEdit(record.id)} />
    )
  },
  {
    title: 'Удал.',
    dataIndex: 'delete',
    key: 'delete',
    align: TableAlign.Center,
    width: 90,
    render: (_: unknown, record: ExclusionTable) => (
      <DeleteButton onClick={() => onDelete(record.id)} />
    )
  }
]
