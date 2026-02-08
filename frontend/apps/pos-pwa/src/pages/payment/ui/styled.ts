import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
`

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`

export const HeaderCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`

export const HeaderTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
`

export const HeaderSubtitle = styled.div`
  font-size: 14px;
  color: #666;
`

export const HeaderRight = styled.div`
  width: 24px;
`

export const Content = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`

export const SummaryCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

export const SummaryTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
`

export const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`

export const SummaryLabel = styled.div`
  font-size: 15px;
  color: #666;
`

export const SummaryValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
`

export const TotalValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #4CAF50;
`

export const PaymentMethodsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
`

export const PaymentMethodCard = styled.div<{ $selected: boolean }>`
  background: #fff;
  border: 2px solid ${props => props.$selected ? '#4CAF50' : '#e0e0e0'};
  border-radius: 12px;
  padding: 20px 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  &:hover {
    border-color: ${props => props.$selected ? '#4CAF50' : '#4CAF50'};
  }

  ${props => props.$selected && `
    background: #f0f9f0;
  `}
`

export const PaymentMethodIcon = styled.div`
  font-size: 32px;
`

export const PaymentMethodName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
`

export const SplitPaymentSection = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

export const SplitSectionTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
`

export const SplitInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`

export const SplitLabel = styled.div`
  flex: 1;
  font-size: 15px;
  color: #666;
`

export const SplitInput = styled.input`
  width: 140px;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  text-align: right;

  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`

export const RemainingAmount = styled.div`
  text-align: center;
  padding: 12px;
  background: #fff3cd;
  border-radius: 8px;
  font-size: 14px;
  color: #856404;
  margin-top: 12px;
`

export const PayButton = styled.button<{ $disabled: boolean }>`
  width: 100%;
  padding: 18px;
  background: ${props => props.$disabled ? '#ccc' : '#4CAF50'};
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.2s;

  &:hover {
    background: ${props => props.$disabled ? '#ccc' : '#45a049'};
  }

  &:disabled {
    opacity: 0.6;
  }
`

export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #666;
`

export const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`
