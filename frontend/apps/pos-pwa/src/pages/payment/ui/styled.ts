import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
  gap: 0;
`

export const TopNavHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 20px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
`

export const NavButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: #c62828;
  cursor: pointer;
  padding: 8px 12px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: #ffebee;
    border-radius: 6px;
  }

  &:active {
    transform: scale(0.98);
  }
`

export const NavTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  flex: 1;
  text-align: center;
`

export const NavSubtitle = styled.div`
  font-size: 13px;
  color: #666;
  text-align: center;
`

export const NavSpacing = styled.div`
  width: 60px;
`

export const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  gap: 0;
  overflow: hidden;
`

export const LeftPanel = styled.div`
  flex: 0 0 auto;
  width: 40%;
  background: #fff;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-right: 1px solid #e0e0e0;
  overflow: hidden;
`

export const QuickAmountGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  flex-shrink: 0;
  height: 100px;
`

export const KeyboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 12px;
  flex: 1;
  width: 100%;
`

export const KeyboardButton = styled.button`
  width: 100%;
  height: 100%;
  padding: 0;
  background: #f0f0f0;
  border: 2px solid #ddd;
  border-radius: 12px;
  font-size: 28px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-height: 800px) {
    font-size: 24px;
  }

  @media (max-height: 700px) {
    font-size: 22px;
  }

  &:hover {
    background: #e8e8e8;
    transform: scale(1.02);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }

  &:active {
    background: #d8d8d8;
    transform: scale(0.98);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`

export const RightPanel = styled.div`
  flex: 1;
  background: #fff;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;
  min-width: 0;
`

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
`

export const HeaderTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
`

export const HeaderSubtitle = styled.div`
  font-size: 14px;
  color: #999;
`

export const TotalSection = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
`

export const TotalLabel = styled.div`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`

export const TotalAmount = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
`

export const PaymentMethodsSection = styled.div`
  margin-bottom: 16px;
`

export const PaymentMethodLabel = styled.div`
  font-size: 12px;
  color: #666;
  font-weight: 500;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const PaymentMethodsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const PaymentMethodOption = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: ${props => props.$selected ? '#f0f9f0' : '#fafafa'};
  border: 2px solid ${props => props.$selected ? '#4CAF50' : '#e0e0e0'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #4CAF50;
    background: #f0f9f0;
  }
`

export const PaymentMethodOptionIcon = styled.div`
  font-size: 18px;
  width: 24px;
  text-align: center;
`

export const PaymentMethodOptionText = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  flex: 1;
`

export const PaymentMethodOptionAmount = styled.div`
  font-size: 12px;
  color: #999;
  font-weight: 500;
`

export const EditablePaymentField = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: ${props => props.$active ? '#e3f2fd' : '#fafafa'};
  border: 2px solid ${props => props.$active ? '#2196F3' : '#e0e0e0'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;

  &:hover {
    border-color: #2196F3;
    background: #e3f2fd;
  }
`

export const PaymentFieldIcon = styled.div`
  font-size: 24px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

export const PaymentFieldContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const PaymentFieldLabel = styled.div`
  font-size: 13px;
  color: #666;
  font-weight: 500;
`

export const PaymentFieldAmount = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
`

export const ChangeHint = styled.div`
  font-size: 11px;
  color: #4CAF50;
  font-weight: 500;
  margin-top: 2px;
`

export const ChangeSection = styled.div`
  background: #f0f9f0;
  border: 1px solid #4CAF50;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const ChangeLabel = styled.div`
  font-size: 13px;
  color: #666;
  font-weight: 500;
`

export const ChangeAmount = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #4CAF50;
`

export const SplitPaymentSection = styled.div`
  background: #f5f5f5;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
`

export const SplitInputRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
`

export const SplitLabel = styled.div`
  font-size: 13px;
  color: #666;
  font-weight: 500;
`

export const SplitAmount = styled.div`
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 600;
`

export const OptionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  margin-bottom: 16px;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
`

export const OptionLabel = styled.div`
  font-size: 13px;
  color: #1a1a1a;
  font-weight: 500;
`

export const Toggle = styled.input.attrs({ type: 'checkbox' })`
  width: 44px;
  height: 24px;
  cursor: pointer;
  appearance: none;
  background: #ccc;
  border: none;
  border-radius: 12px;
  position: relative;
  transition: background 0.3s;

  &:checked {
    background: #4CAF50;
  }

  &::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: left 0.3s;
  }

  &:checked::before {
    left: 22px;
  }
`

export const ButtonsFooter = styled.div`
  display: flex;
  gap: 12px;
  margin-top: auto;
`

export const CloseButton = styled.button`
  flex: 1;
  padding: 14px 20px;
  background: white;
  color: #c62828;
  border: 2px solid #ffebee;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ffebee;
  }

  &:active {
    transform: scale(0.98);
  }
`

export const PayButton = styled.button`
  flex: 1;
  padding: 14px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #45a049;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`

export const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`

export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 16px;
  color: #666;
`

// Deprecated styles (kept for backward compatibility)
export const Header2 = styled.div`
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

export const SplitSectionTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
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
  padding: 10px;
  background: #fff3cd;
  border-radius: 6px;
  font-size: 12px;
  color: #856404;
  margin-top: 8px;
`
