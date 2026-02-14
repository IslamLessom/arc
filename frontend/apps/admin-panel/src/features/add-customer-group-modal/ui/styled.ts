import styled from 'styled-components'

export const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transition: opacity 0.2s ease-in-out;
`

export const ModalContainer = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
`

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  color: #333;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #f5f5f5;
    border-radius: 4px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`

export const ModalBody = styled.div`
  padding: 24px;
`

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const FormRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const RowLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #666;
`

export const RowContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const StyledInput = styled.input<{ $hasError?: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${({ $hasError }) => ($hasError ? '#ff4d4f' : '#d9d9d9')};
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ $hasError }) => ($hasError ? '#ff4d4f' : '#1890ff')};
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`

export const Required = styled.span`
  color: #ff4d4f;
  margin-left: 4px;
`

export const FieldError = styled.span`
  font-size: 12px;
  color: #ff4d4f;
`

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
  background-color: #fafafa;
`

export const FooterActions = styled.div`
  display: flex;
  gap: 12px;
`

export const SaveButton = styled.button<{ $disabled?: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background-color: #1890ff;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #40a9ff;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
