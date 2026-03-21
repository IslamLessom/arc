import { LoyaltyProgramTable } from '../model/types'
import { LoyaltyProgramsTableProps } from '../model/types'
import { DeleteButton, EditButton, TableAlign } from '@restaurant-pos/ui'
import { LoyaltyProgramType } from '../model/enums'
import { StatusBadge } from '../ui/styled'

const getTypeLabel = (type: string) => {
  switch (type) {
    case LoyaltyProgramType.POINTS:
      return 'Баллы'
    case LoyaltyProgramType.CASHBACK:
      return 'Кэшбэк'
    case LoyaltyProgramType.TIER:
      return 'Уровни'
    default:
      return type
  }
}

export const getLoyaltyProgramsTableColumns = ({ onEdit, onDelete }: LoyaltyProgramsTableProps) => [
  {
    title: '№',
    dataIndex: 'number',
    key: 'number',
    width: 60,
    render: (_: unknown, _record: LoyaltyProgramTable, index: number) => <span>{index + 1}</span>
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
    width: 100,
    render: (type: unknown) => <span>{getTypeLabel((type as string) || '')}</span>
  },
  {
    title: 'Формула',
    dataIndex: 'formula_preview',
    key: 'formula_preview',
    width: 240,
    render: (formula: unknown) => <span>{(formula as string) || '-'}</span>
  },
  {
    title: 'Баллов/₽',
    dataIndex: 'points_per_currency',
    key: 'points_per_currency',
    width: 100,
    render: (points: unknown) => <span>{(points as number | null) ?? '-'}</span>
  },
  {
    title: 'Кэшбэк %',
    dataIndex: 'cashback_percentage',
    key: 'cashback_percentage',
    width: 100,
    render: (cashback: unknown) => <span>{(cashback as number | null) ?? '-'}</span>
  },
  {
    title: 'Мультипликатор',
    dataIndex: 'point_multiplier',
    key: 'point_multiplier',
    width: 120,
    render: (multiplier: unknown) => <span>x{(multiplier as number) ?? 0}</span>
  },
  {
    title: 'Участников',
    dataIndex: 'members_count',
    key: 'members_count',
    width: 110,
    render: (count: unknown) => <span>{(count as number) ?? 0}</span>
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
    render: (_: unknown, record: LoyaltyProgramTable) => (
      <EditButton onClick={() => onEdit(record.id)} />
    )
  },
  {
    title: 'Удал.',
    dataIndex: 'delete',
    key: 'delete',
    align: TableAlign.Center,
    width: 90,
    render: (_: unknown, record: LoyaltyProgramTable) => (
      <DeleteButton onClick={() => onDelete(record.id)} />
    )
  }
]
