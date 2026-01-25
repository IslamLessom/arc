import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'

interface QuestionOption {
  value: string
  label: string
}

interface OnboardingQuestion {
  id: string
  key: string
  type: 'text' | 'email' | 'phone' | 'number' | 'boolean' | 'select'
  label: string
  placeholder?: string
  required: boolean
  default_value?: string
  condition?: string
  validation?: string
  options?: QuestionOption[]
}

interface QuestionsResponse {
  data: Record<string, OnboardingQuestion[]>
  steps: number
}

interface OnboardingAnswers {
  [key: string]: string | number | boolean
}

interface OnboardingRequest {
  answers: OnboardingAnswers
}

interface OnboardingResponse {
  message: string
  establishment_id: string
}

export function useOnboardingQuestions() {
  return useQuery({
    queryKey: ['onboarding', 'questions'],
    queryFn: async (): Promise<QuestionsResponse> => {
      const response = await apiClient.get<QuestionsResponse>(
        '/auth/onboarding/questions'
      )
      return response.data
    },
  })
}

export function useOnboarding() {
  return useMutation({
    mutationFn: async (data: OnboardingRequest): Promise<OnboardingResponse> => {
      const response = await apiClient.post<OnboardingResponse>(
        '/auth/onboarding/submit',
        data
      )
      return response.data
    },
  })
}

