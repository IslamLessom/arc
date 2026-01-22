import styled from 'styled-components'

export const BalancesContainer = styled.div({
  padding: '2rem',
  maxWidth: '1400px',
  margin: '0 auto',
})

export const Header = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
})

export const Title = styled.h1({
  margin: 0,
  fontSize: '1.875rem',
  fontWeight: 600,
  color: '#111827',
})

export const FiltersContainer = styled.div({
  display: 'flex',
  gap: '1rem',
  marginBottom: '1.5rem',
  flexWrap: 'wrap',
})

export const FilterInput = styled.input({
  padding: '0.5rem 0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  fontSize: '0.875rem',
  minWidth: '200px',
  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
})

export const FilterSelect = styled.select({
  padding: '0.5rem 0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  fontSize: '0.875rem',
  minWidth: '200px',
  backgroundColor: 'white',
  cursor: 'pointer',
  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
})

export const Table = styled.table({
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: 'white',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
})

export const TableHead = styled.thead({
  backgroundColor: '#f9fafb',
})

export const TableHeader = styled.th({
  padding: '0.75rem 1rem',
  textAlign: 'left',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#374151',
  borderBottom: '1px solid #e5e7eb',
})

export const TableBody = styled.tbody({})

export const TableRow = styled.tr({
  borderBottom: '1px solid #e5e7eb',
  '&:hover': {
    backgroundColor: '#f9fafb',
  },
  '&:last-child': {
    borderBottom: 'none',
  },
})

export const TableCell = styled.td({
  padding: '0.75rem 1rem',
  fontSize: '0.875rem',
  color: '#111827',
})

export const Badge = styled.span<{ $variant?: 'warning' | 'success' }>(({ $variant }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.25rem 0.5rem',
  borderRadius: '0.25rem',
  fontSize: '0.75rem',
  fontWeight: 500,
  backgroundColor: $variant === 'warning' ? '#fef3c7' : '#d1fae5',
  color: $variant === 'warning' ? '#92400e' : '#065f46',
}))

export const LimitInput = styled.input({
  padding: '0.25rem 0.5rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.25rem',
  fontSize: '0.875rem',
  width: '80px',
  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
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

export const EmptyContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4rem',
  color: '#6b7280',
})

