import { useState, useCallback } from 'react'
import { useOnboarding } from '@restaurant-pos/api-client'
import type {
  UseOnboardingFormResult,
  OnboardingFormProps,
  OnboardingFormData,
} from '../model/types'

export function useOnboardingForm(
  props: OnboardingFormProps
): UseOnboardingFormResult {
  const { onSubmit, onCancel } = props
  const onboardingMutation = useOnboarding()

  const [establishment_name, setEstablishmentName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [type, setType] = useState('restaurant')
  const [has_seating_places, setHasSeatingPlaces] = useState(true)
  const [table_count, setTableCount] = useState(10)
  const [has_takeaway, setHasTakeaway] = useState(true)
  const [has_delivery, setHasDelivery] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleEstablishmentNameChange = useCallback((value: string) => {
    setEstablishmentName(value)
    setError(null)
  }, [])

  const handleAddressChange = useCallback((value: string) => {
    setAddress(value)
    setError(null)
  }, [])

  const handlePhoneChange = useCallback((value: string) => {
    setPhone(value)
    setError(null)
  }, [])

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value)
    setError(null)
  }, [])

  const handleTypeChange = useCallback((value: string) => {
    setType(value)
    setError(null)
  }, [])

  const handleHasSeatingPlacesChange = useCallback((value: boolean) => {
    setHasSeatingPlaces(value)
    setError(null)
  }, [])

  const handleTableCountChange = useCallback((value: number) => {
    setTableCount(value)
    setError(null)
  }, [])

  const handleHasTakeawayChange = useCallback((value: boolean) => {
    setHasTakeaway(value)
    setError(null)
  }, [])

  const handleHasDeliveryChange = useCallback((value: boolean) => {
    setHasDelivery(value)
    setError(null)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      if (
        !establishment_name.trim() ||
        !address.trim() ||
        !phone.trim() ||
        !email.trim() ||
        !type.trim()
      ) {
        setError('Заполните все обязательные поля')
        return
      }

      if (has_seating_places && table_count <= 0) {
        setError('Количество столов должно быть больше 0')
        return
      }

      try {
        const formData: OnboardingFormData = {
          establishment_name: establishment_name.trim(),
          address: address.trim(),
          phone: phone.trim(),
          email: email.trim(),
          type,
          has_seating_places,
          table_count: has_seating_places ? table_count : 0,
          has_takeaway,
          has_delivery,
        }

        await onboardingMutation.mutateAsync({
          answers: formData,
        })

        if (onSubmit) {
          await onSubmit(formData)
        }
      } catch (err: unknown) {
        let errorMessage = 'Ошибка при отправке данных онбординга'

        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as {
            response?: { data?: { error?: string; message?: string } }
          }
          if (axiosError.response?.data?.error) {
            errorMessage = axiosError.response.data.error
          } else if (axiosError.response?.data?.message) {
            errorMessage = axiosError.response.data.message
          } else if (
            axiosError.response?.data &&
            typeof axiosError.response.data === 'string'
          ) {
            errorMessage = axiosError.response.data
          }
        } else if (err instanceof Error) {
          errorMessage = err.message
        }

        setError(errorMessage)
      }
    },
    [
      establishment_name,
      address,
      phone,
      email,
      type,
      has_seating_places,
      table_count,
      has_takeaway,
      has_delivery,
      onboardingMutation,
      onSubmit,
    ]
  )

  return {
    establishment_name,
    address,
    phone,
    email,
    type,
    has_seating_places,
    table_count,
    has_takeaway,
    has_delivery,
    isLoading: onboardingMutation.isPending,
    error,
    handleEstablishmentNameChange,
    handleAddressChange,
    handlePhoneChange,
    handleEmailChange,
    handleTypeChange,
    handleHasSeatingPlacesChange,
    handleTableCountChange,
    handleHasTakeawayChange,
    handleHasDeliveryChange,
    handleSubmit,
  }
}

