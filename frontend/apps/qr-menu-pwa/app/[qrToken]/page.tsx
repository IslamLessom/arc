'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useQRTableInfo, useCreateGuestSession, useLoginGuest, useRegisterGuest } from '@restaurant-pos/api-client'

// Emoji pool for anonymous users
const EMOJI_POOL = ['🐶','🐱','🐻','🦊','🐼','🐨','🦁','🐯','🐸','🐧','🦋','🐬','🦄','🌟','🎈','🍕','🍦','🎵']
function randomEmoji() {
  return EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)] + 
         EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)]
}

type Mode = 'choose' | 'anonymous' | 'login' | 'register'

export default function QRLandingPage({ params }: { params: Promise<{ qrToken: string }> }) {
  const { qrToken } = use(params)
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('choose')
  const [guestName, setGuestName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')

  const { data: info, isLoading, isError } = useQRTableInfo(qrToken)
  const createSession = useCreateGuestSession()
  const loginGuest = useLoginGuest()
  const registerGuest = useRegisterGuest()

  // если гость уже авторизован — сразу на меню
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('qr_last_token', qrToken)
    }

    if (typeof window !== 'undefined' && sessionStorage.getItem('qr_guest_token')) {
      router.replace(`/${qrToken}/menu`)
    }
  }, [qrToken, router])

  if (isLoading) {
    return <Screen><Spinner>Загрузка...</Spinner></Screen>
  }
  if (isError || !info) {
    return (
      <Screen>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <h2 style={{ marginBottom: '0.5rem' }}>QR-код не найден</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Попробуйте отсканировать код заново</p>
        </div>
      </Screen>
    )
  }

  const handleAnonymous = async () => {
    const name = guestName.trim() || randomEmoji()
    try {
      await createSession.mutateAsync({ qrToken, guestName: name })
      router.push(`/${qrToken}/menu`)
    } catch {
      setError('Не удалось создать сессию. Попробуйте ещё раз.')
    }
  }

  const handleLogin = async () => {
    setError('')
    try {
      await loginGuest.mutateAsync({ qrToken, phone, password })
      router.push(`/${qrToken}/menu`)
    } catch {
      setError('Неверный телефон или пароль')
    }
  }

  const handleRegister = async () => {
    setError('')
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
    if (!fullName || !phone || !password) {
      setError('Заполните все поля')
      return
    }
    if (password.length < 6) {
      setError('Пароль минимум 6 символов')
      return
    }
    try {
      await registerGuest.mutateAsync({ qrToken, guestName: fullName, phone, password })
      router.push(`/${qrToken}/menu`)
    } catch (e: any) {
      if (e?.response?.status === 409) {
        setError('Этот номер уже зарегистрирован. Войдите в аккаунт.')
      } else {
        setError('Ошибка регистрации. Попробуйте ещё раз.')
      }
    }
  }

  return (
    <Screen>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.restaurantName}>{info.establishment.name}</div>
        <div style={styles.tableTag}>Стол №{info.table.number}{info.table.name ? ` — ${info.table.name}` : ''}</div>
      </div>

      <div style={styles.card}>
        {mode === 'choose' && (
          <>
            <h2 style={styles.title}>Добро пожаловать! 👋</h2>
            <p style={styles.subtitle}>Выберите, как хотите сделать заказ</p>

            <button style={styles.btnPrimary} onClick={() => setMode('anonymous')}>
              🎭 Войти анонимно
            </button>
            <button style={styles.btnOutline} onClick={() => setMode('login')}>
              📱 Войти / Зарегистрироваться
            </button>
            <p style={styles.hint}>
              При регистрации вы получаете доступ к акциям и бонусам 🎁
            </p>
          </>
        )}

        {mode === 'anonymous' && (
          <>
            <button style={styles.backBtn} onClick={() => { setMode('choose'); setError('') }}>← Назад</button>
            <h2 style={styles.title}>Анонимный вход</h2>
            <p style={styles.subtitle}>Введите никнейм или оставьте поле пустым — мы придумаем за вас 😄</p>

            <input
              style={styles.input}
              placeholder="Ваш никнейм (необязательно)"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              maxLength={40}
            />
            {error && <p style={styles.error}>{error}</p>}
            <button
              style={{ ...styles.btnPrimary, opacity: createSession.isPending ? 0.7 : 1 }}
              onClick={handleAnonymous}
              disabled={createSession.isPending}
            >
              {createSession.isPending ? 'Входим...' : '🍽️ Перейти к меню'}
            </button>
          </>
        )}

        {mode === 'login' && (
          <>
            <button style={styles.backBtn} onClick={() => { setMode('choose'); setError('') }}>← Назад</button>
            <h2 style={styles.title}>Вход</h2>

            <input style={styles.input} placeholder="Телефон" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            <input style={styles.input} placeholder="Пароль" type="password" value={password} onChange={e => setPassword(e.target.value)} />

            {error && <p style={styles.error}>{error}</p>}
            <button
              style={{ ...styles.btnPrimary, opacity: loginGuest.isPending ? 0.7 : 1 }}
              onClick={handleLogin}
              disabled={loginGuest.isPending}
            >
              {loginGuest.isPending ? 'Входим...' : 'Войти'}
            </button>
            <button style={styles.btnText} onClick={() => { setMode('register'); setError('') }}>
              Нет аккаунта? Зарегистрироваться
            </button>
          </>
        )}

        {mode === 'register' && (
          <>
            <button style={styles.backBtn} onClick={() => { setMode('login'); setError('') }}>← Назад</button>
            <h2 style={styles.title}>Регистрация</h2>
            <p style={styles.subtitle}>Получайте акции и бонусы 🎁</p>

            <input style={styles.input} placeholder="Имя" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <input style={styles.input} placeholder="Фамилия" value={lastName} onChange={e => setLastName(e.target.value)} />
            <input style={styles.input} placeholder="Телефон" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            <input style={styles.input} placeholder="Пароль (мин. 6 символов)" type="password" value={password} onChange={e => setPassword(e.target.value)} />

            {error && <p style={styles.error}>{error}</p>}
            <button
              style={{ ...styles.btnPrimary, opacity: registerGuest.isPending ? 0.7 : 1 }}
              onClick={handleRegister}
              disabled={registerGuest.isPending}
            >
              {registerGuest.isPending ? 'Регистрируем...' : 'Зарегистрироваться'}
            </button>
          </>
        )}
      </div>
    </Screen>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem' }}>
      {children}
    </div>
  )
}

