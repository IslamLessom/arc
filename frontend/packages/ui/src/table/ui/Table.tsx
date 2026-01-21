'use client';

import React from 'react';
import type { TableProps } from '../model/types';
import { useTable } from '../hooks/useTable';
import { TableSize, TableSortOrder } from '../model/enums';
import * as Styled from '../styled';

export const Table = <T extends Record<string, unknown>>({
  columns,
  dataSource,
  rowKey,
  loading = false,
  size = TableSize.Middle,
  bordered = false,
  pagination,
  scroll,
  onRow,
  rowSelection,
  className,
  style
}: TableProps<T>) => {
  const {
    paginatedData,
    sortState,
    handleSort,
    currentPage,
    pageSize,
    handlePageChange,
    selectedRowKeys,
    handleRowSelection,
    handleSelectAll
  } = useTable({
    columns,
    dataSource,
    rowKey,
    pagination,
    rowSelection
  });

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    if (typeof rowKey === 'string') {
      return String(record[rowKey] ?? index);
    }
    return String(record.key ?? index);
  };

  const getCellValue = (column: typeof columns[0], record: T): unknown => {
    if (column.dataIndex) {
      return record[column.dataIndex as keyof T];
    }
    return null;
  };

  const totalPages = pagination === false
    ? 1
    : Math.ceil((pagination?.total ?? dataSource.length) / pageSize);

  const renderPagination = () => {
    if (pagination === false) return null;

    const total = pagination?.total ?? dataSource.length;
    const showSizeChanger = pagination?.showSizeChanger ?? false;
    const pageSizeOptions = pagination?.pageSizeOptions ?? ['10', '20', '50', '100'];

    return (
      <Styled.PaginationContainer>
        {showSizeChanger && (
          <select
            value={pageSize}
            onChange={(e) => handlePageChange(1, Number(e.target.value))}
            style={{
              padding: '4px 8px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option} / страница
              </option>
            ))}
          </select>
        )}

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <Styled.PaginationButton
            $disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1, pageSize)}
          >
            Назад
          </Styled.PaginationButton>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Styled.PaginationButton
                key={pageNum}
                $active={currentPage === pageNum}
                onClick={() => handlePageChange(pageNum, pageSize)}
              >
                {pageNum}
              </Styled.PaginationButton>
            );
          })}

          <Styled.PaginationButton
            $disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1, pageSize)}
          >
            Вперед
          </Styled.PaginationButton>
        </div>

        <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
          {((currentPage - 1) * pageSize + 1)} - {Math.min(currentPage * pageSize, total)} из {total}
        </span>
      </Styled.PaginationContainer>
    );
  };

  if (loading) {
    return (
      <Styled.TableContainer $bordered={bordered} className={className} style={style}>
        <Styled.LoadingOverlay>Загрузка...</Styled.LoadingOverlay>
      </Styled.TableContainer>
    );
  }

  return (
    <Styled.TableContainer $bordered={bordered} className={className} style={style}>
      <div style={{ overflowX: scroll?.x ? 'auto' : 'visible', maxHeight: scroll?.y }}>
        <Styled.StyledTable $size={size}>
          <Styled.TableHead>
            <tr>
              {rowSelection && (
                <Styled.CheckboxCell $size={size}>
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((record, index) =>
                        selectedRowKeys.includes(getRowKey(record, index))
                      )
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                </Styled.CheckboxCell>
              )}
              {columns.map((column) => {
                const isSortable = !!column.sorter;
                const columnSortOrder =
                  sortState?.columnKey === column.key ? sortState.order : null;

                return (
                  <Styled.TableHeaderCell
                    key={column.key}
                    $align={column.align}
                    $width={column.width}
                    $fixed={column.fixed}
                    $isSortable={isSortable}
                    $size={size}
                    onClick={() => isSortable && handleSort(column.key, column.sorter)}
                  >
                    {column.title}
                    {isSortable && (
                      <Styled.SortIcon $order={columnSortOrder} />
                    )}
                  </Styled.TableHeaderCell>
                );
              })}
            </tr>
          </Styled.TableHead>
          <Styled.TableBody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (rowSelection ? 1 : 0)}
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: 'rgba(0, 0, 0, 0.45)'
                  }}
                >
                  Нет данных
                </td>
              </tr>
            ) : (
              paginatedData.map((record, index) => {
                const recordKey = getRowKey(record, index);
                const isSelected = selectedRowKeys.includes(recordKey);
                const rowProps = onRow?.(record, index) ?? {};
                const isClickable = !!rowProps.onClick || !!rowProps.onDoubleClick;

                return (
                  <Styled.TableRow
                    key={recordKey}
                    $isSelected={isSelected}
                    $isClickable={isClickable}
                    onClick={rowProps.onClick}
                    onDoubleClick={rowProps.onDoubleClick}
                    style={rowProps.style}
                    className={rowProps.className}
                  >
                    {rowSelection && (
                      <Styled.CheckboxCell $size={size}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            handleRowSelection(recordKey, e.target.checked)
                          }
                          disabled={
                            rowSelection.getCheckboxProps?.(record).disabled
                          }
                          style={{ cursor: 'pointer' }}
                        />
                      </Styled.CheckboxCell>
                    )}
                    {columns.map((column) => {
                      const cellValue = getCellValue(column, record);
                      const renderedValue = column.render
                        ? column.render(cellValue, record, index)
                        : cellValue;

                      return (
                        <Styled.TableCell
                          key={column.key}
                          $align={column.align}
                          $width={column.width}
                          $fixed={column.fixed}
                          $ellipsis={column.ellipsis}
                          $size={size}
                        >
                          {renderedValue}
                        </Styled.TableCell>
                      );
                    })}
                  </Styled.TableRow>
                );
              })
            )}
          </Styled.TableBody>
        </Styled.StyledTable>
      </div>
      {renderPagination()}
    </Styled.TableContainer>
  );
};

