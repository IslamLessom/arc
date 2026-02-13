import { ExclusionTable } from '../model/types'
import { ExclusionsTableProps } from '../model/types'
import { ExclusionType } from '../model/enums'
import { EditButton } from '@restaurant-pos/ui'
import { TypeBadge, StatusBadge } from '../ui/styled'

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

export const getExclusionsTableColumns = ({ onEdit }: ExclusionsTableProps) => [
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
    render: (name: string) => <span>{name || '-'}</span>
  },
  {
    title: 'Описание',
    dataIndex: 'description',
    key: 'description',
    render: (description: string | null) => <span>{description || '-'}</span>
  },
  {
    title: 'Тип',
    dataIndex: 'type',
    key: 'type',
    width: 130,
    render: (type: string) => <TypeBadge $type={type}>{getTypeLabel(type)}</TypeBadge>
  },
  {
    title: 'Объект',
    dataIndex: 'entity_name',
    key: 'entity_name',
    render: (entityName: string) => <span>{entityName || '-'}</span>
  },
  {
    title: 'Статус',
    dataIndex: 'is_active',
    key: 'is_active',
    width: 100,
    render: (isActive: boolean) => (
      <StatusBadge $active={isActive}>{isActive ? 'Активен' : 'Неактивен'}</StatusBadge>
    )
  },
  {
    title: 'Ред.',
    dataIndex: 'edit',
    key: 'edit',
    align: 'center' as const,
    width: 80,
    render: (_: unknown, record: ExclusionTable) => (
      <EditButton onClick={() => onEdit(record.id)} />
    )
  }
]
