import styled from 'styled-components'

export const PageContainer = styled.div({
  padding: '2rem',
  maxWidth: '1400px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  minHeight: '100vh',
})

export const Header = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  paddingBottom: '1rem',
  borderBottom: '1px solid #e5e7eb',
})

export const HeaderLeft = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
})

export const BackButton = styled.button({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  color: '#6b7280',
  fontSize: '1.5rem',
  '&:hover': {
    color: '#111827',
  },
})

export const Title = styled.h1({
  margin: 0,
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#111827',
})

export const HeaderActions = styled.div({
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
})

export const ActionButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 1rem',
  background: 'none',
  border: '1px solid #e5e7eb',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  fontSize: '0.875rem',
  color: '#374151',
  '&:hover': {
    backgroundColor: '#f9fafb',
  },
})

export const AddButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 1rem',
  background: '#10b981',
  border: 'none',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  fontSize: '0.875rem',
  color: '#ffffff',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: '#059669',
  },
})

export const SearchContainer = styled.div({
  display: 'flex',
  gap: '1rem',
  marginBottom: '1.5rem',
  alignItems: 'center',
})

export const SearchInputWrapper = styled.div({
  position: 'relative',
  flex: 1,
  maxWidth: '400px',
  '& input': {
    paddingLeft: '2.5rem',
  },
})

export const SearchIcon = styled.span({
  position: 'absolute',
  left: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#6b7280',
  pointerEvents: 'none',
  fontSize: '1rem',
})

export const FilterButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 1rem',
  background: 'none',
  border: '1px solid #e5e7eb',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  fontSize: '0.875rem',
  color: '#374151',
  '&:hover': {
    backgroundColor: '#f9fafb',
  },
})

export const TableContainer = styled.div({
  backgroundColor: '#ffffff',
  borderRadius: '0.5rem',
  border: '1px solid #e5e7eb',
  overflow: 'hidden',
})

export const Table = styled.table({
  width: '100%',
  borderCollapse: 'collapse',
})

export const TableHead = styled.thead({
  backgroundColor: '#f9fafb',
})

export const TableHeaderCell = styled.th<{ $sortable?: boolean }>((props) => ({
  padding: '1rem',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.875rem',
  color: '#374151',
  borderBottom: '1px solid #e5e7eb',
  cursor: props.$sortable ? 'pointer' : 'default',
  userSelect: 'none',
  '&:hover': props.$sortable
    ? {
        backgroundColor: '#f3f4f6',
      }
    : {},
}))

export const SortIcon = styled.span({
  marginLeft: '0.5rem',
  fontSize: '0.75rem',
  color: '#6b7280',
})

export const TableBody = styled.tbody({})

export const TableRow = styled.tr({
  borderBottom: '1px solid #e5e7eb',
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: '#f9fafb',
  },
})

export const TableCell = styled.td({
  padding: '1rem',
  fontSize: '0.875rem',
  color: '#111827',
})

export const TotalRow = styled.tr({
  backgroundColor: '#f9fafb',
  fontWeight: 600,
  borderTop: '2px solid #e5e7eb',
})

export const RowActions = styled.div({
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
  justifyContent: 'flex-end',
})

export const EditLink = styled.button({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.25rem 0.5rem',
  fontSize: '0.875rem',
  color: '#3b82f6',
  '&:hover': {
    textDecoration: 'underline',
  },
})

export const MoreButton = styled.button({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.25rem',
  color: '#6b7280',
  fontSize: '1.25rem',
  '&:hover': {
    color: '#111827',
  },
})

export const LoadingContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '4rem',
  color: '#6b7280',
})

export const ErrorContainer = styled.div({
  padding: '1rem',
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  borderRadius: '0.5rem',
  marginBottom: '1rem',
})



