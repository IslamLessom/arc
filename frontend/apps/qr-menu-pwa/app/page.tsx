'use client'

import { SERVICES } from '@restaurant-pos/types'
import { Button } from '@restaurant-pos/ui'

export default function Home() {
  const currentServiceId = 'qr-menu-pwa'

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>QR Menu</h1>
      <p>Меню и онлайн-заказы для гостей</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Доступные сервисы</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {SERVICES.map((service) => (
            <div
              key={service.id}
              style={{
                padding: '1.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
                {service.name}
              </h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                {service.description}
              </p>
              <Button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = service.url
                  }
                }}
                disabled={service.id === currentServiceId}
                variant={service.id === currentServiceId ? 'outline' : 'default'}
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

