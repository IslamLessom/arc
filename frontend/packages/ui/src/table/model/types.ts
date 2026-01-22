import type { ReactNode, CSSProperties } from 'react';
import type { TableSize, TableAlign, TableSortOrder } from './enums';

export interface TableColumn<T = unknown> {
  key: string;
  title: ReactNode;
  dataIndex?: keyof T | string;
  width?: number | string;
  align?: TableAlign;
  sorter?: boolean | ((a: T, b: T) => number);
  render?: (value: unknown, record: T, index: number) => ReactNode;
  fixed?: 'left' | 'right';
  ellipsis?: boolean;
}

export interface TablePagination {
  current?: number;
  pageSize?: number;
  total?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  pageSizeOptions?: string[];
  onChange?: (page: number, pageSize: number) => void;
}

export interface TableProps<T = unknown> {
  columns: TableColumn<T>[];
  dataSource: T[];
  rowKey?: string | ((record: T) => string);
  loading?: boolean;
  size?: TableSize;
  bordered?: boolean;
  pagination?: TablePagination | false;
  scroll?: {
    x?: number | string;
    y?: number | string;
  };
  onRow?: (record: T, index: number) => {
    onClick?: (event: React.MouseEvent) => void;
    onDoubleClick?: (event: React.MouseEvent) => void;
    style?: CSSProperties;
    className?: string;
  };
  rowSelection?: {
    selectedRowKeys?: string[];
    onChange?: (selectedRowKeys: string[]) => void;
    getCheckboxProps?: (record: T) => {
      disabled?: boolean;
      name?: string;
    };
  };
  className?: string;
  style?: CSSProperties;
}

