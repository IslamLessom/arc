import * as Styled from './styled';
import { useNavbar } from '../hooks/useNavbar';
import { NavbarProps } from '../model/types';
import { useCurrentUser } from '@restaurant-pos/api-client';
import { useNavigate } from 'react-router-dom';

export const Navbar = (props: NavbarProps) => {
  const {} = useNavbar(props);
  const { data: currentUser } = useCurrentUser();
  const navigate = useNavigate();

  const handleOrdersClick = () => {
    navigate('/orders');
  };

  const handleMapClick = () => {
    navigate('/table-selection');
  };

  const handleReceiptsClick = () => {
    navigate('/receipts');
  };

  return (
    <Styled.NavbarContainer>
      {currentUser?.name && <Styled.EmployeeName>{currentUser.name}</Styled.EmployeeName>}
      <Styled.TabButton onClick={handleOrdersClick}>Заказы</Styled.TabButton>
      <Styled.TabButton onClick={handleMapClick}>Карта зала</Styled.TabButton>
      <Styled.TabButton onClick={handleReceiptsClick}>Архив чеков</Styled.TabButton>
    </Styled.NavbarContainer>
  );
};

