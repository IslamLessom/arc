import type { OnboardingQuestion, OnboardingAnswers } from '@restaurant-pos/api-client'

export interface OnboardingFormProps {
  onSubmit?: (data: OnboardingFormData) => void
  onCancel?: () => void
}

export interface OnboardingFormData extends OnboardingAnswers {}

export interface UseOnboardingFormResult {
  questions: OnboardingQuestion[]
  answers: OnboardingAnswers
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  handleFieldChange: (key: string, value: string | number | boolean) => void
  handleSubmit: (e: React.FormEvent) => void
  shouldShowQuestion: (question: OnboardingQuestion) => boolean
}

