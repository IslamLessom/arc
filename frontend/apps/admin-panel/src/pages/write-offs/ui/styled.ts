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

export const TabsContainer = styled.div({
  display: 'flex',
  gap: '8px',
  marginBottom: '24px',
  borderBottom: '1px solid #e2e8f0'
})

export const Tab = styled.button<{ $active?: boolean }>((props) => ({
  padding: '12px 16px',
  border: 'none',
  backgroundColor: 'transparent',
  color: props.$active ? '#3b82f6' : '#64748b',
  fontSize: '14px',
  fontWeight: props.$active ? '600' : '400',
  cursor: 'pointer',
  borderBottom: props.$active ? '2px solid #3b82f6' : '2px solid transparent',
  transition: 'all 0.2s ease',

  '&:hover': {
    color: '#3b82f6'
  }
}))

export const SearchContainer = styled.div({
  display: 'flex',
  gap: '16px',
  marginBottom: '24px',
  alignItems: 'center'
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

export const FilterSelect = styled.select({
  padding: '10px 16px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#64748b',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1'
  }
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
  backgroundColor: '#ffffff'
})

export const LoadingContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '400px',
  fontSize: '16px',
  color: '#64748b'
})

export const ErrorContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '400px',
  fontSize: '16px',
  color: '#ef4444',
  textAlign: 'center',
  padding: '24px'
})

export const SearchInput = styled(Input)({
  width: '100%',
  paddingLeft: '36px'
})

export const EmptyMessage = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '400px',
  fontSize: '16px',
  color: '#64748b',
  textAlign: 'center'
})

