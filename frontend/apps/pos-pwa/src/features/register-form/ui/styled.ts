import styled from 'styled-components';

export const Form = styled.form({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%',
});

export const InputGroup = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const Label = styled.label({
  fontSize: '14px',
  fontWeight: 500,
  color: '#333333',
});

export const Input = styled.input({
  padding: '12px 16px',
  fontSize: '14px',
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  outline: 'none',
  transition: 'border-color 0.2s',
  '&:focus': {
    borderColor: '#1890ff',
    boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
  },
  '&:disabled': {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed',
  },
});

export const ErrorMessage = styled.div({
  color: '#ff4d4f',
  fontSize: '14px',
  padding: '8px 0',
});
