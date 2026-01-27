import type { ColumnsType } from 'antd/es/table'
import type { Ingredient } from '../model/types'

export const INGREDIENTS_TABLE_COLUMNS: ColumnsType<Ingredient> = [
  {
    title: 'Ингредиент',
    dataIndex: 'name',
    key: 'name',
    sorter: {
      compare: (a, b) => a.name.localeCompare(b.name),
    },
    width: 200,
    ellipsis: true,
  },
  {
    title: 'Категория',
    dataIndex: 'category',
    key: 'category',
    sorter: {
      compare: (a, b) => a.category.localeCompare(b.category),
    },
    width: 150,
    ellipsis: true,
  },
  {
    title: 'Ед. изм.',
    dataIndex: 'measureUnit',
    key: 'measureUnit',
    width: 100,
    ellipsis: true,
  },
  {
    title: 'Кол-во',
    dataIndex: 'count',
    key: 'count',
    sorter: {
      compare: (a, b) => a.count - b.count,
    },
    width: 100,
    ellipsis: true,
  },
  {
    title: 'Остатки',
    dataIndex: 'stock',
    key: 'stock',
    sorter: {
      compare: (a, b) => a.stock - b.stock,
    },
    width: 120,
    ellipsis: true,
    render: (value: number, record: Ingredient) => `${value} ${record.measureUnit}`,
  },
  {
    title: 'Поставщик',
    dataIndex: 'supplier',
    key: 'supplier',
    width: 150,
    ellipsis: true,
    render: (value: string) => value || '-',
  },
  {
    title: 'Последняя поставка',
    dataIndex: 'lastDelivery',
    key: 'lastDelivery',
    width: 150,
    ellipsis: true,
    render: (value: string) => value || '-',
  },
  {
    title: 'Стоимость',
    dataIndex: 'cost',
    key: 'cost',
    sorter: {
      compare: (a, b) => a.cost - b.cost,
    },
    width: 120,
    ellipsis: true,
    render: (value: number) => `${value.toFixed(2)} ₽`,
  },
  {
    title: '',
    key: 'actions',
    width: 100,
    ellipsis: true,
  },
]

export const INGREDIENTS_TABLE_SUMMARY = (totalIngredientCount: number, totalStock: number, totalValue: number) => ({
  totalIngredientCount,
  totalStock,
  totalValue,
})