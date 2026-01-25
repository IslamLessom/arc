import type { TableColumn } from '@restaurant-pos/ui'
import type { ProductTable, ProductsTableProps } from '../model/types'
import {
  renderNameCell,
  renderCostPriceCell,
  renderPriceCell,
  renderMarkupCell,
  renderMoreCell,
} from './renderCells'
import * as Styled from '../ui/styled'

export const getProductsTableColumns = ({ onEdit }: ProductsTableProps): TableColumn<ProductTable>[] => [
  {
    title: 'Название',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    render: renderNameCell,
  },
  {
    title: 'Категория',
    dataIndex: 'category',
    key: 'category',
    sorter: true,
  },
  {
    title: 'Себестоимость без НДС',
    dataIndex: 'costPrice',
    key: 'costPrice',
    align: 'right',
    sorter: true,
    render: renderCostPriceCell,
  },
  {
    title: 'Цена',
    dataIndex: 'price',
    key: 'price',
    align: 'right',
    sorter: true,
    render: renderPriceCell,
  },
  {
    title: 'Наценка',
    dataIndex: 'markup',
    key: 'markup',
    align: 'right',
    sorter: true,
    render: renderMarkupCell,
  },
  {
    title: 'Ред.',
    dataIndex: 'edit',
    key: 'edit',
    align: 'center',
    width: 80,
    render: (_: unknown, record: ProductTable) => (
      <Styled.EditButton
        onClick={(e) => {
          e.stopPropagation()
          onEdit(record.id)
        }}
      >
        Ред.
      </Styled.EditButton>
    ),
  },
  {
    title: '',
    dataIndex: 'more',
    key: 'more',
    align: 'center',
    width: 40,
    render: renderMoreCell,
  },
]