function Spinner({ children }: { children: React.ReactNode }) {
  return <div style={{ color: '#374151', fontSize: '1.2rem', marginTop: '4rem' }}>{children}</div>
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    textAlign: 'center',
    color: '#111827',
    marginTop: '2rem',
    marginBottom: '1.5rem',
  },
  restaurantName: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
  },
  tableTag: {
    background: '#e5e7eb',
    color: '#374151',
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  card: {
    background: 'white',
    borderRadius: '1.25rem',
    padding: '2rem 1.5rem',
    width: '100%',
    maxWidth: '420px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 6px 20px rgba(15,23,42,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  title: {
    fontSize: '1.375rem',
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    lineHeight: '1.5',
  },
  btnPrimary: {
    width: '100%',
    padding: '0.875rem',
    background: '#1677ff',
    color: 'white',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnOutline: {
    width: '100%',
    padding: '0.875rem',
    background: '#ffffff',
    color: '#1677ff',
    border: '1px solid #1677ff',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnText: {
    background: 'none',
    border: 'none',
    color: '#1677ff',
    fontSize: '0.875rem',
    cursor: 'pointer',
    textAlign: 'center',
    padding: '0.25rem',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    fontSize: '0.875rem',
    cursor: 'pointer',
    padding: '0',
    textAlign: 'left',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1.5px solid #d1d5db',
    borderRadius: '0.625rem',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  hint: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    textAlign: 'center',
  },
  error: {
    color: '#ef4444',
    fontSize: '0.875rem',
  },
}
