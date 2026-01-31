import { Input } from '@restaurant-pos/ui'
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

export const SearchInput = styled(Input)({
  width: '100%',
  paddingLeft: '36px'
})

export const Table = styled.table({
  width: '100%',
  borderCollapse: 'collapse'
})

export const TableHeader = styled.thead({
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #e2e8f0'
})

export const TableRow = styled.tr({
  borderBottom: '1px solid #e2e8f0',
  transition: 'background-color 0.2s ease',

  '&:hover': {
    backgroundColor: '#f8fafc'
  }
})

export const TableCell = styled.td({
  padding: '16px',
  fontSize: '14px',
  color: '#334155'
})

export const TableHeadCell = styled.th({
  padding: '12px 16px',
  fontSize: '12px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  textAlign: 'left'
})

export const TypeBadge = styled.span<{ $type: 'income' | 'expense' | 'transfer' }>((props) => ({
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '500',
  backgroundColor: getTypeColor(props.$type),
  color: '#ffffff'
}))

export const AmountCell = styled(TableCell)<{ $type: 'income' | 'expense' | 'transfer' }>((props) => ({
  fontWeight: '600',
  color: props.$type === 'income' ? '#10b981' : props.$type === 'expense' ? '#ef4444' : '#3b82f6'
}))

function getTypeColor(type: 'income' | 'expense' | 'transfer'): string {
  switch (type) {
    case 'income':
      return '#10b981'
    case 'expense':
      return '#ef4444'
    case 'transfer':
      return '#3b82f6'
  }
}
