'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [tokenInput, setTokenInput] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const lastToken = sessionStorage.getItem('qr_last_token')
    if (!lastToken) return

    const hasGuestSession = Boolean(sessionStorage.getItem('qr_guest_token'))
    if (hasGuestSession) {
      router.replace(`/${lastToken}/menu`)
      return
    }

    router.replace(`/${lastToken}`)
  }, [router])

  const handleOpenToken = () => {
    const cleaned = tokenInput.trim()
    if (!cleaned) return
    router.push(`/${cleaned}`)
  }

  return (
    <main style={{ padding: '2rem 1rem', maxWidth: '560px', margin: '0 auto' }}>
      <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>QR Menu</h1>
      <p style={{ marginTop: 0, color: '#6b7280' }}>
        Откройте ссылку из QR-кода стола или вставьте QR token вручную.
      </p>

      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          background: '#fff'
        }}
      >
        <label htmlFor="qr-token" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
          QR token
        </label>
        <input
          id="qr-token"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleOpenToken()
            }
          }}
          placeholder="например: 8b3e7f1b-..."
          style={{
            width: '100%',
            padding: '0.7rem 0.8rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            marginBottom: '0.75rem'
          }}
        />
        <button
          type="button"
          onClick={handleOpenToken}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: 'none',
            borderRadius: '8px',
            background: '#111827',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Открыть меню
        </button>
      </div>
    </main>
  )
}

