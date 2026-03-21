import { useState } from 'react';
import {
  Table,
  Typography,
  Space,
  Button,
  Tag,
  Modal,
  InputNumber,
  message,
  Card,
  Input,
} from 'antd';
import {
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  PrinterOutlined,
  ExportOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { getApiErrorMessage } from '@restaurant-pos/api-client';
import { 
  exportToCSV, 
  exportToExcel, 
  printTable, 
  useColumnVisibility,
  ColumnManager
} from '@restaurant-pos/ui';

dayjs.locale('ru');

const { Title } = Typography;
const { Search } = Input;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function Subscriptions() {
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [columnModalVisible, setColumnModalVisible] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [daysToExtend, setDaysToExtend] = useState(30);
  const [searchText, setSearchText] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/super-admin/subscriptions`, {
        params: { limit: 1000, offset: 0 },
      });
      return response.data;
    },
  });

  const extendMutation = useMutation({
    mutationFn: async ({ id, days }: { id: string; days: number }) => {
      await axios.post(`${API_URL}/super-admin/subscriptions/${id}/extend`, {
        days,
      });
    },
    onSuccess: () => {
      message.success('Подписка успешно продлена');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setExtendModalVisible(false);
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Ошибка продления подписки'));
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.post(`${API_URL}/super-admin/subscriptions/${id}/activate`);
    },
    onSuccess: () => {
      message.success('Подписка активирована');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Ошибка активации'));
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.post(`${API_URL}/super-admin/subscriptions/${id}/deactivate`);
    },
    onSuccess: () => {
      message.success('Подписка деактивирована');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Ошибка деактивации'));
    },
  });

  const handleExtend = () => {
    if (selectedSubscription) {
      extendMutation.mutate({
        id: selectedSubscription.id,
        days: daysToExtend,
      });
    }
  };

  const getStatusTag = (subscription: any) => {
    const now = dayjs();
    const endDate = dayjs(subscription.end_date);
    const isExpired = endDate.isBefore(now);

    if (!subscription.is_active) {
      return <Tag color="default">Неактивна</Tag>;
    }

    if (isExpired) {
      return <Tag color="error" icon={<CloseCircleOutlined />}>Истекла</Tag>;
    }

    const daysLeft = endDate.diff(now, 'day');
    if (daysLeft <= 7) {
      return <Tag color="warning" icon={<ClockCircleOutlined />}>Истекает скоро ({daysLeft}д)</Tag>;
    }

    return <Tag color="success" icon={<CheckCircleOutlined />}>Активна</Tag>;
  };

  const filteredSubscriptions = data?.subscriptions?.filter((sub: any) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      sub.user?.name?.toLowerCase().includes(searchLower) ||
      sub.user?.email?.toLowerCase().includes(searchLower) ||
      sub.plan?.name?.toLowerCase().includes(searchLower)
    );
  });

  const allColumns = [
    {
      title: 'Пользователь',
      dataIndex: ['user', 'name'],
      key: 'user_name',
      required: true,
      render: (name: string, record: any) => (
        <div>
          <div>{name || 'Без имени'}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.user?.email}</div>
        </div>
      ),
    },
    {
      title: 'План',
      dataIndex: ['plan', 'name'],
      key: 'plan_name',
      render: (name: string, record: any) => {
        const daysLeft = dayjs(record.end_date).diff(dayjs(), 'day');
        return (
          <div>
            <div>{name}</div>
            <div style={{ fontSize: 12, color: '#999' }}>
              {daysLeft} дней осталось
            </div>
          </div>
        );
      },
    },
    {
      title: 'Дата начала',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Дата окончания',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_: any, record: any) => getStatusTag(record),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedSubscription(record);
              setDaysToExtend(30);
              setExtendModalVisible(true);
            }}
          >
            Продлить
          </Button>
          {record.is_active ? (
            <Button
              size="small"
              danger
              onClick={() => deactivateMutation.mutate(record.id)}
              loading={deactivateMutation.isPending}
            >
              Деактивировать
            </Button>
          ) : (
            <Button
              size="small"
              type="primary"
              onClick={() => activateMutation.mutate(record.id)}
              loading={activateMutation.isPending}
            >
              Активировать
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const {
    visibleColumns,
    columnInfo,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    resetColumnVisibility
  } = useColumnVisibility(allColumns, {
    storageKey: 'super-admin-subscriptions-columns'
  });

  const columns = visibleColumns;

  const handlePrint = () => {
    printTable(filteredSubscriptions || [], visibleColumns, 'Подписки', {
      showDate: true,
      orientation: 'landscape'
    });
  };

  const handleExport = () => {
    exportToExcel(filteredSubscriptions || [], visibleColumns, 'subscriptions.xlsx');
  };

  const handleExportCSV = () => {
    exportToCSV(filteredSubscriptions || [], visibleColumns, 'subscriptions.csv');
  };

  const handleColumns = () => {
    setColumnModalVisible(true);
  };

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>Подписки</Title>
          <Space>
            <Button
              icon={<SettingOutlined />}
              onClick={handleColumns}
            >
              Столбцы
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExport}
            >
              Excel
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExportCSV}
            >
              CSV
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={handlePrint}
            >
              Печать
            </Button>
          </Space>
        </div>

        <Card>
          <Search
            placeholder="Поиск по имени, email или плану"
            allowClear
            size="large"
            onChange={(e) => setSearchText(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Table
            dataSource={filteredSubscriptions}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `Всего: ${total}`,
            }}
          />
        </Card>
      </Space>

      <Modal
        title="Продлить подписку"
        open={extendModalVisible}
        onOk={handleExtend}
        onCancel={() => setExtendModalVisible(false)}
        confirmLoading={extendMutation.isPending}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <div><strong>Пользователь:</strong> {selectedSubscription?.user?.name}</div>
            <div><strong>Email:</strong> {selectedSubscription?.user?.email}</div>
            <div><strong>Текущий план:</strong> {selectedSubscription?.plan?.name}</div>
            <div>
              <strong>Дата окончания:</strong>{' '}
              {dayjs(selectedSubscription?.end_date).format('DD.MM.YYYY')}
            </div>
          </div>

          <div>
            <div style={{ marginBottom: 8 }}>Продлить на (дней):</div>
            <InputNumber
              min={1}
              max={365}
              value={daysToExtend}
              onChange={(value) => setDaysToExtend(value || 30)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <div><strong>Новая дата окончания:</strong></div>
            <div style={{ color: '#9333ea', fontSize: 16 }}>
              {dayjs(selectedSubscription?.end_date)
                .add(daysToExtend, 'day')
                .format('DD.MM.YYYY')}
            </div>
          </div>
        </Space>
      </Modal>

      {columnModalVisible && (
        <ColumnManager
          columns={columnInfo}
          onToggle={toggleColumn}
          onShowAll={showAllColumns}
          onHideAll={hideAllColumns}
          onReset={resetColumnVisibility}
          onClose={() => setColumnModalVisible(false)}
        />
      )}
    </div>
  );
}
