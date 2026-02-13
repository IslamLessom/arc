import { EmployeeTable } from '../model/types'
import { EmployeesTableProps } from '../model/types'
import { EditButton } from '@restaurant-pos/ui'
import { getRoleName } from '../../../features/add-employee-modal/lib/roleMap'

const formatNumber = (num: number) => {
  return num.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const formatCurrency = (num: number) => {
  return num.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export const getEmployeesTableColumns = ({ onEdit }: EmployeesTableProps) => [
  {
    title: '№',
    dataIndex: 'number',
    key: 'number',
    width: 60,
    render: (_: unknown, _record: EmployeeTable, index: number) => <span>{index + 1}</span>
  },
  {
    title: 'Имя',
    dataIndex: 'name',
    key: 'name',
    render: (name: string) => <span>{name || '-'}</span>
  },
  {
    title: 'Телефон',
    dataIndex: 'phone',
    key: 'phone',
    render: (phone: string | null) => <span>{phone || '-'}</span>
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    render: (email: string) => <span>{email || '-'}</span>
  },
  {
    title: 'Пин-код',
    dataIndex: 'pin',
    key: 'pin',
    render: (pin: string | null) => <span>{pin || '-'}</span>
  },
  {
    title: 'Должность',
    dataIndex: 'role',
    key: 'role',
    render: (role: EmployeeTable['role']) => <span>{role?.name ? getRoleName(role.name) : '-'}</span>
  },
  {
    title: 'Часы',
    dataIndex: 'statistics',
    key: 'hours',
    width: 80,
    render: (statistics: EmployeeTable['statistics']) => (
      <span>{statistics ? formatNumber(statistics.total_hours_worked) : '-'}</span>
    )
  },
  {
    title: 'Смены',
    dataIndex: 'statistics',
    key: 'shifts',
    width: 80,
    render: (statistics: EmployeeTable['statistics']) => (
      <span>{statistics ? statistics.total_shifts : '-'}</span>
    )
  },
  {
    title: 'Продажи',
    dataIndex: 'statistics',
    key: 'sales',
    width: 120,
    render: (statistics: EmployeeTable['statistics']) => (
      <span>{statistics ? formatCurrency(statistics.total_sales) : '-'}</span>
    )
  },
  {
    title: 'Ред.',
    dataIndex: 'edit',
    key: 'edit',
    align: 'center' as const,
    width: 80,
    render: (_: unknown, record: EmployeeTable) => (
      <EditButton onClick={() => onEdit(record.id)} />
    )
  }
]
