import { SERVICES } from '@restaurant-pos/types'
import { Button, ButtonVariant } from '@restaurant-pos/ui'
import { CONFIG } from '@/shared/config'
import styles from './ServiceSwitcher.module.css'

interface Service {
  id: string
  name: string
  description: string
  url: string
}

export function ServiceSwitcher() {
  const currentServiceId = CONFIG.CURRENT_SERVICE_ID

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Доступные сервисы</h2>
      <div className={styles.grid}>
        {SERVICES.map((service: Service) => (
          <div key={service.id} className={styles.card}>
            <h3 className={styles.cardTitle}>{service.name}</h3>
            <p className={styles.cardDescription}>{service.description}</p>
            <Button
              onClick={() => {
                window.location.href = service.url
              }}
              disabled={service.id === currentServiceId}
              variant={service.id === currentServiceId ? ButtonVariant.Outline : ButtonVariant.Default}
              className={styles.button}
            >
              {service.id === currentServiceId ? 'Текущий сервис' : 'Перейти'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
