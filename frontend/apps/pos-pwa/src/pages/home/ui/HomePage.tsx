import { ServiceSwitcher } from '@/features/service-switcher'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>POS Terminal</h1>
      <p className={styles.subtitle}>Терминал для официантов</p>

      <ServiceSwitcher />
    </main>
  )
}
