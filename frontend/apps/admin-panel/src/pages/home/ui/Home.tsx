import { Button, ButtonVariant } from '@restaurant-pos/ui'
import { useHome } from '../hooks/useHome'
import { useCurrentUser } from '@restaurant-pos/api-client'
import { useNavigate } from 'react-router-dom'

export const Home = () => {
  const { services, currentServiceId, handleServiceClick } = useHome()
  const { data: currentUser, isLoading } = useCurrentUser()
  const navigate = useNavigate()

  const quickActions = [
    { id: 'stats', name: 'Статистика', emoji: '📊', description: 'Просмотр аналитики', route: '/statistics/sales' },
    { id: 'employees', name: 'Сотрудники', emoji: '👥', description: 'Управление персоналом', route: '/access/employees' },
    { id: 'menu', name: 'Меню', emoji: '🍽️', description: 'Редактирование меню', route: '/menu/products' },
    { id: 'warehouse', name: 'Склад', emoji: '📦', description: 'Управление складом', route: '/warehouse/balances' },
  ]

  // Вычисляем дни до окончания подписки
  const getDaysRemaining = () => {
    if (!currentUser?.subscription?.end_date) return 0
    const endDate = new Date(currentUser.subscription.end_date)
    const now = new Date()
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, daysRemaining)
  }

  // Вычисляем общую длительность подписки
  const getSubscriptionDuration = () => {
    if (!currentUser?.subscription?.start_date || !currentUser?.subscription?.end_date) return 0
    const startDate = new Date(currentUser.subscription.start_date)
    const endDate = new Date(currentUser.subscription.end_date)
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, duration)
  }

  const isExpired = () => {
    if (!currentUser?.subscription?.end_date) return true
    const endDate = new Date(currentUser.subscription.end_date)
    return endDate < new Date()
  }

  const getSubscriptionStatus = () => {
    if (!currentUser?.subscription) return 'inactive'
    if (isExpired()) return 'expired'
    const daysRemaining = getDaysRemaining()
    if (daysRemaining <= 3) return 'warning'
    return 'active'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const daysRemaining = getDaysRemaining()
  const subscriptionStatus = getSubscriptionStatus()

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Заголовок */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>
          Добро пожаловать, {currentUser?.name || 'Пользователь'}!
        </h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Панель управления вашим рестораном
        </p>
      </div>

      {/* Карточка подписки */}
      {!isLoading && (
        <div
          style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            borderRadius: '12px',
            background:
              subscriptionStatus === 'expired'
                ? '#fee2e2'
                : subscriptionStatus === 'warning'
                  ? '#fef3c7'
                  : subscriptionStatus === 'active'
                    ? '#d1fae5'
                    : '#f3f4f6',
            border: `2px solid ${
              subscriptionStatus === 'expired'
                ? '#ef4444'
                : subscriptionStatus === 'warning'
                  ? '#f59e0b'
                  : subscriptionStatus === 'active'
                    ? '#10b981'
                    : '#d1d5db'
            }`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                {currentUser?.subscription ? 'Статус подписки' : 'Подписка не активна'}
              </h2>
              {currentUser?.subscription && (
                <>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#4b5563' }}>
                    Тариф:{' '}
                    <strong>
                      {currentUser.subscription.plan?.name || 'Не указан'}
                    </strong>
                  </p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#4b5563' }}>
                    Окончание:{' '}
                    <strong>{formatDate(currentUser.subscription.end_date)}</strong>
                  </p>
                </>
              )}
            </div>

            <div
              style={{
                textAlign: 'right',
                minWidth: '150px',
              }}
            >
              {currentUser?.subscription ? (
                <>
                  <div
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 700,
                      lineHeight: 1,
                      color:
                        subscriptionStatus === 'expired'
                          ? '#dc2626'
                          : subscriptionStatus === 'warning'
                            ? '#d97706'
                            : '#059669',
                    }}
                  >
                    {daysRemaining}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {daysRemaining === 1 ? 'день остался' : 'дней осталось'}
                  </div>
                  {subscriptionStatus === 'expired' && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#dc2626',
                        fontWeight: 600,
                      }}
                    >
                      Подписка истекла
                    </div>
                  )}
                  {subscriptionStatus === 'warning' && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#d97706',
                        fontWeight: 600,
                      }}
                    >
                      Требуется продление
                    </div>
                  )}
                </>
              ) : (
                <Button variant={ButtonVariant.Default} style={{ marginTop: '0.5rem' }}>
                  Активировать подписку
                </Button>
              )}
            </div>
          </div>

          {/* Информация о подписке */}
          {currentUser?.subscription && (
            <div
              style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(0,0,0,0.1)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>
                  Длительность подписки
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>
                  {getSubscriptionDuration()} дней
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>
                  Автопродление
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>
                  {currentUser.subscription.auto_renew ? 'Включено' : 'Выключено'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>
                  Статус
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>
                  {currentUser.subscription.is_active ? 'Активна' : 'Неактивна'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Быстрые действия */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>
          Быстрые действия
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {quickActions.map((action) => (
            <div
              key={action.id}
              onClick={() => navigate(action.route)}
              style={{
                padding: '1.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{action.emoji}</div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{action.name}</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                {action.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Доступные сервисы */}
      <div>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>
          Доступные сервисы
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
          }}
        >
          {services.map((service) => (
            <div
              key={service.id}
              style={{
                padding: '1.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
                {service.name}
              </h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                {service.description}
              </p>
              <Button
                onClick={() => handleServiceClick(service.url)}
                disabled={service.id === currentServiceId}
                variant={service.id === currentServiceId ? ButtonVariant.Outline : ButtonVariant.Default}
                style={{ marginTop: '0.5rem' }}
              >
                {service.id === currentServiceId ? 'Текущий сервис' : 'Перейти'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}


