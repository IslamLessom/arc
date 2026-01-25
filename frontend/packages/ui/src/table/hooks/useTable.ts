import { useMemo, useState, useCallback } from 'react';
import type { TableProps, TableColumn } from '../model/types';
import { TableSortOrder } from '../model/enums';

interface SortState {
  columnKey: string;
  order: TableSortOrder | null;
}

interface UseTableResult<T> {
  sortedData: T[];
  sortState: SortState | null;
  handleSort: (columnKey: string, sorter: TableColumn<T>['sorter']) => void;
  paginatedData: T[];
  currentPage: number;
  pageSize: number;
  handlePageChange: (page: number, newPageSize: number) => void;
  selectedRowKeys: string[];
  handleRowSelection: (rowKey: string, checked: boolean) => void;
  handleSelectAll: (checked: boolean) => void;
}

export const useTable = <T extends Record<string, unknown>>(
  props: TableProps<T>
): UseTableResult<T> => {
  const {
    dataSource,
    columns,
    rowKey,
    pagination,
    rowSelection
  } = props;

  const [sortState, setSortState] = useState<SortState | null>(null);
  const [currentPage, setCurrentPage] = useState(
    pagination?.current ?? 1
  );
  const [pageSize, setPageSize] = useState(
    pagination?.pageSize ?? 10
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>(
    rowSelection?.selectedRowKeys ?? []
  );

  const getRowKey = useCallback(
    (record: T, index: number): string => {
      if (typeof rowKey === 'function') {
        return rowKey(record);
      }
      if (typeof rowKey === 'string') {
        return String(record[rowKey] ?? index);
      }
      return String(record.key ?? index);
    },
    [rowKey]
  );

  const sortedData = useMemo(() => {
    const data = dataSource ?? [];

    if (!sortState || !sortState.order) {
      return data;
    }

    const column = columns.find((col) => col.key === sortState.columnKey);
    if (!column || !column.sorter) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      if (typeof column.sorter === 'function') {
        return column.sorter(a, b);
      }

      const aValue = column.dataIndex
        ? a[column.dataIndex as keyof T]
        : null;
      const bValue = column.dataIndex
        ? b[column.dataIndex as keyof T]
        : null;

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return aValue - bValue;
      }

      return String(aValue).localeCompare(String(bValue));
    });

    return sortState.order === TableSortOrder.Descend
      ? sorted.reverse()
      : sorted;
  }, [dataSource, sortState, columns]);

  const handleSort = useCallback(
    (columnKey: string, sorter: TableColumn<T>['sorter']) => {
      if (!sorter) return;

      setSortState((prev) => {
        if (prev?.columnKey === columnKey) {
          if (prev.order === TableSortOrder.Ascend) {
            return { columnKey, order: TableSortOrder.Descend };
          }
          if (prev.order === TableSortOrder.Descend) {
            return null;
          }
        }
        return { columnKey, order: TableSortOrder.Ascend };
      });
    },
    []
  );

  const paginatedData = useMemo(() => {
    if (pagination === false) {
      return sortedData;
    }

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize, pagination]);

  const handlePageChange = useCallback(
    (page: number, newPageSize: number) => {
      setCurrentPage(page);
      if (newPageSize !== pageSize) {
        setPageSize(newPageSize);
        setCurrentPage(1);
      }
      pagination?.onChange?.(page, newPageSize);
    },
    [pageSize, pagination]
  );

  const handleRowSelection = useCallback(
    (rowKey: string, checked: boolean) => {
      const newSelectedKeys = checked
        ? [...selectedRowKeys, rowKey]
        : selectedRowKeys.filter((key) => key !== rowKey);
      setSelectedRowKeys(newSelectedKeys);
      rowSelection?.onChange?.(newSelectedKeys);
    },
    [selectedRowKeys, rowSelection]
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const allKeys = paginatedData.map((record, index) =>
          getRowKey(record, index)
        );
        setSelectedRowKeys(allKeys);
        rowSelection?.onChange?.(allKeys);
      } else {
        setSelectedRowKeys([]);
        rowSelection?.onChange?.([]);
      }
    },
    [paginatedData, getRowKey, rowSelection]
  );

  return {
    sortedData,
    sortState,
    handleSort,
    paginatedData,
    currentPage,
    pageSize,
    handlePageChange,
    selectedRowKeys,
    handleRowSelection,
    handleSelectAll
  };
};

