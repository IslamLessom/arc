import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { OnboardingModalProps, OnboardingFormData } from '../model/types'

export interface UseOnboardingModalResult {
  handleSubmit: (data: OnboardingFormData) => Promise<void>
  handleClose: () => void
}

export function useOnboardingModal(
  props: OnboardingModalProps
): UseOnboardingModalResult {
  const { onClose } = props
  const queryClient = useQueryClient()

  const handleSubmit = useCallback(
    async (data: OnboardingFormData) => {
      // После успешной отправки инвалидируем запрос currentUser,
      // чтобы получить обновленные данные с сервера
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] })

      // Закрываем модалку
      if (onClose) {
        onClose()
      }
    },
    [onClose, queryClient]
  )

  const handleClose = useCallback(() => {
    // Модалку нельзя закрыть, если онбординг не пройден
    // Но если пользователь все же хочет закрыть, ничего не делаем
    // (в реальном приложении можно показать предупреждение)
  }, [])

  return {
    handleSubmit,
    handleClose,
  }
}

