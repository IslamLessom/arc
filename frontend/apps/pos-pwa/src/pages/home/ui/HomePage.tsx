import * as Styled from './styled';
import { useHomePage } from '../hooks/useHomePage';
import { Navbar } from '@/features/navbar';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

export function HomePage() {
  const { handleNewOrderClick, activeOrders } = useHomePage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLockClick = () => {
    // Удаляем только бэкапы токенов владельца
    localStorage.removeItem('owner_token_backup');
    localStorage.removeItem('owner_refresh_token_backup');
    // Устанавливаем флаг блокировки
    localStorage.setItem('is_locked', 'true');

    // Очищаем кеш пользователя
    queryClient.clear();
    // Переходим на страницу ввода PIN-кода
    navigate('/pin-login');
  };

  // Группируем заказы по датам (сегодня / предыдущие дни)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = activeOrders.data?.filter(order => {
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  }) || [];

  const previousDaysOrders = activeOrders.data?.filter(order => {
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() < today.getTime();
  }) || [];

  const formatOrderTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatOrderDuration = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);

    if (diffMinutes < 60) {
      const lastDigit = diffMinutes % 10;
      const lastTwoDigits = diffMinutes % 100;

      let suffix = '';
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        suffix = '';
      } else if (lastDigit === 1) {
        suffix = 'у';
      } else if (lastDigit >= 2 && lastDigit <= 4) {
        suffix = 'ы';
      }
      return `${diffMinutes} минут${suffix}`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    const lastDigit = diffHours % 10;
    const lastTwoDigits = diffHours % 100;

    let suffix = '';
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      suffix = 'ов';
    } else if (lastDigit === 1) {
      suffix = '';
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      suffix = 'а';
    } else {
      suffix = 'ов';
    }
    return `${diffHours} час${suffix}`;
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2).replace('.', ',')} ₽`;
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/order/${orderId}`);
  };

  const renderOrderItem = (order: any) => (
    <Styled.OrderItem key={order.id} onClick={() => handleOrderClick(order.id)}>
      <Styled.OrderTime>{formatOrderTime(order.createdAt)}</Styled.OrderTime>
      <Styled.OrderTimeDetails>{formatOrderDuration(order.createdAt)}</Styled.OrderTimeDetails>
      <Styled.OrderTableInfo>
        <Styled.OrderIcon />
        <Styled.OrderNumber>№{order.id.slice(-4)}</Styled.OrderNumber>
        <Styled.OrderTable>СТОЛ {order.tableNumber || '-'}</Styled.OrderTable>
      </Styled.OrderTableInfo>
      {order.status !== 'paid' && order.status !== 'cancelled' && (
        <Styled.PayButton>Перейти к оплате</Styled.PayButton>
      )}
      <Styled.OrderTotal>{formatPrice(order.totalAmount)}</Styled.OrderTotal>
      <Styled.ArrowIcon />
    </Styled.OrderItem>
  );

  return (
    <Styled.Container>
      <Styled.Header>
        <Navbar />
        <Styled.HeaderRight>
          <Styled.PosterText>ARCE</Styled.PosterText>
          <Styled.MenuIcon />
          <Styled.LockWrapper onClick={handleLockClick}>
            <Styled.LockIcon />
            <Styled.GreenDot />
          </Styled.LockWrapper>
        </Styled.HeaderRight>
      </Styled.Header>
      <Styled.MainContent>
        <Styled.NewOrderButton onClick={handleNewOrderClick}>Новый заказ</Styled.NewOrderButton>
        <Styled.OrderListHeader>
          <Styled.OrderListHeaderText>Открыт</Styled.OrderListHeaderText>
          <Styled.OrderListHeaderText>Заказ</Styled.OrderListHeaderText>
          <Styled.OrderListHeaderText>Сумма</Styled.OrderListHeaderText>
        </Styled.OrderListHeader>

        {activeOrders.isLoading ? (
          <Styled.OrderSection>
            <Styled.SectionTitle>Загрузка...</Styled.SectionTitle>
          </Styled.OrderSection>
        ) : (
          <>
            {previousDaysOrders.length > 0 && (
              <Styled.OrderSection>
                <Styled.SectionTitle>ПРЕДЫДУЩИЕ ДНИ {previousDaysOrders.length}</Styled.SectionTitle>
                {previousDaysOrders.map(renderOrderItem)}
              </Styled.OrderSection>
            )}

            {todayOrders.length > 0 && (
              <Styled.OrderSection>
                <Styled.SectionTitle>СЕГОДНЯ {todayOrders.length}</Styled.SectionTitle>
                {todayOrders.map(renderOrderItem)}
              </Styled.OrderSection>
            )}

            {!activeOrders.data || activeOrders.data.length === 0 ? (
              <Styled.OrderSection>
                <Styled.SectionTitle>Нет активных заказов</Styled.SectionTitle>
              </Styled.OrderSection>
            ) : null}
          </>
        )}
      </Styled.MainContent>
    </Styled.Container>
  );
}
