import * as Styled from './styled';
import { useHomePage } from '../hooks/useHomePage';
import { Navbar } from '@/features/navbar';

export function HomePage() {
  const { handleNewOrderClick } = useHomePage();

  return (
    <Styled.Container>
      <Styled.Header>
        <Navbar />
        <Styled.HeaderRight>
          <Styled.PosterText>Poster</Styled.PosterText>
          <Styled.MenuIcon />
          <Styled.MakiText>Maki</Styled.MakiText>
          <Styled.LockIcon />
          <Styled.GreenDot />
        </Styled.HeaderRight>
      </Styled.Header>
      <Styled.MainContent>
        <Styled.NewOrderButton onClick={handleNewOrderClick}>Новый заказ</Styled.NewOrderButton>
        <Styled.OrderListHeader>
          <Styled.OrderListHeaderText>Открыт</Styled.OrderListHeaderText>
          <Styled.OrderListHeaderText>Заказ</Styled.OrderListHeaderText>
          <Styled.OrderListHeaderText>Сумма</Styled.OrderListHeaderText>
        </Styled.OrderListHeader>
        <Styled.OrderSection>
          <Styled.SectionTitle>ПРЕДЫДУЩИЕ ДНИ 2</Styled.SectionTitle>
        </Styled.OrderSection>
        <Styled.OrderSection>
          <Styled.SectionTitle>СЕГОДНЯ 1</Styled.SectionTitle>
          <Styled.OrderItem>
            <Styled.OrderTime>11:33</Styled.OrderTime>
            <Styled.OrderTimeDetails>7 минут</Styled.OrderTimeDetails>
            <Styled.OrderTableInfo>
              <Styled.OrderIcon />
              <Styled.OrderNumber>№3</Styled.OrderNumber>
              <Styled.OrderTable>СТОЛ 1</Styled.OrderTable>
            </Styled.OrderTableInfo>
            <Styled.PayButton>Перейти к оплате</Styled.PayButton>
            <Styled.OrderTotal>0,00 ₽</Styled.OrderTotal>
            <Styled.ArrowIcon />
          </Styled.OrderItem>
        </Styled.OrderSection>
      </Styled.MainContent>
    </Styled.Container>
  );
}
