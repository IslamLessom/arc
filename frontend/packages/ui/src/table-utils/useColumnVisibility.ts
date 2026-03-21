import { useState, useCallback, useMemo } from 'react'

export interface ColumnVisibility {
  [key: string]: boolean
}

export interface UseColumnVisibilityOptions {
  defaultHidden?: string[]
  storageKey?: string
}

/**
 * Hook for managing column visibility
 * Supports localStorage persistence
 */
export const useColumnVisibility = (
  columns: any[],
  options: UseColumnVisibilityOptions = {}
) => {
  const { defaultHidden = [], storageKey } = options

  // Initialize visibility state
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(() => {
    // Try to load from localStorage if storageKey is provided
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          return JSON.parse(saved)
        }
      } catch (error) {
        console.error('Failed to load column visibility from localStorage:', error)
      }
    }

    // Initialize with default hidden columns
    const initial: ColumnVisibility = {}
    columns.forEach(col => {
      const key = Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex
      if (key) {
        initial[key] = !defaultHidden.includes(key)
      }
    })
    return initial
  })

  // Save to localStorage when visibility changes
  const updateColumnVisibility = useCallback((newVisibility: ColumnVisibility) => {
    setColumnVisibility(newVisibility)
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newVisibility))
      } catch (error) {
        console.error('Failed to save column visibility to localStorage:', error)
      }
    }
  }, [storageKey])

  // Toggle single column
  const toggleColumn = useCallback((columnKey: string) => {
    updateColumnVisibility({
      ...columnVisibility,
      [columnKey]: !columnVisibility[columnKey]
    })
  }, [columnVisibility, updateColumnVisibility])

  // Show all columns
  const showAllColumns = useCallback(() => {
    const allVisible: ColumnVisibility = {}
    columns.forEach(col => {
      const key = Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex
      if (key) {
        allVisible[key] = true
      }
    })
    updateColumnVisibility(allVisible)
  }, [columns, updateColumnVisibility])

  // Hide all columns (except required ones)
  const hideAllColumns = useCallback(() => {
    const allHidden: ColumnVisibility = {}
    columns.forEach(col => {
      const key = Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex
      if (key) {
        // Keep columns marked as required visible
        allHidden[key] = col.required === true
      }
    })
    updateColumnVisibility(allHidden)
  }, [columns, updateColumnVisibility])

  // Reset to default
  const resetColumnVisibility = useCallback(() => {
    const initial: ColumnVisibility = {}
    columns.forEach(col => {
      const key = Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex
      if (key) {
        initial[key] = !defaultHidden.includes(key)
      }
    })
    updateColumnVisibility(initial)
  }, [columns, defaultHidden, updateColumnVisibility])

  // Filter visible columns
  const visibleColumns = useMemo(() => {
    return columns.filter(col => {
      // Always show columns without dataIndex (like action columns)
      if (!col.dataIndex) return true
      
      const key = Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex
      return columnVisibility[key] !== false
    })
  }, [columns, columnVisibility])

  // Get column info for UI
  const columnInfo = useMemo(() => {
    return columns
      .filter(col => col.dataIndex && col.title)
      .map(col => {
        const key = Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex
        return {
          key,
          title: col.title,
          visible: columnVisibility[key] !== false,
          required: col.required === true
        }
      })
  }, [columns, columnVisibility])

  return {
    columnVisibility,
    visibleColumns,
    columnInfo,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    resetColumnVisibility
  }
}
