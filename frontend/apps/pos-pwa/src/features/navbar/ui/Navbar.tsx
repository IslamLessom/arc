import * as Styled from './styled';
import { useNavbar } from '../hooks/useNavbar';
import { NavbarProps } from '../model/types';
import { useCurrentUser } from '@restaurant-pos/api-client';

export const Navbar = (props: NavbarProps) => {
  const {} = useNavbar(props);
  const { data: currentUser } = useCurrentUser();

  console.log(currentUser);

  return (
    <Styled.NavbarContainer>
      {currentUser?.name && <Styled.EmployeeName>{currentUser.name}</Styled.EmployeeName>}
      <Styled.TabButton>Заказы</Styled.TabButton>
      <Styled.TabButton>Карта зала</Styled.TabButton>
      <Styled.TabButton>Архив чеков</Styled.TabButton>
    </Styled.NavbarContainer>
  );
};

