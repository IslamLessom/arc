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

export const FilterTabs = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  background: #fff;
  padding: 8px;
  border-radius: 12px;
`

export const FilterTab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 16px;
  background: ${props => props.$active ? '#4CAF50' : 'transparent'};
  color: ${props => props.$active ? '#fff' : '#666'};
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? '#4CAF50' : '#f0f0f0'};
  }
`

export const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const OrderCard = styled.div<{ $status: string }>`
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s;
  border-left: 4px solid ${props => getStatusColor(props.$status)};

  &:hover {
    transform: translateX(4px);
  }
`

export const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`

export const OrderNumber = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
`

export const OrderStatus = styled.div<{ $status: string }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => getStatusColor(props.$status)}20;
  color: ${props => getStatusColor(props.$status)};
`

export const OrderDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const OrderTable = styled.div`
  font-size: 14px;
  color: #666;
`

export const OrderTime = styled.div`
  font-size: 13px;
  color: #999;
`

export const OrderTotal = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
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

// Helpers
function getStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return '#FFA726'
    case 'confirmed':
      return '#42A5F5'
    case 'preparing':
      return '#AB47BC'
    case 'ready':
      return '#26C6DA'
    case 'paid':
      return '#4CAF50'
    case 'cancelled':
      return '#EF5350'
    default:
      return '#999'
  }
}
