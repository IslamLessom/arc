import React from 'react'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import type { TableColumn } from '@restaurant-pos/ui'
import type { MovementReportItem } from '../model/types'

export const getMovementReportColumns = (): TableColumn<MovementReportItem>[] => [
  {
    title: 'Название',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
  },
  {
    title: 'Тип',
    dataIndex: 'type',
    key: 'type',
    sorter: true,
    render: (value: string) => {
      return value === 'ingredient' ? 'Ингредиент' : 'Товар'
    },
  },
  {
    title: 'Нач. остаток',
    dataIndex: 'initialBalance',
    key: 'initialBalance',
    align: 'right',
    sorter: true,
    render: (value: number, record: MovementReportItem) => {
      return `${value.toFixed(record.unit === 'шт' ? 2 : 3)} ${record.unit}`
    },
  },
  {
    title: 'Средняя себест. на начало',
    dataIndex: 'initialAverageCost',
    key: 'initialAverageCost',
    align: 'right',
    sorter: true,
    render: (value: number) => {
      return `${value.toFixed(2)} ₽`
    },
  },
  {
    title: 'Нач. сумма',
    dataIndex: 'initialSum',
    key: 'initialSum',
    align: 'right',
    sorter: true,
    render: (value: number) => {
      return `${value.toFixed(2)} ₽`
    },
  },
  {
    title: 'Поступления',
    dataIndex: 'receipts',
    key: 'receipts',
    align: 'right',
    sorter: true,
    render: (value: number, record: MovementReportItem) => {
      return (
        <span style={{ color: '#52c41a' }}>
          <ArrowUpOutlined style={{ marginRight: 4 }} />
          {value.toFixed(record.unit === 'шт' ? 2 : 3)} {record.unit}
        </span>
      )
    },
  },
  {
    title: 'Расход',
    dataIndex: 'expenses',
    key: 'expenses',
    align: 'right',
    sorter: true,
    render: (value: number, record: MovementReportItem) => {
      return (
        <span style={{ color: '#ff4d4f' }}>
          <ArrowDownOutlined style={{ marginRight: 4 }} />
          {value.toFixed(record.unit === 'шт' ? 2 : 3)} {record.unit}
        </span>
      )
    },
  },
  {
    title: 'Итог. остаток',
    dataIndex: 'finalBalance',
    key: 'finalBalance',
    align: 'right',
    sorter: true,
    render: (value: number, record: MovementReportItem) => {
      return `${value.toFixed(record.unit === 'шт' ? 2 : 3)} ${record.unit}`
    },
  },
  {
    title: 'Средняя себест. на конец',
    dataIndex: 'finalAverageCost',
    key: 'finalAverageCost',
    align: 'right',
    sorter: true,
    render: (value: number) => {
      return `${value.toFixed(2)} ₽`
    },
  },
  {
    title: 'Итог. сумма',
    dataIndex: 'finalSum',
    key: 'finalSum',
    align: 'right',
    sorter: true,
    render: (value: number) => {
      return `${value.toFixed(2)} ₽`
    },
  },
]

