import styled from 'styled-components';

export const AuthPageContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#f5f5f5',
  padding: '20px',
});

export const AuthCard = styled.div({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '40px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
});

export const Title = styled.h1({
  fontSize: '24px',
  fontWeight: 600,
  color: '#333333',
  margin: '0 0 8px 0',
  textAlign: 'center',
});

export const Subtitle = styled.p({
  fontSize: '14px',
  color: '#666666',
  margin: '0 0 32px 0',
  textAlign: 'center',
});

export const SwitchModeContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid #f0f0f0',
});

export const SwitchModeText = styled.span({
  fontSize: '14px',
  color: '#666666',
});

export const SwitchModeLink = styled.button({
  fontSize: '14px',
  color: '#1890ff',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  textDecoration: 'underline',
  '&:hover': {
    color: '#40a9ff',
  },
});
