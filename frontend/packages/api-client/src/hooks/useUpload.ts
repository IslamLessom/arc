import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../client'

interface UploadImageResponse {
  url: string
  filename: string
  size: number
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post<UploadImageResponse>(
        '/upload/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      return response.data.url
    },
  })
}
