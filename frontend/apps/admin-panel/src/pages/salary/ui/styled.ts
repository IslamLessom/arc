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

export const FilterContainer = styled.div({
  display: 'flex',
  gap: '16px',
  marginBottom: '24px',
  alignItems: 'center'
})

export const DateFilter = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
})

export const DateLabel = styled.span({
  fontSize: '14px',
  color: '#64748b',
  fontWeight: '500'
})

export const DateInput = styled.input({
  padding: '8px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1e293b',
  outline: 'none',
  transition: 'border-color 0.2s ease',

  '&:focus': {
    borderColor: '#3b82f6'
  }
})

export const TableContainer = styled.div({
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: '#ffffff'
})

export const Table = styled.table({
  width: '100%',
  borderCollapse: 'collapse'
})

export const TableHeader = styled.thead({
  backgroundColor: '#f8fafc'
})

export const TableRow = styled.tr({
  '&:hover': {
    backgroundColor: '#f8fafc'
  }
})

export const TableCell = styled.th<{
  $align?: 'left' | 'center' | 'right'
  $width?: string
}>((props) => ({
  padding: '12px 16px',
  textAlign: props.$align || 'left',
  fontSize: '13px',
  fontWeight: '600',
  color: '#64748b',
  borderBottom: '1px solid #e2e8f0',
  width: props.$width,
  whiteSpace: 'nowrap'
}))

export const TableData = styled.td<{
  $align?: 'left' | 'center' | 'right'
}>((props) => ({
  padding: '12px 16px',
  textAlign: props.$align || 'left',
  fontSize: '14px',
  color: '#1e293b',
  borderBottom: '1px solid #e2e8f0'
}))

export const TotalRow = styled.tr({
  backgroundColor: '#f1f5f9',
  fontWeight: '600'
})

export const TotalCell = styled.td<{
  $align?: 'left' | 'center' | 'right'
}>((props) => ({
  padding: '16px',
  textAlign: props.$align || 'right',
  fontSize: '15px',
  color: '#1e293b',
  fontWeight: '600',
  borderTop: '2px solid #e2e8f0'
}))

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

export const LoadingContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '400px',
  fontSize: '16px',
  color: '#64748b'
})

export const SalaryValue = styled.span<{
  $highlight?: boolean
}>((props) => ({
  fontWeight: props.$highlight ? '600' : '400',
  color: props.$highlight ? '#3b82f6' : '#1e293b'
}))

export const ErrorMessage = styled.div({
  padding: '16px',
  backgroundColor: '#fee2e2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  color: '#991b1b',
  marginBottom: '24px'
})
