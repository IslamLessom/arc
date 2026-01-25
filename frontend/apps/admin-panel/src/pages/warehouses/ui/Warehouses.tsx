import { useWarehouses } from '../hooks/useWarehouses'
import { Table } from '@restaurant-pos/ui'
import { AddWarehouseModal } from '../../../features/add-warehouse-modal'
import { getWarehousesTableColumns } from '../lib/constants'
import * as Styled from './styled'

export const Warehouses = () => {
    const {
        warehouses,
        isLoading,
        error,
        searchQuery,
        sort,
        totalWarehousesCount,
        totalAmount,
        isModalOpen,
        editingWarehouseId,
        handleSearchChange,
        handleSort,
        handleBack,
        handleEdit,
        handleDelete,
        handleAdd,
        handleCloseModal,
        handleSuccess,
        handleExport,
        handlePrint,
        handleColumns
    } = useWarehouses()

    const columns = getWarehousesTableColumns({
        onEdit: handleEdit,
        onDelete: handleDelete
    })

    if (isLoading) {
        return (
            <Styled.PageContainer>
                <Styled.LoadingContainer>Загрузка складов...</Styled.LoadingContainer>
            </Styled.PageContainer>
        )
    }

    if (error) {
        return (
            <Styled.PageContainer>
                <Styled.ErrorContainer>
                    Ошибка при загрузке складов: {error.message}
                </Styled.ErrorContainer>
            </Styled.PageContainer>
        )
    }

    return (
        <Styled.PageContainer>
            <Styled.Header>
                <Styled.HeaderLeft>
                    <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
                    <Styled.Title>Склады {totalWarehousesCount}</Styled.Title>
                </Styled.HeaderLeft>
                <Styled.HeaderActions>
                    <Styled.ActionButton onClick={handleColumns}>
                        <span>🗑️</span>
                        Корзина
                    </Styled.ActionButton>
                    <Styled.ActionButton onClick={handleColumns}>
                        <span>📋</span>
                        Столбцы
                    </Styled.ActionButton>
                    <Styled.ActionButton onClick={handleExport}>
                        <span>📤</span>
                        Экспорт
                    </Styled.ActionButton>
                    <Styled.ActionButton onClick={handlePrint}>
                        <span>🖨️</span>
                        Печать
                    </Styled.ActionButton>
                    <Styled.AddButton onClick={handleAdd}>Добавить</Styled.AddButton>
                </Styled.HeaderActions>
            </Styled.Header>

            <Styled.SearchContainer>
                <Styled.SearchInputWrapper>
                    <Styled.SearchIcon>🔍</Styled.SearchIcon>
                    <Styled.SearchInput
                        placeholder="Быстрый поиск"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </Styled.SearchInputWrapper>
                <Styled.FilterButton>+ Фильтр</Styled.FilterButton>
            </Styled.SearchContainer>

            <Styled.TableContainer>
                <Table
                    columns={columns}
                    dataSource={warehouses}
                    onRowClick={(record) => handleEdit(record.id)}
                    summary={
                        <Styled.TableSummaryContainer>
                            <Styled.TableSummaryLabel>Итого</Styled.TableSummaryLabel>
                            <Styled.TableSummaryLabel>{totalAmount.toFixed(2)} ₽</Styled.TableSummaryLabel>
                        </Styled.TableSummaryContainer>
                    }
                    emptyMessage="Нет складов"
                />
            </Styled.TableContainer>

            <AddWarehouseModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleSuccess}
                warehouseId={editingWarehouseId || undefined}
            />
        </Styled.PageContainer>
    )
}

