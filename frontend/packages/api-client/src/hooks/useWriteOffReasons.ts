import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

export interface WriteOffReason {
	id: string
	establishment_id: string
	name: string
	pnl_block: string // 'cost' или 'expenses'
	active: boolean
	created_at: string
	updated_at: string
}

export interface CreateWriteOffReasonRequest {
	name: string
	pnl_block: string
}

export interface UpdateWriteOffReasonRequest {
	name?: string
	pnl_block?: string
	active?: boolean
}

interface WriteOffReasonsResponse {
	data: WriteOffReason[]
}

interface WriteOffReasonResponse {
	data: WriteOffReason
}

export function useGetWriteOffReasons() {
	return useQuery({
		queryKey: ['write-off-reasons'],
		queryFn: async (): Promise<WriteOffReason[]> => {
			const response = await apiClient.get<WriteOffReasonsResponse>(
				'/warehouse/write-off-reasons'
			)
			return response.data.data
		},
	})
}

export function useGetWriteOffReason(id: string | undefined) {
	return useQuery({
		queryKey: ['write-off-reason', id],
		queryFn: async (): Promise<WriteOffReason> => {
			const response = await apiClient.get<WriteOffReasonResponse>(
				`/warehouse/write-off-reasons/${id}`
			)
			return response.data.data
		},
		enabled: !!id,
	})
}

export function useCreateWriteOffReason() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (data: CreateWriteOffReasonRequest): Promise<WriteOffReason> => {
			const response = await apiClient.post<WriteOffReasonResponse>(
				'/warehouse/write-off-reasons',
				data
			)
			return response.data.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['write-off-reasons'] })
		},
	})
}

export function useUpdateWriteOffReason() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string
			data: UpdateWriteOffReasonRequest
		}): Promise<WriteOffReason> => {
			const response = await apiClient.put<WriteOffReasonResponse>(
				`/warehouse/write-off-reasons/${id}`,
				data
			)
			return response.data.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['write-off-reasons'] })
		},
	})
}

export function useDeleteWriteOffReason() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			await apiClient.delete(`/warehouse/write-off-reasons/${id}`)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['write-off-reasons'] })
		},
	})
}
