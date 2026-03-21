/**
 * Print table data with proper formatting
 */
export const printTable = (
  data: any[], 
  columns: any[], 
  title?: string,
  options?: {
    showDate?: boolean
    orientation?: 'portrait' | 'landscape'
  }
) => {
  if (!data || data.length === 0) {
    console.warn('No data to print')
    return
  }

  const { showDate = true, orientation = 'portrait' } = options || {}

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return '-'

    if (typeof value === 'boolean') return value ? 'Да' : 'Нет'

    if (Array.isArray(value)) {
      if (value.length === 0) return '-'
      const mapped = value.map((item) => {
        if (item && typeof item === 'object') {
          return item.name || item.title || item.full_name || item.email || item.id || ''
        }
        return String(item)
      }).filter(Boolean)
      return mapped.length ? mapped.join(', ') : '-'
    }

    if (typeof value === 'object') {
      if (value.name) return String(value.name)
      if (value.title) return String(value.title)
      if (value.full_name) return String(value.full_name)
      if (value.email && value.name) return `${value.name} (${value.email})`
      if (value.email) return String(value.email)
      if (value.phone) return String(value.phone)
      return value.id ? String(value.id) : '-'
    }

    return String(value)
  }

  // Get visible columns
  const visibleColumns = columns.filter(col => col.dataIndex && col.title)
  
  // Build table HTML
  const headers = visibleColumns
    .map(col => `<th>${col.title}</th>`)
    .join('')

  const dataIndexes = visibleColumns.map(col => col.dataIndex)

  const rows = data.map((row, index) => {
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

  const currentDate = new Date().toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${title || 'Печать таблицы'}</title>
        <style>
          @page {
            size: ${orientation};
            margin: 15mm;
          }
          
          @media print {
            body { 
              margin: 0; 
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
              sans-serif;
            color: #333;
            line-height: 1.5;
          }
          
          .header {
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          
          .header h1 {
            margin: 0 0 5px 0;
            font-size: 24px;
            font-weight: 600;
          }
          
          .header .date {
            font-size: 12px;
            color: #666;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 12px;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          
          th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #333;
          }
          
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            font-size: 11px;
            color: #666;
            text-align: center;
          }
          
          .total-count {
            margin-top: 10px;
            font-weight: 600;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        ${title ? `
          <div class="header">
            <h1>${title}</h1>
            ${showDate ? `<div class="date">Дата печати: ${currentDate}</div>` : ''}
          </div>
        ` : ''}
        
        <table>
          <thead>
            <tr>${headers}</tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        
        <div class="total-count">
          Всего записей: ${data.length}
        </div>
        
        <div class="footer">
          Создано в системе управления рестораном
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            // Close window after printing (optional)
            // window.onafterprint = function() { window.close(); }
          }
        </script>
      </body>
    </html>
  `

  // Open print window
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(printContent)
    printWindow.document.close()
  } else {
    console.error('Failed to open print window. Please check popup blocker settings.')
  }
}
