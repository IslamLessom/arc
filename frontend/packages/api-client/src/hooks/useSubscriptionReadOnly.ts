import { useEffect, useMemo, useState } from 'react'
import { useSubscription } from './useSubscription'

/**
 * Хук для проверки режима read-only подписки
 * Возвращает true если подписка истекла и приложение работает в read-only режиме
 */
export const useSubscriptionReadOnly = () => {
  const [storageReadOnly, setStorageReadOnly] = useState(false)
  const { data: subscriptionData } = useSubscription()

  useEffect(() => {
    const readOnlyFlag = localStorage.getItem('subscription_read_only')
    setStorageReadOnly(readOnlyFlag === 'true')

    const handleStorageChange = () => {
      const flag = localStorage.getItem('subscription_read_only')
      setStorageReadOnly(flag === 'true')
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const isReadOnly = useMemo(() => {
    return storageReadOnly || Boolean(subscriptionData?.is_expired)
  }, [storageReadOnly, subscriptionData?.is_expired])

  useEffect(() => {
    if (subscriptionData?.is_expired) {
      localStorage.setItem('subscription_read_only', 'true')
      setStorageReadOnly(true)
      return
    }

    if (subscriptionData && !subscriptionData.is_expired) {
      localStorage.removeItem('subscription_read_only')
      setStorageReadOnly(false)
    }
  }, [subscriptionData])

  const resetReadOnly = () => {
    localStorage.removeItem('subscription_read_only')
    setStorageReadOnly(false)
  }

  return { isReadOnly, resetReadOnly }
}
