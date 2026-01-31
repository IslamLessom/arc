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

export const ContentContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
})

export const Section = styled.div({
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px',
  backgroundColor: '#ffffff'
})

export const SectionTitle = styled.h2({
  margin: '0 0 16px 0',
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b'
})

export const DataRow = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: '1px solid #f1f5f9',

  '&:last-child': {
    borderBottom: 'none'
  }
})

export const DataLabel = styled.div<{ bold?: boolean }>(({ bold = false }) => ({
  fontSize: '14px',
  color: '#64748b',
  fontWeight: bold ? '600' : '400'
}))

export const DataValue = styled.div<{ type?: 'positive' | 'negative'; bold?: boolean }>(({ type, bold = false }) => ({
  fontSize: '16px',
  fontWeight: bold ? '600' : '500',
  color: type === 'positive' ? '#10b981' : type === 'negative' ? '#ef4444' : '#1e293b'
}))

export const SummarySection = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '24px',
  border: '2px solid #3b82f6',
  borderRadius: '12px',
  backgroundColor: '#f8fafc'
})

export const SummaryLabel = styled.div({
  fontSize: '20px',
  fontWeight: '600',
  color: '#1e293b'
})

export const SummaryValue = styled.div({
  fontSize: '28px',
  fontWeight: '700',
  color: '#3b82f6'
})

export const LoadingContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '400px',
  fontSize: '16px',
  color: '#64748b'
})
