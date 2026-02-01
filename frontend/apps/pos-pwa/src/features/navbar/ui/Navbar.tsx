import * as Styled from './styled';
import { useNavbar } from '../hooks/useNavbar';
import { NavbarProps } from '../model/types';

export const Navbar = (props: NavbarProps) => {
  const {} = useNavbar(props);

  return (
    <Styled.NavbarContainer>
      <Styled.TabButton>Заказы</Styled.TabButton>
      <Styled.TabButton>Карта зала</Styled.TabButton>
      <Styled.TabButton>Архив чеков</Styled.TabButton>
    </Styled.NavbarContainer>
  );
};

