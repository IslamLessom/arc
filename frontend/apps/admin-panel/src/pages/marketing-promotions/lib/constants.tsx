import { PromotionTable } from '../model/types'
import { PromotionsTableProps } from '../model/types'
import { PromotionType } from '../model/enums'
import { DeleteButton, EditButton, TableAlign } from '@restaurant-pos/ui'
import { TypeBadge, StatusBadge } from '../ui/styled'

const getTypeLabel = (type: string) => {
  switch (type) {
    case PromotionType.DISCOUNT:
      return 'Скидка'
    case PromotionType.BUY_X_GET_Y:
      return 'X+Y'
    case PromotionType.BUNDLE:
      return 'Комбо'
    case PromotionType.HAPPY_HOUR:
      return 'Happy Hour'
    default:
      return type
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const getPromotionsTableColumns = ({ onEdit, onDelete }: PromotionsTableProps) => [
  {
    title: '№',
    dataIndex: 'number',
    key: 'number',
    width: 60,
    render: (_: unknown, _record: PromotionTable, index: number) => <span>{index + 1}</span>
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
    width: 110,
    render: (type: unknown) => <TypeBadge $type={(type as string) || ''}>{getTypeLabel((type as string) || '')}</TypeBadge>
  },
  {
    title: 'Влияние',
    dataIndex: 'impact_preview',
    key: 'impact_preview',
    width: 220,
    render: (impact: unknown) => <span>{(impact as string) || '-'}</span>
  },
  {
    title: 'Скидка %',
    dataIndex: 'discount_percentage',
    key: 'discount_percentage',
    width: 90,
    render: (discount: unknown) => <span>{(discount as number | null) ? `${discount}%` : '-'}</span>
  },
  {
    title: 'Период',
    dataIndex: 'start_date',
    key: 'period',
    width: 150,
    render: (_: unknown, record: PromotionTable) => (
      <span>{formatDate(record.start_date)} - {formatDate(record.end_date)}</span>
    )
  },
  {
    title: 'Использований',
    dataIndex: 'usage_count',
    key: 'usage_count',
    width: 110,
    render: (count: unknown) => <span>{(count as number) ?? 0}</span>
  },
  {
    title: 'Статус',
    dataIndex: 'is_active',
    key: 'is_active',
    width: 100,
    render: (isActive: unknown) => (
      <StatusBadge $active={Boolean(isActive)}>{isActive ? 'Активна' : 'Неактивна'}</StatusBadge>
    )
  },
  {
    title: 'Ред.',
    dataIndex: 'edit',
    key: 'edit',
    align: TableAlign.Center,
    width: 80,
    render: (_: unknown, record: PromotionTable) => (
      <EditButton onClick={() => onEdit(record.id)} />
    )
  },
  {
    title: 'Удал.',
    dataIndex: 'delete',
    key: 'delete',
    align: TableAlign.Center,
    width: 90,
    render: (_: unknown, record: PromotionTable) => (
      <DeleteButton onClick={() => onDelete(record.id)} />
    )
  }
]
