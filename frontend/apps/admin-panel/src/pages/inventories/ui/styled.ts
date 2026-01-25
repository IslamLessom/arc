import { Input } from '@restaurant-pos/ui'
import styled from 'styled-components'

export const PageContainer = styled.div({
  padding: '24px',
  backgroundColor: '#ffffff',
  minHeight: '100vh',
})

export const Header = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
})

export const HeaderLeft = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
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
    borderColor: '#cbd5e1',
  },
})

export const Title = styled.h1({
  margin: 0,
  fontSize: '24px',
  fontWeight: '600',
  color: '#1e293b',
})

export const HeaderActions = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
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
    color: '#475569',
  },

  '& span': {
    fontSize: '16px',
  },
})

export const AddButton = styled.button({
  padding: '10px 20px',
  border: 'none',
  backgroundColor: '#10b981',
  color: '#ffffff',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#059669',
  },
})

export const InfoSection = styled.div({
  display: 'flex',
  gap: '24px',
  marginBottom: '24px',
  padding: '24px',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
})

export const InfoContent = styled.div({
  flex: 1,
})

export const InfoTitle = styled.h2({
  margin: '0 0 12px 0',
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b',
})

export const InfoText = styled.p({
  margin: '0 0 16px 0',
  fontSize: '14px',
  color: '#64748b',
  lineHeight: '1.6',
})

export const InfoLink = styled.a({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  color: '#3b82f6',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'color 0.2s ease',

  '&:hover': {
    color: '#2563eb',
  },
})

export const InfoIcon = styled.div({
  width: '80px',
  height: '80px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '48px',
})

export const ArrowLine = styled.div({
  position: 'absolute',
  right: '-100px',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '120px',
  height: '2px',
  backgroundColor: '#cbd5e1',
  '&::after': {
    content: '""',
    position: 'absolute',
    right: '-8px',
    top: '-6px',
    width: 0,
    height: 0,
    borderLeft: '10px solid #cbd5e1',
    borderTop: '7px solid transparent',
    borderBottom: '7px solid transparent',
  },
})

export const SearchContainer = styled.div({
  display: 'flex',
  gap: '16px',
  marginBottom: '24px',
})

export const SearchInputWrapper = styled.div({
  flex: 1,
  position: 'relative',
  maxWidth: '400px',
})

export const SearchIcon = styled.span({
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94a3b8',
  pointerEvents: 'none',
})

export const FilterSelect = styled.select({
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
    borderColor: '#cbd5e1',
  },
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
    borderColor: '#cbd5e1',
  },
})

export const TableContainer = styled.div({
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: '#ffffff',
})

export const LoadingContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '400px',
  fontSize: '16px',
  color: '#64748b',
})

export const ErrorContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '400px',
  fontSize: '16px',
  color: '#ef4444',
  textAlign: 'center',
  padding: '24px',
})

export const EmptyState = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '80px 24px',
  textAlign: 'center',
})

export const EmptyStateTitle = styled.h3({
  margin: '0 0 12px 0',
  fontSize: '20px',
  fontWeight: '600',
  color: '#1e293b',
})

export const EmptyStateText = styled.p({
  margin: 0,
  fontSize: '14px',
  color: '#64748b',
  lineHeight: '1.6',
  maxWidth: '500px',
})

export const SearchInput = styled(Input)({
  width: '100%',
  paddingLeft: '36px',
})

