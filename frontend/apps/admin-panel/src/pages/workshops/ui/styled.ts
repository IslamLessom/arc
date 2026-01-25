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

export const FilterButton = styled.button({
  padding: '10px 16px',
  border: '1px solid #3b82f6',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#3b82f6',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb'
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

