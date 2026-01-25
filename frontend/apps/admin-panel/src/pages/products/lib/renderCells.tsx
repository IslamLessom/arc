import React from 'react'
import type { ProductTable } from '../model/types'
import * as Styled from '../ui/styled'

export const renderNameCell = (_: unknown, record: ProductTable) => (
  <Styled.CellContent>
    {record.coverImage && (
      <Styled.ProductImage
        src={record.coverImage}
        alt={record.name}
      />
    )}
    <span>{record.name}</span>
  </Styled.CellContent>
)

export const renderPriceCell = (value: unknown) => (
  <Styled.CellContent $align="right">
    <Styled.PriceText>{Number(value).toFixed(2)} ₽</Styled.PriceText>
  </Styled.CellContent>
)

export const renderCostPriceCell = (value: unknown) => (
  <Styled.CellContent $align="right">
    <span>{Number(value).toFixed(2)} ₽</span>
  </Styled.CellContent>
)

export const renderMarkupCell = (value: unknown) => (
  <Styled.CellContent $align="right">
    <span>{value !== null ? `${Number(value).toFixed(2)}%` : '-'}</span>
  </Styled.CellContent>
)

export const renderMoreCell = () => (
  <Styled.CellContent $align="center">
    <Styled.MoreButton>...</Styled.MoreButton>
  </Styled.CellContent>
)
