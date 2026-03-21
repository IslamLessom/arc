import { message } from 'antd'
import { useSubscriptionReadOnly } from '@restaurant-pos/api-client'

/**
 * Хук для обработки действий при режиме read-only подписки
 * Показывает сообщение об ошибке при попытке выполнить действие, требующее активной подписки
 */
export const useSubscriptionProtectedAction = () => {
  const { isReadOnly } = useSubscriptionReadOnly()

  const checkSubscriptionAndExecute = async <T,>(
    action: () => Promise<T>,
    actionName = 'Это действие'
  ): Promise<T | null> => {
    if (isReadOnly) {
      message.error({
        content: `${actionName} недоступно в режиме только для чтения. Продлите подписку для доступа.`,
        duration: 5,
      })
      return null
    }

    return await action()
  }

  return { isReadOnly, checkSubscriptionAndExecute }
}
