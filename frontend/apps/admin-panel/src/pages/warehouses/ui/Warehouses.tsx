import { useWarehouses } from '../hooks/useWarehouses'
import { Table, ColumnManager } from '@restaurant-pos/ui'
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
        handleColumns,
        isColumnModalOpen,
        handleCloseColumnModal,
        visibleColumns,
        columnInfo,
        toggleColumn,
        showAllColumns,
        hideAllColumns,
        resetColumnVisibility,
    } = useWarehouses()

    const columns = getWarehousesTableColumns({ onEdit: handleEdit, onDelete: handleDelete })
    
    // Filter columns based on visibility
    const filteredColumns = columns.filter(col => {
        if (!col.dataIndex) return true // Always show columns without dataIndex (like actions)
        const key = Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex
        const visibleCol = visibleColumns.find(vc => {
            const vcKey = Array.isArray(vc.dataIndex) ? vc.dataIndex.join('.') : vc.dataIndex
            return vcKey === key
        })
        return visibleCol !== undefined
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
                    columns={filteredColumns}
                    dataSource={warehouses}
                    onRow={(record) => ({
                        onClick: () => handleEdit(record.id)
                    })}
                />
                <Styled.TableSummaryContainer>
                    <Styled.TableSummaryLabel>Итого</Styled.TableSummaryLabel>
                    <Styled.TableSummaryLabel>{totalAmount.toFixed(2)} ₽</Styled.TableSummaryLabel>
                </Styled.TableSummaryContainer>
            </Styled.TableContainer>

            <AddWarehouseModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleSuccess}
                warehouseId={editingWarehouseId || undefined}
            />

            {isColumnModalOpen && (
                <ColumnManager
                    columns={columnInfo}
                    onToggle={toggleColumn}
                    onShowAll={showAllColumns}
                    onHideAll={hideAllColumns}
                    onReset={resetColumnVisibility}
                    onClose={handleCloseColumnModal}
                />
            )}
        </Styled.PageContainer>
    )
}

