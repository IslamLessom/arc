import styled from 'styled-components';

export const TableWrapper = styled.div`
  width: 100%;
  background: #ffffff;
`;

export const TableContainer = styled.div<{
  $bordered?: boolean;
  $size?: string;
}>`
  width: 100%;
  overflow: hidden;
  border: ${({ $bordered }) => ($bordered ? '1px solid #d9d9d9' : 'none')};
  border-radius: ${({ $bordered }) => ($bordered ? '8px' : '0')};
  background: #ffffff;
`;

export const TableScrollWrapper = styled.div`
  overflow-x: auto;
  overflow-y: visible;
`;

export const StyledTable = styled.table<{
  $size?: string;
}>`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ $size }) => {
    switch ($size) {
      case 'small':
        return '12px';
      case 'large':
        return '16px';
      default:
        return '14px';
    }
  }};
`;

export const TableHead = styled.thead`
  background-color: #fafafa;
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr<{
  $isSelected?: boolean;
  $isClickable?: boolean;
}>`
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;

  ${({ $isClickable }) =>
    $isClickable &&
    `
    cursor: pointer;

    &:hover {
      background-color: #f5f5f5;
    }
  `}

  ${({ $isSelected }) =>
    $isSelected &&
    `
    background-color: #e6f7ff;
  `}
`;

export const TableHeaderCell = styled.th<{
  $align?: string;
  $width?: number | string;
  $fixed?: 'left' | 'right';
  $isSortable?: boolean;
  $size?: string;
}>`
  padding: ${({ $size }) => {
    switch ($size) {
      case 'small':
        return '8px 12px';
      case 'large':
        return '16px 24px';
      default:
        return '12px 16px';
    }
  }};
  text-align: ${({ $align }) => $align ?? 'left'};
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  background-color: #fafafa;
  border-bottom: 2px solid #f0f0f0;
  position: ${({ $fixed }) => ($fixed ? 'sticky' : 'static')};
  white-space: nowrap;
  ${({ $fixed, $width }) =>
    $fixed === 'left' &&
    `
    left: 0;
    z-index: 10;
    background-color: #fafafa;
    width: ${typeof $width === 'number' ? `${$width}px` : $width ?? 'auto'};
  `}
  ${({ $fixed, $width }) =>
    $fixed === 'right' &&
    `
    right: 0;
    z-index: 10;
    background-color: #fafafa;
    width: ${typeof $width === 'number' ? `${$width}px` : $width ?? 'auto'};
  `}
  width: ${({ $width }) =>
    $width ? (typeof $width === 'number' ? `${$width}px` : $width) : 'auto'};

  ${({ $isSortable }) =>
    $isSortable &&
    `
    cursor: pointer;
    user-select: none;

    &:hover {
      background-color: #f0f0f0;
    }
  `}
`;

export const TableCell = styled.td<{
  $align?: string;
  $width?: number | string;
  $fixed?: 'left' | 'right';
  $ellipsis?: boolean;
  $size?: string;
}>`
  padding: ${({ $size }) => {
    switch ($size) {
      case 'small':
        return '8px 12px';
      case 'large':
        return '16px 24px';
      default:
        return '12px 16px';
    }
  }};
  text-align: ${({ $align }) => $align ?? 'left'};
  color: rgba(0, 0,0, 0.85);
  position: ${({ $fixed }) => ($fixed ? 'sticky' : 'static')};
  white-space: nowrap;
  ${({ $fixed, $width }) =>
    $fixed === 'left' &&
    `
    left: 0;
    z-index: 9;
    background-color: white;
    width: ${typeof $width === 'number' ? `${$width}px` : $width ?? 'auto'};
  `}
  ${({ $fixed, $width }) =>
    $fixed === 'right' &&
    `
    right: 0;
    z-index: 9;
    background-color: white;
    width: ${typeof $width === 'number' ? `${$width}px` : $width ?? 'auto'};
  `}
  width: ${({ $width }) =>
    $width ? (typeof $width === 'number' ? `${$width}px` : $width) : 'auto'};

  ${({ $ellipsis }) =>
    $ellipsis &&
    `
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
  `}
`;

export const SortIcon = styled.span<{
  $order?: string | null;
}>`
  margin-left: 4px;
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  opacity: ${({ $order }) => ($order ? '1' : '0.3')};

  ${({ $order }) =>
    $order === 'ascend' &&
    `
    border-bottom: 6px solid #1890ff;
    border-top: none;
  `}

  ${({ $order }) =>
    $order === 'descend' &&
    `
    border-top: 6px solid #1890ff;
    border-bottom: none;
  `}

  ${({ $order }) =>
    !$order &&
    `
    border-bottom: 3px solid #bfbfbf;
    border-top: 3px solid #bfbfbf;
  `}
`;

export const CheckboxCell = styled.td<{
  $size?: string;
}>`
  padding: ${({ $size }) => {
    switch ($size) {
      case 'small':
        return '8px 12px';
      case 'large':
        return '16px 24px';
      default:
        return '12px 16px';
    }
  }};
  width: 50px;
  text-align: center;
  white-space: nowrap;
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  gap: 16px;
  border-top: 1px solid #f0f0f0;
  background: #ffffff;
`;

export const PaginationLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const PaginationCenter = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

export const PaginationRight = styled.div`
  display: flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
`;

export const PageSizeSelect = styled.select`
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  background: #ffffff;
  transition: all 0.2s;

  &:hover {
    border-color: #1890ff;
  }

  &:focus {
    outline: none;
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }
`;

export const PaginationButton = styled.button<{
  $disabled?: boolean;
  $active?: boolean;
}>`
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  background-color: ${({ $active }) => ($active ? '#1890ff' : 'white')};
  color: ${({ $active }) => ($active ? 'white' : 'rgba(0, 0, 0, 0.85)')};
  border-radius: 6px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? '0.5' : '1')};
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    border-color: #1890ff;
    color: #1890ff;
  }

  ${({ $active, $disabled }) =>
    $active && !$disabled &&
    `
    border-color: #1890ff;
    &:hover {
      background-color: #40a9ff;
      border-color: #40a9ff;
      color: white;
    }
  `}
`;

export const LoadingOverlay = styled.div`
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
`;
