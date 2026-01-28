import styled from 'styled-components'
import { Input } from '@restaurant-pos/ui'

export const Overlay = styled.div<{ $isOpen: boolean }>((props) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.35)',
  display: props.$isOpen ? 'flex' : 'none',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '24px',
}))

export const ModalContainer = styled.div({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
  maxWidth: '600px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative',
})

export const PageHeader = styled.div({
  padding: '20px 24px',
  borderBottom: '1px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
})

export const HeaderLeft = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
})

export const BackButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '18px',
  color: '#64748b',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    color: '#475569',
  },
})

export const HeaderTitle = styled.h2({
  margin: 0,
  fontSize: '22px',
  fontWeight: 600,
  color: '#1f2937',
})

export const ModalBody = styled.div({
  padding: '24px',
})

export const Form = styled.form({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
})

export const FormRows = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
})

export const FormRow = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

export const RowLabel = styled.label({
  fontSize: '14px',
  fontWeight: 500,
  color: '#374151',
})

export const RowContent = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const Required = styled.span({
  color: '#ef4444',
})

export const StyledSelect = styled.select<{ $hasError?: boolean }>((props) => ({
  padding: '10px 12px',
  fontSize: '14px',
  border: props.$hasError ? '1px solid #ff4d4f' : '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: '#111827',
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'border-color 0.2s',
  '&:focus': {
    outline: 'none',
    borderColor: props.$hasError ? '#ff4d4f' : '#3b82f6',
    boxShadow: props.$hasError
      ? '0 0 0 2px rgba(255, 77, 79, 0.2)'
      : '0 0 0 2px rgba(59, 130, 246, 0.2)',
  },
  '&:hover': {
    borderColor: props.$hasError ? '#ff4d4f' : '#94a3b8',
  },
}))

export const StyledInput = styled(Input)<{ $hasError?: boolean }>((props) => ({
  borderColor: props.$hasError ? '#ff4d4f' : undefined,
  '&:focus': {
    borderColor: props.$hasError ? '#ff4d4f' : undefined,
    boxShadow: props.$hasError
      ? '0 0 0 2px rgba(255, 77, 79, 0.2)'
      : undefined,
  },
}))

export const DateTimeContainer = styled.div({
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
})

export const DateInput = styled.input<{ $hasError?: boolean }>((props) => ({
  padding: '10px 12px',
  fontSize: '14px',
  border: props.$hasError ? '1px solid #ff4d4f' : '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: '#111827',
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'border-color 0.2s',
  '&:focus': {
    outline: 'none',
    borderColor: props.$hasError ? '#ff4d4f' : '#3b82f6',
    boxShadow: props.$hasError
      ? '0 0 0 2px rgba(255, 77, 79, 0.2)'
      : '0 0 0 2px rgba(59, 130, 246, 0.2)',
  },
  '&:hover': {
    borderColor: props.$hasError ? '#ff4d4f' : '#94a3b8',
  },
}))

export const TimeInputs = styled.div({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
})

export const TimeInput = styled.input<{ $hasError?: boolean }>((props) => ({
  padding: '10px 12px',
  fontSize: '14px',
  border: props.$hasError ? '1px solid #ff4d4f' : '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: '#111827',
  fontFamily: 'inherit',
  width: '60px',
  textAlign: 'center',
  transition: 'border-color 0.2s',
  '&:focus': {
    outline: 'none',
    borderColor: props.$hasError ? '#ff4d4f' : '#3b82f6',
    boxShadow: props.$hasError
      ? '0 0 0 2px rgba(255, 77, 79, 0.2)'
      : '0 0 0 2px rgba(59, 130, 246, 0.2)',
  },
  '&:hover': {
    borderColor: props.$hasError ? '#ff4d4f' : '#94a3b8',
  },
}))

export const TimeSeparator = styled.span({
  fontSize: '14px',
  color: '#64748b',
})

export const OptionGroup = styled.div({
  display: 'flex',
  gap: '12px',
})

export const OptionButton = styled.button<{ $isSelected: boolean }>((props) => ({
  flex: 1,
  padding: '12px 16px',
  border: props.$isSelected ? '2px solid #3b82f6' : '1px solid #d1d5db',
  backgroundColor: props.$isSelected ? '#eff6ff' : '#ffffff',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: props.$isSelected ? 500 : 400,
  color: props.$isSelected ? '#3b82f6' : '#374151',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: props.$isSelected ? '#3b82f6' : '#94a3b8',
    backgroundColor: props.$isSelected ? '#eff6ff' : '#f8fafc',
  },
}))

