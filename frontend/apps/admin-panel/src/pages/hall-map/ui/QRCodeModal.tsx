import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useGenerateTableQRToken } from '@restaurant-pos/api-client'

type QRModalTable = {
  id: string
  number: number
  name?: string
  qr_token?: string
}

interface QRCodeModalProps {
  table: QRModalTable
  roomId: string
  onClose: () => void
}

export function QRCodeModal({ table, roomId, onClose }: QRCodeModalProps) {
  const generateQR = useGenerateTableQRToken()
  const [currentToken, setCurrentToken] = useState<string | null>(table.qr_token || null)
  const [loading, setLoading] = useState(false)

  // Determine the base URL for the QR menu PWA
  const qrMenuBase =
    ((import.meta as any).env?.VITE_QR_MENU_URL as string | undefined) ||
    'http://localhost:3003'

  const qrUrl = currentToken ? `${qrMenuBase}/${currentToken}` : null

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await generateQR.mutateAsync({ roomId, tableId: table.id })
      setCurrentToken(result.qr_token)
    } catch {
      alert('Не удалось сгенерировать QR-код')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!qrUrl) return
    const svg = document.getElementById('table-qr-svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-table-${table.number}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    if (!qrUrl) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const svg = document.getElementById('table-qr-svg')?.outerHTML || ''
    printWindow.document.write(`
      <html><head><title>QR Стол ${table.number}</title>
      <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;}
      h2{margin-bottom:0.5rem;} p{color:#6b7280;margin-bottom:1.5rem;}</style>
      </head><body>
        <h2>Стол №${table.number}${table.name ? ` — ${table.name}` : ''}</h2>
        <p>Отсканируйте, чтобы сделать заказ</p>
        ${svg}
      </body></html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700' }}>
              QR-код для стола №{table.number}{table.name ? ` — ${table.name}` : ''}
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
              Разместите на столике для заказа через телефон
            </p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.body}>
          {qrUrl ? (
            <>
              <div style={styles.qrWrapper}>
                <QRCodeSVG
                  id="table-qr-svg"
                  value={qrUrl}
                  size={220}
                  includeMargin
                  level="M"
                />
              </div>
              <p style={styles.urlText}>{qrUrl}</p>
              <div style={styles.actions}>
                <button style={styles.btnPrimary} onClick={handlePrint}>🖨️ Распечатать</button>
                <button style={styles.btnOutline} onClick={handleDownload}>⬇️ Скачать SVG</button>
              </div>
              <button
                style={{ ...styles.btnDanger, opacity: loading ? 0.7 : 1 }}
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? 'Генерируем...' : '🔄 Перегенерировать'}
              </button>
              <p style={styles.hint}>Перегенерация сделает старый QR-код недействительным</p>
            </>
          ) : (
            <>
              <div style={styles.emptyQr}>
                <span style={{ fontSize: '3rem' }}>📱</span>
                <p style={{ color: '#6b7280', marginTop: '0.75rem' }}>QR-код ещё не создан</p>
              </div>
              <button
                style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }}
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? 'Генерируем...' : '✨ Создать QR-код'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
  },
  modal: {
    background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid #e5e7eb',
  },
  closeBtn: {
    background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '2rem', height: '2rem',
    cursor: 'pointer', fontSize: '1rem', flexShrink: 0, marginLeft: '0.5rem',
  },
  body: {
    padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', alignItems: 'center',
  },
  qrWrapper: {
    background: 'white', padding: '0.5rem', borderRadius: '0.5rem',
    border: '1.5px solid #e5e7eb',
  },
  urlText: {
    fontSize: '0.7rem', color: '#9ca3af', wordBreak: 'break-all', textAlign: 'center',
    maxWidth: '300px',
  },
  actions: { display: 'flex', gap: '0.75rem', width: '100%' },
  btnPrimary: {
    flex: 1, padding: '0.625rem', background: '#7c3aed', color: 'white', border: 'none',
    borderRadius: '0.625rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600',
  },
  btnOutline: {
    flex: 1, padding: '0.625rem', background: 'transparent', color: '#7c3aed',
    border: '1.5px solid #7c3aed', borderRadius: '0.625rem', cursor: 'pointer',
    fontSize: '0.875rem', fontWeight: '600',
  },
  btnDanger: {
    width: '100%', padding: '0.5rem', background: 'transparent', color: '#ef4444',
    border: '1.5px solid #ef4444', borderRadius: '0.625rem', cursor: 'pointer',
    fontSize: '0.8rem',
  },
  hint: { fontSize: '0.7rem', color: '#9ca3af', textAlign: 'center' },
  emptyQr: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 0' },
}
