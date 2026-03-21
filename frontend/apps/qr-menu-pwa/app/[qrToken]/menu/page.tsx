'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useQRTableInfo, useQRMenu, useCreateQROrder, type QRProduct, type QROrderItem } from '@restaurant-pos/api-client'

interface CartItem {
  product: QRProduct
  quantity: number
}

export default function QRMenuPage({ params }: { params: Promise<{ qrToken: string }> }) {
  const { qrToken } = use(params)
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [sending, setSending] = useState(false)
  const [orderDone, setOrderDone] = useState(false)

  const { data: info } = useQRTableInfo(qrToken)
  const { data: menu, isLoading } = useQRMenu(qrToken)
  const createOrder = useCreateQROrder(qrToken)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('qr_last_token', qrToken)

      // Проверяем аутентификацию
      const token = sessionStorage.getItem('qr_guest_token')
      if (!token) {
        router.replace(`/${qrToken}`)
        return
      }
      setGuestName(sessionStorage.getItem('qr_guest_name') || '')
    }
  }, [qrToken, router])

  useEffect(() => {
    if (menu && menu.length > 0 && !activeCategory) {
      setActiveCategory(menu[0].id)
    }
  }, [menu, activeCategory])

  const addToCart = (product: QRProduct) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const item = prev.find(i => i.product.id === productId)
      if (!item) return prev
      if (item.quantity <= 1) return prev.filter(i => i.product.id !== productId)
      return prev.map(i => i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i)
    })
  }

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  const handleOrder = async () => {
    if (cart.length === 0) return
    setSending(true)
    try {
      const items: QROrderItem[] = cart.map(i => ({ product_id: i.product.id, quantity: i.quantity }))
      await createOrder.mutateAsync(items)
      setCart([])
      setCartOpen(false)
      setOrderDone(true)
      setTimeout(() => router.push(`/${qrToken}/orders`), 1500)
    } catch {
      setSending(false)
      alert('Ошибка при отправке заказа. Попробуйте ещё раз.')
    }
  }

  if (isLoading) {
    return <div style={styles.loading}>Загружаем меню...</div>
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <div style={styles.restName}>{info?.establishment.name || '...'}</div>
          <div style={styles.tableName}>Стол №{info?.table.number}{info?.table.name ? ` — ${info.table.name}` : ''}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={styles.guestChip}>{guestName || '...'}</span>
          <button style={styles.ordersBtn} onClick={() => router.push(`/${qrToken}/orders`)}>
            Мои заказы
          </button>
        </div>
      </header>

      {/* Category tabs */}
      <div style={styles.catTabs}>
        {menu?.map(cat => (
          <button
            key={cat.id}
            style={{ ...styles.catTab, ...(activeCategory === cat.id ? styles.catTabActive : {}) }}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products */}
      <div style={styles.products}>
        {menu?.filter(cat => activeCategory === null || cat.id === activeCategory)
          .flatMap(cat => cat.products)
          .map(product => {
            const cartItem = cart.find(i => i.product.id === product.id)
            return (
              <div key={product.id} style={styles.productCard}>
                {product.cover_image && (
                  <img src={product.cover_image} alt={product.name} style={styles.productImg} />
                )}
                <div style={styles.productInfo}>
                  <div style={styles.productName}>{product.name}</div>
                  {product.description && (
                    <div style={styles.productDesc}>{product.description}</div>
                  )}
                  <div style={styles.productFooter}>
                    <span style={styles.productPrice}>{product.price.toLocaleString('ru-RU')} ₽</span>
                    {cartItem ? (
                      <div style={styles.qtyCtrl}>
                        <button style={styles.qtyBtn} onClick={() => removeFromCart(product.id)}>−</button>
                        <span style={styles.qtyNum}>{cartItem.quantity}</span>
                        <button style={styles.qtyBtn} onClick={() => addToCart(product)}>+</button>
                      </div>
                    ) : (
                      <button style={styles.addBtn} onClick={() => addToCart(product)}>+ В корзину</button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
      </div>

      {/* Cart fab */}
      {cartCount > 0 && !cartOpen && (
        <button style={styles.cartFab} onClick={() => setCartOpen(true)}>
          <div style={{ fontSize: '1.5rem' }}>🛒</div>
          <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>{cartCount}</div>
        </button>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div style={styles.cartOverlay} onClick={() => setCartOpen(false)}>
          <div style={styles.cartDrawer} onClick={e => e.stopPropagation()}>
            <div style={styles.cartHeader}>
              <h3 style={{ margin: 0 }}>Ваш заказ</h3>
              <button style={styles.closeBtn} onClick={() => setCartOpen(false)}>✕</button>
            </div>
            <div style={styles.cartItems}>
              {cart.map(item => (
                <div key={item.product.id} style={styles.cartItem}>
                  <span style={styles.cartItemName}>{item.product.name}</span>
                  <div style={styles.qtyCtrl}>
                    <button style={styles.qtyBtn} onClick={() => removeFromCart(item.product.id)}>−</button>
                    <span style={styles.qtyNum}>{item.quantity}</span>
                    <button style={styles.qtyBtn} onClick={() => addToCart(item.product)}>+</button>
                  </div>
                  <span style={styles.cartItemPrice}>{(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
                </div>
              ))}
            </div>
            <div style={styles.cartTotal}>
              <span>Итого:</span>
              <span style={{ fontWeight: '700', fontSize: '1.25rem' }}>{cartTotal.toLocaleString('ru-RU')} ₽</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.5rem 0' }}>💳 Оплата на кассе</p>
            <button
              style={{ ...styles.orderBtn, opacity: sending ? 0.7 : 1 }}
              onClick={handleOrder}
              disabled={sending}
            >
              {sending ? 'Отправляем заказ...' : '✅ Отправить заказ'}
            </button>
            {orderDone && <p style={{ color: '#10b981', textAlign: 'center', fontWeight: '600' }}>Заказ принят! 🎉</p>}
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100dvh', background: '#f5f5f5', paddingBottom: '5rem' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh', fontSize: '1.2rem', color: '#6b7280' },
  header: {
    background: '#ffffff',
    color: '#111827',
    padding: '1rem 1rem 0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    borderBottom: '1px solid #e5e7eb',
  },
  restName: { fontWeight: '700', fontSize: '1.1rem' },
  tableName: { fontSize: '0.8rem', color: '#6b7280', marginTop: '0.1rem' },
  guestChip: { background: '#f3f4f6', color: '#374151', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem' },
  ordersBtn: { background: '#ffffff', border: '1px solid #d1d5db', color: '#374151', padding: '0.3rem 0.7rem', borderRadius: '0.5rem', fontSize: '0.75rem', cursor: 'pointer' },
  catTabs: { display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.75rem 1rem', background: 'white', borderBottom: '1px solid #e5e7eb', scrollbarWidth: 'none' },
  catTab: { padding: '0.4rem 1rem', borderRadius: '999px', border: '1.5px solid #d1d5db', background: 'white', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#374151' },
  catTabActive: { background: '#1677ff', borderColor: '#1677ff', color: 'white', fontWeight: '600' },
  products: { display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem 1rem' },
  productCard: { background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' },
  productImg: { width: '100%', height: '180px', objectFit: 'cover' },
  productInfo: { padding: '0.875rem' },
  productName: { fontWeight: '600', fontSize: '1rem', color: '#111827', marginBottom: '0.25rem' },
  productDesc: { fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem', lineHeight: '1.4' },
  productFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontWeight: '700', fontSize: '1.1rem', color: '#111827' },
  addBtn: { background: '#1677ff', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600' },
  qtyCtrl: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  qtyBtn: { width: '2rem', height: '2rem', borderRadius: '50%', border: '1.5px solid #1677ff', background: 'white', color: '#1677ff', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qtyNum: { fontWeight: '700', fontSize: '1rem', minWidth: '1.5rem', textAlign: 'center' },
  cartFab: { position: 'fixed', bottom: 'calc(1rem + env(safe-area-inset-bottom))', right: '1rem', width: '60px', height: '60px', background: '#1677ff', color: 'white', border: 'none', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(22,119,255,0.35)', zIndex: 100 },
  cartOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' },
  cartDrawer: { background: 'white', borderRadius: '1.25rem 1.25rem 0 0', padding: '1.25rem 1.25rem calc(1rem + env(safe-area-inset-bottom))', width: '100%', minHeight: '42dvh', maxHeight: '88dvh', overflowY: 'auto' },
  cartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  closeBtn: { background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', cursor: 'pointer', fontSize: '1rem' },
  cartItems: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' },
  cartItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' },
  cartItemName: { flex: 1, fontSize: '0.9rem', fontWeight: '500' },
  cartItemPrice: { fontSize: '0.9rem', fontWeight: '600', minWidth: '70px', textAlign: 'right' },
  cartTotal: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid #e5e7eb', paddingTop: '0.875rem', marginBottom: '0.5rem' },
  orderBtn: { width: '100%', padding: '0.9rem', background: '#1677ff', color: 'white', border: 'none', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', marginTop: '0.5rem' },
}
