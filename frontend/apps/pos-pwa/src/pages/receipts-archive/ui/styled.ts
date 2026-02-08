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
  font-size: 16px;
  font-weight: 500;
`

export const HeaderTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
`

export const Content = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`

export const FilterSection = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`

export const FilterButton = styled.button<{ $active: boolean }>`
  padding: 10px 16px;
  background: ${props => props.$active ? '#4CAF50' : '#fff'};
  color: ${props => props.$active ? '#fff' : '#666'};
  border: 1px solid ${props => props.$active ? '#4CAF50' : '#e0e0e0'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? '#4CAF50' : '#f5f5f5'};
  }
`

export const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`

export const ReceiptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const ReceiptCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s;
  border-left: 4px solid #4CAF50;

  &:hover {
    transform: translateX(4px);
  }
`

export const ReceiptHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`

export const ReceiptNumber = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
`

export const ReceiptStatus = styled.div`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: #4CAF5020;
  color: #4CAF50;
`

export const ReceiptDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

export const ReceiptInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const ReceiptTable = styled.div`
  font-size: 14px;
  color: #666;
`

export const ReceiptTime = styled.div`
  font-size: 13px;
  color: #999;
`

export const ReceiptTotal = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
`

export const PaymentInfo = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
`

export const PaymentInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
`

export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;
`

export const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`

export const EmptyText = styled.div`
  font-size: 16px;
`

export const LoadingSpinner = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`

export const DateSection = styled.div`
  margin-bottom: 16px;
`

export const DateTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin-bottom: 12px;
`
