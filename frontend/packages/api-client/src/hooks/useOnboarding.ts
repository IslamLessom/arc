import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../client'

export interface OnboardingAnswers {
  establishment_name: string
  address: string
  phone: string
  email: string
  type: string
  has_seating_places: boolean
  table_count: number
  has_takeaway: boolean
  has_delivery: boolean
}

export interface OnboardingRequest {
  answers: OnboardingAnswers
}

export interface OnboardingResponse {
  message: string
  establishment_id: string
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

