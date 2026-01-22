import { useState, useCallback, useMemo, useEffect } from 'react'
import { useOnboarding, useOnboardingQuestions } from '@restaurant-pos/api-client'
import type {
  UseOnboardingFormResult,
  OnboardingFormProps,
  OnboardingFormData,
} from '../model/types'
import type { OnboardingQuestion, OnboardingAnswers } from '@restaurant-pos/api-client'

function parseCondition(condition: string): { key: string; value: string | boolean } | null {
  if (!condition) return null
  
  const parts = condition.split('=')
  if (parts.length !== 2) return null
  
  const key = parts[0].trim()
  const valueStr = parts[1].trim()
  
  // Парсим boolean значения
  if (valueStr === 'true') {
    return { key, value: true }
  }
  if (valueStr === 'false') {
    return { key, value: false }
  }
  
  // Иначе возвращаем как строку
  return { key, value: valueStr }
}

function getDefaultValue(question: OnboardingQuestion): string | number | boolean {
  if (question.default_value !== undefined && question.default_value !== '') {
    if (question.type === 'number') {
      return parseInt(question.default_value, 10) || 0
    }
    if (question.type === 'boolean') {
      return question.default_value === 'true'
    }
    return question.default_value
  }
  
  // Значения по умолчанию по типу
  switch (question.type) {
    case 'number':
      return 0
    case 'boolean':
      return false
    case 'select':
      return question.options?.[0]?.value || ''
    default:
      return ''
  }
}

export function useOnboardingForm(
  props: OnboardingFormProps
): UseOnboardingFormResult {
  const { onSubmit } = props
  const { data: questionsData, isLoading: isLoadingQuestions } = useOnboardingQuestions()
  const onboardingMutation = useOnboarding()
  
  // Получаем все вопросы в плоском массиве, отсортированные по шагам
  const questions = useMemo(() => {
    if (!questionsData?.data) return []
    
    const allQuestions: OnboardingQuestion[] = []
    const stepKeys = Object.keys(questionsData.data).sort((a, b) => 
      parseInt(a, 10) - parseInt(b, 10)
    )
    
    for (const stepKey of stepKeys) {
      const stepQuestions = questionsData.data[stepKey] || []
      // Сортируем вопросы внутри шага по order (если есть) или по порядку в массиве
      allQuestions.push(...stepQuestions)
    }
    
    return allQuestions
  }, [questionsData])
  
  // Инициализируем ответы на основе вопросов
  const [answers, setAnswers] = useState<OnboardingAnswers>(() => {
    const initial: OnboardingAnswers = {}
    questions.forEach((q) => {
      initial[q.key] = getDefaultValue(q)
    })
    return initial
  })
  
  // Обновляем ответы при загрузке вопросов
  useEffect(() => {
    if (questions.length > 0) {
      setAnswers((prev) => {
        const updated: OnboardingAnswers = { ...prev }
        questions.forEach((q) => {
          if (!(q.key in updated)) {
            updated[q.key] = getDefaultValue(q)
          }
        })
        return updated
      })
    }
  }, [questions])
  
  const [error, setError] = useState<string | null>(null)
  
  const handleFieldChange = useCallback((key: string, value: string | number | boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: value,
    }))
    setError(null)
  }, [])
  
  const shouldShowQuestion = useCallback(
    (question: OnboardingQuestion): boolean => {
      if (!question.condition) return true
      
      const condition = parseCondition(question.condition)
      if (!condition) return true
      
      const currentValue = answers[condition.key]
      return currentValue === condition.value
    },
    [answers]
  )
  
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)
      
      // Валидация обязательных полей
      const visibleQuestions = questions.filter(shouldShowQuestion)
      const requiredQuestions = visibleQuestions.filter((q) => q.required)
      
      for (const question of requiredQuestions) {
        const value = answers[question.key]
        if (
          value === undefined ||
          value === null ||
          value === '' ||
          (typeof value === 'number' && isNaN(value))
        ) {
          setError(`Поле "${question.label}" обязательно для заполнения`)
          return
        }
      }
      
      // Дополнительная валидация для number полей
      for (const question of visibleQuestions) {
        if (question.type === 'number') {
          const value = answers[question.key]
          if (typeof value === 'number' && value < 0) {
            setError(`Поле "${question.label}" должно быть положительным числом`)
            return
          }
        }
      }
      
      try {
        const formData: OnboardingFormData = { ...answers }
        
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
    [answers, questions, shouldShowQuestion, onboardingMutation, onSubmit]
  )
  
  return {
    questions,
    answers,
    isLoading: isLoadingQuestions,
    isSubmitting: onboardingMutation.isPending,
    error,
    handleFieldChange,
    handleSubmit,
    shouldShowQuestion,
  }
}
