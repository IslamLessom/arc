/**
 * Export table data to CSV format
 */
export const exportToCSV = (data: any[], columns: any[], filename: string = 'export.csv') => {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Get column headers
  const headers = columns
    .filter(col => col.dataIndex && col.title)
    .map(col => col.title)

  // Get data indexes
  const dataIndexes = columns
    .filter(col => col.dataIndex)
    .map(col => col.dataIndex)

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return ''

    if (typeof value === 'boolean') return value ? 'Да' : 'Нет'

    if (Array.isArray(value)) {
      if (value.length === 0) return ''
      return value
        .map((item) => {
          if (item && typeof item === 'object') {
            return item.name || item.title || item.full_name || item.email || item.id || ''
          }
          return String(item)
        })
        .filter(Boolean)
        .join(', ')
    }

    if (typeof value === 'object') {
      if (value.name) return String(value.name)
      if (value.title) return String(value.title)
      if (value.full_name) return String(value.full_name)
      if (value.email && value.name) return `${value.name} (${value.email})`
      if (value.email) return String(value.email)
      if (value.phone) return String(value.phone)
      return value.id ? String(value.id) : ''
    }

    return String(value)
  }

  const escapeCsv = (value: string) => {
    const normalized = value.replace(/\r?\n/g, ' ')
    return /[",;]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized
  }

  // Build CSV content
  const csvContent = [
    // Headers
    headers.join(','),
    // Data rows
    ...data.map(row => {
      return dataIndexes.map(key => {
        // Handle nested keys (e.g., ['user', 'name'])
        let value = row
        const keys = Array.isArray(key) ? key : [key]
        for (const k of keys) {
          value = value?.[k]
        }
        
        return escapeCsv(formatCellValue(value))
      }).join(',')
    })
  ].join('\n')

  // Create blob and download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export table data to Excel format using HTML table method
 */
export const exportToExcel = (data: any[], columns: any[], filename: string = 'export.xlsx') => {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Create table HTML
  const headers = columns
    .filter(col => col.dataIndex && col.title)
    .map(col => `<th>${col.title}</th>`)
    .join('')

  const dataIndexes = columns
    .filter(col => col.dataIndex)
    .map(col => col.dataIndex)

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return ''

    if (typeof value === 'boolean') return value ? 'Да' : 'Нет'

    if (Array.isArray(value)) {
      if (value.length === 0) return ''
      return value
        .map((item) => {
          if (item && typeof item === 'object') {
            return item.name || item.title || item.full_name || item.email || item.id || ''
          }
          return String(item)
        })
        .filter(Boolean)
        .join(', ')
    }

    if (typeof value === 'object') {
      if (value.name) return String(value.name)
      if (value.title) return String(value.title)
      if (value.full_name) return String(value.full_name)
      if (value.email && value.name) return `${value.name} (${value.email})`
      if (value.email) return String(value.email)
      if (value.phone) return String(value.phone)
      return value.id ? String(value.id) : ''
    }

    return String(value)
  }

  const rows = data.map(row => {
    const cells = dataIndexes.map(key => {
      let value = row
      const keys = Array.isArray(key) ? key : [key]
      for (const k of keys) {
        value = value?.[k]
      }
      
      return `<td>${formatCellValue(value)}</td>`
    }).join('')
    return `<tr>${cells}</tr>`
  }).join('')

  const tableHTML = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f2f2f2; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <thead><tr>${headers}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `

  // Create blob and download
  const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
