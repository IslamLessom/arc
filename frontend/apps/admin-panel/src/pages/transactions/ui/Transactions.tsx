import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { AddTransactionModal } from './add-transaction-modal'
import type { Transaction } from '@restaurant-pos/types'
import { translateCategory } from '../../../shared/lib/categoryTranslations'
import * as Styled from './styled'

export const Transactions = () => {
    const { isLoading, transactions, handleBack, refreshTransactions } = useTransactions()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleSuccess = () => {
        setIsModalOpen(false)
        refreshTransactions()
    }

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '-'

        // Remove microseconds (7+ digits after decimal point) to milliseconds (3 digits)
        // JavaScript Date can parse ISO 8601 but only with milliseconds precision
        let normalizedDate = dateString
        const microsecondMatch = dateString.match(/\.(\d{6,})Z$/)
        if (microsecondMatch) {
            // Convert microseconds to milliseconds (take first 3 digits)
            const milliseconds = microsecondMatch[1].slice(0, 3)
            normalizedDate = dateString.replace(/\.(\d{6,})Z$/, `.${milliseconds}Z`)
        }

        const date = new Date(normalizedDate)
        if (isNaN(date.getTime())) return '-'

        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatAmount = (amount: number, type: 'income' | 'expense' | 'transfer') => {
        const prefix = type === 'income' ? '+' : type === 'expense' ? '-' : ''
        return `${prefix}${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽`
    }

    const getTypeLabel = (type: 'income' | 'expense' | 'transfer') => {
        switch (type) {
            case 'income':
                return 'Доход'
            case 'expense':
                return 'Расход'
            case 'transfer':
                return 'Перевод'
        }
    }

    if (isLoading) {
        return (
            <Styled.PageContainer>
                <Styled.LoadingContainer>Загрузка транзакций...</Styled.LoadingContainer>
            </Styled.PageContainer>
        )
    }

    return (
        <Styled.PageContainer>
            <Styled.Header>
                <Styled.HeaderLeft>
                    <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
                    <Styled.Title>Транзакции</Styled.Title>
                </Styled.HeaderLeft>
                <Styled.HeaderActions>
                    <Styled.ActionButton>
                        <span>🗑️</span>
                        Корзина
                    </Styled.ActionButton>
                    <Styled.ActionButton>
                        <span>📋</span>
                        Столбцы
                    </Styled.ActionButton>
                    <Styled.ActionButton>
                        <span>📤</span>
                        Экспорт
                    </Styled.ActionButton>
                    <Styled.ActionButton>
                        <span>🖨️</span>
                        Печать
                    </Styled.ActionButton>
                    <Styled.AddButton onClick={() => setIsModalOpen(true)}>Добавить</Styled.AddButton>
                </Styled.HeaderActions>
            </Styled.Header>

            <Styled.SearchContainer>
                <Styled.SearchInputWrapper>
                    <Styled.SearchIcon>🔍</Styled.SearchIcon>
                    <Styled.SearchInput placeholder="Быстрый поиск" />
                </Styled.SearchInputWrapper>
                <Styled.FilterButton>+ Фильтр</Styled.FilterButton>
            </Styled.SearchContainer>

            <Styled.TableContainer>
                {transactions.length === 0 ? (
                    <Styled.EmptyState>
                        <Styled.EmptyIcon>💳</Styled.EmptyIcon>
                        <Styled.EmptyText>Транзакции пока не добавлены</Styled.EmptyText>
                        <Styled.EmptySubtext>Нажмите "Добавить" для создания первой транзакции</Styled.EmptySubtext>
                    </Styled.EmptyState>
                ) : (
                    <Styled.Table>
                        <Styled.TableHeader>
                            <tr>
                                <Styled.TableHeadCell>Дата</Styled.TableHeadCell>
                                <Styled.TableHeadCell>Тип</Styled.TableHeadCell>
                                <Styled.TableHeadCell>Счет</Styled.TableHeadCell>
                                <Styled.TableHeadCell>Категория</Styled.TableHeadCell>
                                <Styled.TableHeadCell>Сумма</Styled.TableHeadCell>
                                <Styled.TableHeadCell>Описание</Styled.TableHeadCell>
                            </tr>
                        </Styled.TableHeader>
                        <tbody>
                            {transactions.map((transaction) => {
                                // Debug: log the transaction date
                                console.log('Transaction date:', transaction.transactionDate, 'Type:', typeof transaction.transactionDate)

                                return (
                                <Styled.TableRow key={transaction.id}>
                                    <Styled.TableCell>
                                        {formatDate(transaction.transactionDate)}
                                    </Styled.TableCell>
                                    <Styled.TableCell>
                                        <Styled.TypeBadge $type={transaction.type}>
                                            {getTypeLabel(transaction.type)}
                                        </Styled.TypeBadge>
                                    </Styled.TableCell>
                                    <Styled.TableCell>
                                        {transaction.account?.name || transaction.accountId}
                                    </Styled.TableCell>
                                    <Styled.TableCell>
                                        {translateCategory(transaction.category)}
                                    </Styled.TableCell>
                                    <Styled.AmountCell $type={transaction.type}>
                                        {formatAmount(transaction.amount, transaction.type)}
                                    </Styled.AmountCell>
                                    <Styled.TableCell>
                                        {transaction.description || '-'}
                                    </Styled.TableCell>
                                </Styled.TableRow>
                                )
                            })}
                        </tbody>
                    </Styled.Table>
                )}
            </Styled.TableContainer>

            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
            />
        </Styled.PageContainer>
    )
}
