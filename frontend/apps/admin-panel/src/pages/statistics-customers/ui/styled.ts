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
  marginBottom: '24px'
})

export const DateFilter = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0'
})

export const FilterLabel = styled.span({
  fontSize: '14px',
  fontWeight: '500',
  color: '#64748b'
})

export const DateSelect = styled.button<{ active?: boolean }>(({ active = false }) => ({
  padding: '8px 16px',
  border: '1px solid #e2e8f0',
  backgroundColor: active ? '#3b82f6' : '#ffffff',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  color: active ? '#ffffff' : '#475569',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: active ? '#2563eb' : '#f8fafc',
    borderColor: active ? '#2563eb' : '#cbd5e1'
  }
}))

export const CardsGrid = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '16px',
  marginBottom: '24px'
})

export const StatCard = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '20px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
})

export const CardIcon = styled.div({
  fontSize: '32px'
})

export const CardContent = styled.div({
  flex: 1
})

export const CardLabel = styled.div({
  fontSize: '14px',
  color: '#64748b',
  marginBottom: '4px'
})

export const CardValue = styled.div({
  fontSize: '24px',
  fontWeight: '600',
  color: '#1e293b'
})

export const ContentGrid = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '24px',
  marginBottom: '24px'
})

export const ChartSection = styled.div({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
})

export const SectionTitle = styled.h2({
  margin: '0 0 16px 0',
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b'
})

export const ChartPlaceholder = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '300px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: '2px dashed #e2e8f0'
})

export const ChartIcon = styled.div({
  fontSize: '48px',
  marginBottom: '12px'
})

export const ChartText = styled.div({
  fontSize: '14px',
  color: '#64748b'
})

export const TableSection = styled.div({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
})

export const TablePlaceholder = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '300px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: '2px dashed #e2e8f0'
})

export const TableIcon = styled.div({
  fontSize: '48px',
  marginBottom: '12px'
})

export const TableText = styled.div({
  fontSize: '14px',
  color: '#64748b'
})

export const DetailsSection = styled.div({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
})

export const DetailsPlaceholder = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '200px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: '2px dashed #e2e8f0'
})

export const DetailsIcon = styled.div({
  fontSize: '48px',
  marginBottom: '12px'
})

export const DetailsText = styled.div({
  fontSize: '14px',
  color: '#64748b'
})

export const TableContainer = styled.div({
  overflowX: 'auto',
  borderRadius: '8px',
  border: '1px solid #e2e8f0'
})

export const Table = styled.table({
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: '#ffffff'
})

export const TableHead = styled.thead({
  backgroundColor: '#f8fafc'
})

export const TableBody = styled.tbody({})

export const TableRow = styled.tr({
  '&:nth-child(even)': {
    backgroundColor: '#f8fafc'
  },
  '&:hover': {
    backgroundColor: '#f1f5f9'
  }
})

export const TableHeaderCell = styled.th({
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '14px',
  fontWeight: '600',
  color: '#475569',
  borderBottom: '1px solid #e2e8f0',
  whiteSpace: 'nowrap'
})

export const TableCell = styled.td({
  padding: '12px 16px',
  fontSize: '14px',
  color: '#1e293b',
  borderBottom: '1px solid #e2e8f0'
})
