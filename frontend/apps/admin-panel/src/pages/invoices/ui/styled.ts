import styled from 'styled-components'

export const PageContainer = styled.div({
  padding: '24px',
  backgroundColor: '#ffffff',
  minHeight: '100vh'
})

export const Header = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px'
})

export const HeaderLeft = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
})

export const BackButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '18px',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1'
  }
})

export const Title = styled.h1({
  margin: 0,
  fontSize: '24px',
  fontWeight: '600',
  color: '#1e293b'
})

export const HeaderActions = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
})

export const ActionButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 16px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#64748b',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    color: '#475569'
  },

  '& span': {
    fontSize: '16px'
  }
})

export const AddButton = styled.button({
  padding: '10px 20px',
  border: 'none',
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#2563eb'
  }
})

export const SearchContainer = styled.div({
  display: 'flex',
  gap: '16px',
  marginBottom: '24px'
})

export const SearchInputWrapper = styled.div({
  flex: 1,
  position: 'relative',
  maxWidth: '400px'
})

export const SearchIcon = styled.span({
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94a3b8',
  pointerEvents: 'none'
})

export const FilterButton = styled.button({
  padding: '10px 16px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#64748b',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1'
  }
})

export const TableContainer = styled.div({
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: '#ffffff',
  minHeight: '400px'
})

export const LoadingContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '400px',
  fontSize: '16px',
  color: '#64748b'
})

export const EmptyState = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '400px',
  gap: '12px'
})

export const EmptyIcon = styled.div({
  fontSize: '64px',
  opacity: 0.5
})

export const EmptyText = styled.div({
  fontSize: '18px',
  fontWeight: '500',
  color: '#64748b'
})

export const EmptySubtext = styled.div({
  fontSize: '14px',
  color: '#94a3b8'
})

export const SearchInput = styled.input({
  width: '100%',
  paddingLeft: '36px',
  padding: '10px 12px 10px 40px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s ease',

  '&::placeholder': {
    color: '#94a3b8'
  },

  '&:focus': {
    borderColor: '#3b82f6'
  }
})

// Table styles
export const Table = styled.table({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '14px'
})

export const TableHead = styled.thead({
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #e2e8f0'
})

export const TableBody = styled.tbody({})

export const TableRow = styled.tr<{ $inactive?: boolean }>(({ $inactive }) => ({
  borderBottom: '1px solid #e2e8f0',
  transition: 'background-color 0.2s ease',
  opacity: $inactive ? 0.5 : 1,

  '&:hover': {
    backgroundColor: '#f8fafc'
  }
}))

export const TableHeaderCell = styled.th({
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: '500',
  color: '#64748b',
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
})

export const TableCell = styled.td({
  padding: '12px 16px',
  color: '#334155'
})

export const CheckboxCell = styled.td({
  width: '48px',
  padding: '12px 12px 12px 16px',
  color: '#334155'
})

export const Checkbox = styled.input({
  cursor: 'pointer',
  width: '16px',
  height: '16px'
})

export const AccountName = styled.div({
  fontWeight: '500',
  color: '#1e293b'
})

export const AccountType = styled.div({
  fontSize: '13px',
  color: '#64748b'
})

export const Balance = styled.div<{ $positive?: boolean }>(({ $positive }) => ({
  fontWeight: '500',
  color: $positive === false ? '#ef4444' : '#22c55e'
}))

export const Currency = styled.span({
  fontSize: '13px',
  color: '#64748b',
  marginLeft: '4px'
})

export const ActionCell = styled.td({
  width: '120px',
  padding: '12px 16px',
  textAlign: 'right',
  color: '#334155'
})

export const IconButton = styled.button({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  border: 'none',
  backgroundColor: 'transparent',
  borderRadius: '6px',
  cursor: 'pointer',
  color: '#64748b',
  transition: 'all 0.2s ease',
  marginLeft: '4px',

  '&:hover': {
    backgroundColor: '#f1f5f9',
    color: '#3b82f6'
  },

  '&:last-child': {
    marginLeft: '0'
  }
})

export const StatusBadge = styled.span<{ $active?: boolean }>(({ $active }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '500',
  backgroundColor: $active ? '#dcfce7' : '#f1f5f9',
  color: $active ? '#16a34a' : '#64748b'
}))

export const DeleteButton = styled.button({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  border: 'none',
  backgroundColor: 'transparent',
  borderRadius: '6px',
  cursor: 'pointer',
  color: '#64748b',
  transition: 'all 0.2s ease',
  marginLeft: '4px',

  '&:hover': {
    backgroundColor: '#fef2f2',
    color: '#ef4444'
  },

  '&:last-child': {
    marginLeft: '0'
  }
})

// Confirmation modal styles
export const ConfirmationOverlay = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
})

export const ConfirmationModal = styled.div({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '480px',
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
})

export const ConfirmationHeader = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 24px',
  borderBottom: '1px solid #e2e8f0'
})

export const ConfirmationTitle = styled.h2({
  margin: 0,
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b'
})

export const ConfirmationBody = styled.div({
  padding: '24px'
})

export const ConfirmationMessage = styled.p({
  margin: '0 0 12px',
  fontSize: '15px',
  color: '#334155',
  lineHeight: '1.5',

  '& strong': {
    fontWeight: '600',
    color: '#1e293b'
  }
})

export const ConfirmationWarning = styled.p({
  margin: '0 0 24px',
  fontSize: '13px',
  color: '#f59e0b',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',

  '&::before': {
    content: '"⚠️"',
    fontSize: '16px'
  }
})

export const ConfirmationActions = styled.div({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px'
})

export const CloseButton = styled.button({
  background: 'none',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  color: '#64748b',
  padding: '0',
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  transition: 'background-color 0.2s',

  '&:hover': {
    backgroundColor: '#f1f5f9',
  },
})

export const CancelButton = styled.button({
  padding: '10px 20px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  color: '#64748b',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    color: '#475569'
  }
})

export const DeleteConfirmButton = styled.button({
  padding: '10px 20px',
  border: 'none',
  backgroundColor: '#ef4444',
  color: '#ffffff',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#dc2626'
  }
})
