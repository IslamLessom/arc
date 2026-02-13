import { PromotionTable } from '../model/types'
import { PromotionsTableProps } from '../model/types'
import { PromotionType } from '../model/enums'
import { EditButton } from '@restaurant-pos/ui'
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

export const getPromotionsTableColumns = ({ onEdit }: PromotionsTableProps) => [
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
    width: 110,
    render: (type: string) => <TypeBadge $type={type}>{getTypeLabel(type)}</TypeBadge>
  },
  {
    title: 'Скидка %',
    dataIndex: 'discount_percentage',
    key: 'discount_percentage',
    width: 90,
    render: (discount: number | null) => <span>{discount ? `${discount}%` : '-'}</span>
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
    render: (count: number) => <span>{count ?? 0}</span>
  },
  {
    title: 'Статус',
    dataIndex: 'is_active',
    key: 'is_active',
    width: 100,
    render: (isActive: boolean) => (
      <StatusBadge $active={isActive}>{isActive ? 'Активна' : 'Неактивна'}</StatusBadge>
    )
  },
  {
    title: 'Ред.',
    dataIndex: 'edit',
    key: 'edit',
    align: 'center' as const,
    width: 80,
    render: (_: unknown, record: PromotionTable) => (
      <EditButton onClick={() => onEdit(record.id)} />
    )
  }
]
