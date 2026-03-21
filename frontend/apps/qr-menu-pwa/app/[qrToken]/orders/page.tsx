'use client'

import { useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useMyQROrders, type QROrder } from '@restaurant-pos/api-client'

const STATUS_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  confirmed:  { label: 'Принят',       emoji: '✅', color: '#3b82f6' },
  preparing:  { label: 'Готовится',    emoji: '👨‍🍳', color: '#f59e0b' },
  ready:      { label: 'Готов',        emoji: '🎉', color: '#10b981' },
  paid:       { label: 'Оплачен',      emoji: '💳', color: '#6b7280' },
  cancelled:  { label: 'Отменён',      emoji: '❌', color: '#ef4444' },
}

export default function MyOrdersPage({ params }: { params: Promise<{ qrToken: string }> }) {
  const { qrToken } = use(params)
  const router = useRouter()

  const { data: orders, isLoading, refetch } = useMyQROrders(qrToken)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('qr_last_token', qrToken)

      if (!sessionStorage.getItem('qr_guest_token')) {
        router.replace(`/${qrToken}`)
      }
    }
  }, [qrToken, router])

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={() => router.push(`/${qrToken}/menu`)}>← Меню</button>
        <h2 style={styles.title}>Мои заказы</h2>
        <button style={styles.refreshBtn} onClick={() => refetch()}>🔄</button>
      </header>

      {isLoading && <p style={styles.empty}>Загрузка...</p>}

      {!isLoading && (!orders || orders.length === 0) && (
        <div style={styles.emptyBlock}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>Заказов пока нет</p>
          <button style={styles.menuBtn} onClick={() => router.push(`/${qrToken}/menu`)}>
            Перейти в меню
          </button>
        </div>
      )}

      <div style={styles.list}>
        {orders?.map(order => <OrderCard key={order.id} order={order} />)}
      </div>

      <p style={styles.hint}>💳 Оплата производится на кассе</p>
    </div>
  )
}

function OrderCard({ order }: { order: QROrder }) {
  const st = STATUS_LABELS[order.status] || { label: order.status, emoji: '📋', color: '#6b7280' }

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            {new Date(order.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div style={{ ...styles.badge, background: st.color }}>
          {st.emoji} {st.label}
        </div>
      </div>

      <div style={styles.items}>
        {order.items?.map(item => (
          <div key={item.id} style={styles.itemRow}>
            <span>{item.product?.name || item.tech_card?.name || 'Позиция'}</span>
            <span style={{ color: '#6b7280' }}>×{item.quantity}</span>
            <span style={{ fontWeight: '600' }}>{item.total_price.toLocaleString('ru-RU')} ₽</span>
          </div>
        ))}
      </div>

      <div style={styles.total}>
        <span>Итого</span>
        <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{order.total_amount.toLocaleString('ru-RU')} ₽</span>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100dvh', background: '#f5f5f5', paddingBottom: '2rem' },
  header: {
    background: '#ffffff',
    color: '#111827',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    borderBottom: '1px solid #e5e7eb',
  },
  backBtn: { background: 'none', border: 'none', color: '#374151', fontSize: '0.9rem', cursor: 'pointer' },
  refreshBtn: { background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' },
  title: { margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#111827' },
  empty: { textAlign: 'center', color: '#6b7280', padding: '2rem' },
  emptyBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' },
  menuBtn: { marginTop: '1.25rem', background: '#1677ff', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 2rem', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' },
  card: { background: 'white', borderRadius: '1rem', padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  badge: { color: 'white', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600' },
  items: { display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem', borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem' },
  itemRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', gap: '0.5rem' },
  total: { display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #e5e7eb', paddingTop: '0.5rem' },
  hint: { textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', padding: '0 1rem 1rem' },
}