export const WarningText = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 16px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#92400e',
  marginTop: '8px',
})

export const InfoIcon = styled.span({
  fontSize: '16px',
  cursor: 'help',
})

export const FieldError = styled.span({
  fontSize: '12px',
  color: '#ef4444',
})

export const ModalFooter = styled.div({
  padding: '20px 24px',
  borderTop: '1px solid #e5e7eb',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
})

export const FooterActions = styled.div({
  display: 'flex',
  gap: '12px',
})

export const SaveButton = styled.button<{ $disabled?: boolean }>((props) => ({
  padding: '10px 20px',
  border: 'none',
  backgroundColor: props.$disabled ? '#9ca3af' : '#10b981',
  color: '#ffffff',
  borderRadius: '8px',
  cursor: props.$disabled ? 'not-allowed' : 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: props.$disabled ? '#9ca3af' : '#059669',
  },
}))

export const ItemsSection = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

export const SelectedItemsList = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  maxHeight: '200px',
  overflowY: 'auto',
  padding: '4px',
})

export const SelectedItemItem = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  gap: '12px',
})

export const ItemInfo = styled.div({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
})

export const ItemName = styled.div({
  fontSize: '14px',
  fontWeight: 500,
  color: '#1f2937',
})

export const ItemDetails = styled.div({
  fontSize: '12px',
  color: '#64748b',
})

export const ItemActions = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
})

export const QuantityInput = styled.input({
  width: '80px',
  padding: '6px 8px',
  fontSize: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  textAlign: 'center',
  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
  },
})

export const RemoveButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  border: 'none',
  backgroundColor: '#ef4444',
  color: '#ffffff',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: '#dc2626',
  },
  '&:disabled': {
    backgroundColor: '#fca5a5',
    cursor: 'not-allowed',
  },
})

export const SearchContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const SearchInput = styled.input({
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: '#111827',
  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
  },
  '&::placeholder': {
    color: '#9ca3af',
  },
})

export const StockItemsList = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  maxHeight: '200px',
  overflowY: 'auto',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '4px',
})

export const StockItem = styled.button({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: '10px 12px',
  border: 'none',
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: '#f1f5f9',
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
})

export const StockItemName = styled.span({
  fontSize: '14px',
  color: '#1f2937',
})

export const StockItemQuantity = styled.span({
  fontSize: '12px',
  color: '#64748b',
})

export const EmptyState = styled.div({
  padding: '20px',
  textAlign: 'center',
  fontSize: '14px',
  color: '#64748b',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
})

// Product Tree Styles
export const ProductTreeContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  height: '100%',
})

export const TreeHeader = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})

export const TreeTitle = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#374151',
})

export const TreeInfoIcon = styled.span({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '18px',
  height: '18px',
  borderRadius: '50%',
  backgroundColor: '#e5e7eb',
  color: '#6b7280',
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'help',
})

export const TreeSearchContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const TreeSearchInput = styled.input({
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: '#111827',
  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
  },
  '&::placeholder': {
    color: '#9ca3af',
  },
})

export const TreeContent = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  maxHeight: '400px',
  overflowY: 'auto',
  padding: '4px',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  backgroundColor: '#fafafa',
})

export const TreeNode = styled.div<{ $level: number }>((props) => ({
  marginLeft: `${props.$level * 16}px`,
}))

export const TreeNodeHeader = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px',
  borderRadius: '4px',
  transition: 'backgroundColor 0.15s',
  '&:hover': {
    backgroundColor: '#f3f4f6',
  },
})

export const TreeNodeCheckbox = styled.input({
  cursor: 'pointer',
  width: '16px',
  height: '16px',
  accentColor: '#10b981',
})

export const TreeNodeToggle = styled.button<{ $hasChildren: boolean; $expanded: boolean }>(
  (props) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#6b7280',
    fontSize: '10px',
    cursor: props.$hasChildren ? 'pointer' : 'default',
    transition: 'transform 0.15s',
    transform: props.$expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
    '&:hover': props.$hasChildren
      ? {
          color: '#374151',
        }
      : undefined,
  })
)

export const TreeNodeLabel = styled.span({
  flex: 1,
  fontSize: '14px',
  color: '#1f2937',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
})

export const TreeNodeCount = styled.span({
  fontSize: '12px',
  color: '#9ca3af',
  fontWeight: 400,
})

export const TreeNodeChildren = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
})

export const TreeEmptyState = styled.div({
  padding: '40px 20px',
  textAlign: 'center',
  fontSize: '14px',
  color: '#9ca3af',
})
