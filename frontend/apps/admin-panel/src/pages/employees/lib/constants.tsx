import { EmployeeTable } from '../model/types'
import { EmployeesTableProps } from '../model/types'
import { EditButton } from '@restaurant-pos/ui'
import { getRoleName } from '../../../features/add-employee-modal/lib/roleMap'

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
