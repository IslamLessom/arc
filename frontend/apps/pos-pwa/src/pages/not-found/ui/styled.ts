import styled from 'styled-components'

export const Container = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#f5f5f5',
  padding: '20px',
})

export const Content = styled.div({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '48px',
  maxWidth: '480px',
  width: '100%',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
})

export const Title = styled.h1({
  fontSize: '72px',
  fontWeight: 700,
  color: '#1890ff',
  margin: '0 0 16px 0',
})

export const Subtitle = styled.h2({
  fontSize: '24px',
  fontWeight: 600,
  color: '#333333',
  margin: '0 0 16px 0',
})

export const Description = styled.p({
  fontSize: '16px',
  color: '#666666',
  margin: '0 0 32px 0',
  lineHeight: '1.5',
})
