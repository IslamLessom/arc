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

export const FiltersContainer = styled.div({
  display: 'flex',
  gap: '16px',
  marginBottom: '24px',
  alignItems: 'center',
  flexWrap: 'wrap'
})

export const FilterLabel = styled.span({
  fontSize: '14px',
  color: '#64748b',
  fontWeight: '500'
})

export const AccountFilterButton = styled.button<{ $selected: boolean }>(props => ({
  padding: '8px 14px',
  border: `1px solid ${props.$selected ? '#3b82f6' : '#e2e8f0'}`,
  backgroundColor: props.$selected ? '#eff6ff' : '#ffffff',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  color: props.$selected ? '#3b82f6' : '#64748b',
  transition: 'all 0.2s ease',

  '&:hover': {
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc'
  }
}))

export const TableContainer = styled.div({
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: '#ffffff'
})

export const Table = styled.table({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '14px'
})

export const TableHead = styled.thead({
  backgroundColor: '#f8fafc',
  borderBottom: '2px solid #e2e8f0'
})

export const TableHeadCell = styled.th<{ $width?: string; $align?: 'left' | 'right' | 'center' }>(props => ({
  padding: '14px 16px',
  textAlign: props.$align || 'left',
  fontSize: '12px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  width: props.$width || 'auto',
  whiteSpace: 'nowrap'
}))

export const TableBody = styled.tbody({})

export const TableRow = styled.tr<{ $level: number; $isHeader?: boolean }>(props => ({
  borderBottom: '1px solid #f1f5f9',
  transition: 'background-color 0.2s ease',
  backgroundColor: props.$isHeader ? '#f8fafc' : 'transparent',

  '&:hover': {
    backgroundColor: props.$isHeader ? '#f1f5f9' : '#f8fafc'
  },

  ...(props.$level === 1 && {
    paddingLeft: '24px'
  })
}))

export const TableCell = styled.td<{ $align?: 'left' | 'right' | 'center'; $isBold?: boolean; $isMainRow?: boolean }>(props => ({
  padding: '12px 16px',
  textAlign: props.$align || 'left',
  fontSize: props.$isMainRow ? '14px' : '13px',
  fontWeight: props.$isBold ? '600' : '400',
  color: props.$isMainRow ? '#1e293b' : '#475569',
  whiteSpace: 'nowrap'
}))

export const RowLabelCell = styled(TableCell)<{ $level: number }>(props => ({
  paddingLeft: props.$level === 1 ? '48px' : '16px',
  cursor: props.$level === 0 ? 'pointer' : 'default',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}))

export const ExpandIcon = styled.span<{ $isExpanded: boolean }>(props => ({
  fontSize: '12px',
  transition: 'transform 0.2s ease',
  transform: props.$isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
  color: '#94a3b8'
}))

export const AmountCell = styled(TableCell)<{ $type: 'income' | 'expense' | 'balance' | 'net' | 'transfer'; $isNegative?: boolean }>(props => ({
  fontWeight: '600',
  color: props.$type === 'income' ? '#22c55e' :
         props.$type === 'expense' ? '#ef4444' :
         props.$type === 'transfer' ? '#3b82f6' :
         props.$type === 'net' && props.$isNegative ? '#ef4444' :
         props.$type === 'net' && !props.$isNegative ? '#22c55e' :
         '#1e293b',
  fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace"
}))

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

export const InfoBanner = styled.div({
  padding: '16px',
  backgroundColor: '#eff6ff',
  border: '1px solid #dbeafe',
  borderRadius: '8px',
  marginBottom: '20px',
  fontSize: '14px',
  color: '#1e40af',
  lineHeight: '1.5'
})

export const InfoBannerLink = styled.a({
  color: '#3b82f6',
  textDecoration: 'underline',
  cursor: 'pointer'
})
