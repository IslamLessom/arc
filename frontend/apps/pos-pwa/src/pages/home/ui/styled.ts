import styled from 'styled-components';
import { MdMenu, MdLock, MdOutlineArrowForwardIos } from 'react-icons/md';
import { FaUtensils } from 'react-icons/fa';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f2f5;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #36393f;
  color: white;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const PosterText = styled.span`
  font-weight: bold;
`;

export const MenuIcon = styled(MdMenu)`
  font-size: 24px;
`;

export const MakiText = styled.span`
  font-weight: bold;
`;

export const LockIcon = styled(MdLock)`
  font-size: 24px;
`;

export const GreenDot = styled.div`
  width: 10px;
  height: 10px;
  background-color: #28a745;
  border-radius: 50%;
`;

export const MainContent = styled.div`
  flex-grow: 1;
  padding: 20px;
  background-color: white;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const NewOrderButton = styled.button`
  background-color: #28aa25;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 20px;
  &:hover {
    background-color: #218838;
  }
`;

export const OrderListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
`;

export const OrderListHeaderText = styled.span`
  font-weight: bold;
  color: #666;
`;

export const OrderSection = styled.div`
  margin-bottom: 20px;
`;

export const SectionTitle = styled.h3`
  color: #007bff;
  margin-bottom: 10px;
  cursor: pointer;
`;

export const OrderItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
`;

export const OrderTime = styled.span`
  font-weight: bold;
  font-size: 1.2em;
`;

export const OrderTimeDetails = styled.span`
  color: #999;
  font-size: 0.9em;
  margin-left: 10px;
`;

export const OrderTableInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const OrderIcon = styled(FaUtensils)`
  font-size: 18px;
  color: #666;
`;

export const OrderNumber = styled.span`
  color: #007bff;
  font-weight: bold;
`;

export const OrderTable = styled.span`
  color: #333;
  font-weight: bold;
`;

export const PayButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

export const OrderTotal = styled.span`
  font-weight: bold;
  font-size: 1.2em;
`;

export const ArrowIcon = styled(MdOutlineArrowForwardIos)`
  font-size: 18px;
  color: #999;
`;

