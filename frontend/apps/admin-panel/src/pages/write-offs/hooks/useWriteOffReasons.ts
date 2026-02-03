import { useState, useMemo } from 'react'
import {
	useGetWriteOffReasons,
	useGetWriteOffs,
	useGetStock,
	useCreateWriteOffReason,
	useUpdateWriteOffReason,
	useDeleteWriteOffReason,
	type WriteOffReason as ApiWriteOffReason,
	type CreateWriteOffReasonRequest,
	type UpdateWriteOffReasonRequest,
} from '@restaurant-pos/api-client'
import type { UseWriteOffReasonsResult, WriteOffReason, WriteOffReasonFormData } from '../model/types'
import { WriteOffReasonPnlBlock } from '../model/types'

// Преобразуем API reason в UI reason с агрегированными данными
const mapApiReasonToUiReason = (
	apiReason: ApiWriteOffReason,
	writeOffs: any[],
	stock: any[]
): WriteOffReason => {
	// Находим все списания с этой причиной
	const relatedWriteOffs = writeOffs.filter((wo) => wo.reason === apiReason.name)

	// Вычисляем общую стоимость
	const totalCost = relatedWriteOffs.reduce((sum, writeOff) => {
		const writeOffCost = writeOff.items?.reduce((itemSum: number, item: any) => {
			const stockItem = stock.find(
				(s: any) =>
					(s.ingredientId === item.ingredientId || s.productId === item.productId) &&
					s.warehouseId === writeOff.warehouseId
			)
			const pricePerUnit = stockItem?.pricePerUnit || 0
			return itemSum + pricePerUnit * item.quantity
		}, 0) || 0
		return sum + writeOffCost
	}, 0)

	return {
		id: apiReason.id,
		name: apiReason.name,
		pnlBlock: apiReason.pnl_block as WriteOffReasonPnlBlock,
		writeOffCount: relatedWriteOffs.length,
		totalCost,
	}
}

export const useWriteOffReasons = (): UseWriteOffReasonsResult => {
	const [searchQuery, setSearchQuery] = useState('')

	// Получаем причины с API
	const {
		data: apiReasons = [],
		isLoading: isLoadingReasons,
		error: reasonsError,
	} = useGetWriteOffReasons()

	// Получаем списания и сток для вычисления статистики
	const { data: writeOffs = [] } = useGetWriteOffs()
	const { data: stock = [] } = useGetStock()

	// Мутации для CRUD операций
	const createMutation = useCreateWriteOffReason()
	const updateMutation = useUpdateWriteOffReason()
	const deleteMutation = useDeleteWriteOffReason()

	// Преобразуем API данные в UI данные с агрегированной статистикой
	const reasons = useMemo(() => {
		const mappedReasons = apiReasons
			.filter((r) => r.active)
			.map((apiReason) => mapApiReasonToUiReason(apiReason, writeOffs, stock))

		// Сортируем по названию
		return mappedReasons.sort((a, b) => a.name.localeCompare(b.name))
	}, [apiReasons, writeOffs, stock])

	// Фильтруем причины по поисковому запросу
	const filteredReasons = useMemo(() => {
		if (!searchQuery.trim()) return reasons

		const query = searchQuery.toLowerCase()
		return reasons.filter((reason) => reason.name.toLowerCase().includes(query))
	}, [reasons, searchQuery])

	const handleSearchChange = (query: string) => {
		setSearchQuery(query)
	}

	const handleAdd = (data: WriteOffReasonFormData) => {
		const requestData: CreateWriteOffReasonRequest = {
			name: data.name,
			pnl_block: data.pnlBlock,
		}
		createMutation.mutate(requestData)
	}

	const handleEdit = (id: string, data: WriteOffReasonFormData) => {
		const requestData: UpdateWriteOffReasonRequest = {
			name: data.name,
			pnl_block: data.pnlBlock,
		}
		updateMutation.mutate({ id, data: requestData })
	}

	const handleDelete = (id: string) => {
		deleteMutation.mutate(id)
	}

	const handleExport = () => {
		console.log('Export write-off reasons')
	}

	const handlePrint = () => {
		console.log('Print write-off reasons')
	}

	const handleColumns = () => {
		console.log('Manage columns')
	}

	return {
		reasons: filteredReasons,
		isLoading: isLoadingReasons,
		error: reasonsError as Error | null,
		searchQuery,
		handleSearchChange,
		handleAdd,
		handleEdit,
		handleDelete,
		handleExport,
		handlePrint,
		handleColumns,
	}
}
