import { useEmployees } from '../hooks/useEmployees'
import { Table, ColumnManager } from '@restaurant-pos/ui'
import { getEmployeesTableColumns } from '../lib/constants'
import { AddEmployeeModal } from '../../../features/add-employee-modal'
import * as Styled from './styled'

export const Employees = () => {
  const {
    employees,
    isLoading,
    error,
    searchQuery,
    totalEmployeesCount,
    isModalOpen,
    editingEmployeeId,
    handleSearchChange,
    handleBack,
    handleEdit,
    handleAdd,
    handleCloseModal,
    handleSuccess,
    handleExport,
    handlePrint,
    handleColumns,
    // Column management
    isColumnModalOpen,
    handleCloseColumnModal,
    visibleColumns,
    columnInfo,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    resetColumnVisibility,
  } = useEmployees()

  const columns = getEmployeesTableColumns({ onEdit: handleEdit })
  
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
        <Styled.LoadingContainer>Загрузка сотрудников...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>
          Ошибка при загрузке сотрудников: {(error as Error).message}
        </Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack}>←</Styled.BackButton>
          <Styled.Title>Сотрудники {totalEmployeesCount}</Styled.Title>
        </Styled.HeaderLeft>
        <Styled.HeaderActions>
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
          columns={filteredColumns as any}
          dataSource={employees}
          onRow={(record: any) => ({
            onClick: () => handleEdit(record.id)
          })}
        />
      </Styled.TableContainer>

      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        employeeId={editingEmployeeId || undefined}
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
