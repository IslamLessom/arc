import styled from 'styled-components'

export const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

export const ModalContainer = styled.div`
  background: #fff;
  border-radius: 10px;
  width: 92%;
  max-width: 680px;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.2);
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
`

export const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`

export const ModalBody = styled.div`
  padding: 20px 24px;
`

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const FormRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`

export const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

export const RowLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: #475569;
`

export const RowContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const StyledInput = styled.input<{ $hasError?: boolean }>`
  padding: 9px 12px;
  border: 1px solid ${({ $hasError }) => ($hasError ? '#ef4444' : '#d1d5db')};
  border-radius: 8px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${({ $hasError }) => ($hasError ? '#ef4444' : '#3b82f6')};
  }
`

export const StyledSelect = styled.select<{ $hasError?: boolean }>`
  padding: 9px 12px;
  border: 1px solid ${({ $hasError }) => ($hasError ? '#ef4444' : '#d1d5db')};
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #fff;
`

export const StyledTextarea = styled.textarea<{ $hasError?: boolean }>`
  padding: 9px 12px;
  border: 1px solid ${({ $hasError }) => ($hasError ? '#ef4444' : '#d1d5db')};
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  min-height: 84px;
  resize: vertical;
`

export const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #334155;
`

export const Required = styled.span`
  color: #ef4444;
`

export const FieldError = styled.span`
  font-size: 12px;
  color: #ef4444;
`

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
  background: #fafafa;
`

export const CancelButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
`

export const SaveButton = styled.button<{ $disabled?: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.65 : 1)};
`
