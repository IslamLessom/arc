import { useState } from 'react';
import {
  Table,
  Typography,
  Space,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  message,
  Card,
  Popconfirm,
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  PrinterOutlined,
  ExportOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getApiErrorMessage } from '@restaurant-pos/api-client';
import { 
  exportToCSV, 
  exportToExcel, 
  printTable, 
  useColumnVisibility,
  ColumnManager
} from '@restaurant-pos/ui';

const { Title } = Typography;
const { TextArea } = Input;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function Plans() {
  const [modalVisible, setModalVisible] = useState(false);
  const [columnModalVisible, setColumnModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/super-admin/plans`);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      await axios.post(`${API_URL}/super-admin/plans`, values);
    },
    onSuccess: () => {
      message.success('План успешно создан');
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setModalVisible(false);
      form.resetFields();
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Ошибка создания плана'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      await axios.put(`${API_URL}/super-admin/plans/${id}`, values);
    },
    onSuccess: () => {
      message.success('План успешно обновлен');
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setModalVisible(false);
      setEditingPlan(null);
      form.resetFields();
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Ошибка обновления плана'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_URL}/super-admin/plans/${id}`);
    },
    onSuccess: () => {
      message.success('План успешно удален');
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Ошибка удаления плана'));
    },
  });

  const handleCreate = () => {
    setEditingPlan(null);
    form.resetFields();
    form.setFieldsValue({ active: true });
    setModalVisible(true);
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    form.setFieldsValue({
      name: plan.name,
      duration: plan.duration,
      price: plan.price,
      features: plan.features,
      active: plan.active,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingPlan) {
        updateMutation.mutate({ id: editingPlan.id, values });
      } else {
        createMutation.mutate(values);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const allColumns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      required: true,
    },
    {
      title: 'Длительность',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration} дней`,
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) =>
        price === 0 ? 'Бесплатно' : `${price.toLocaleString('ru-RU')} ₽`,
    },
    {
      title: 'Статус',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Switch checked={active} disabled />
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Редактировать
          </Button>
          <Popconfirm
            title="Удалить план?"
            description="Вы уверены, что хотите удалить этот план?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              loading={deleteMutation.isPending}
            >
              Удалить
            </Button>
          </Popconfirm>
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
    storageKey: 'super-admin-plans-columns'
  });

  const columns = visibleColumns;

  const handlePrint = () => {
    printTable(plans || [], visibleColumns, 'Тарифные планы', {
      showDate: true,
      orientation: 'landscape'
    });
  };

  const handleExport = () => {
    exportToExcel(plans || [], visibleColumns, 'plans.xlsx');
  };

  const handleExportCSV = () => {
    exportToCSV(plans || [], visibleColumns, 'plans.csv');
  };

  const handleColumns = () => {
    setColumnModalVisible(true);
  };

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Title level={2}>Тарифные планы</Title>
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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              size="large"
            >
              Создать план
            </Button>
          </Space>
        </div>

        <Card>
          <Table
            dataSource={plans}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={false}
          />
        </Card>
      </Space>

      <Modal
        title={editingPlan ? 'Редактировать план' : 'Создать план'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          setEditingPlan(null);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название плана' }]}
          >
            <Input placeholder="Trial, Basic, Pro, Business" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Длительность (дней)"
            rules={[
              { required: true, message: 'Введите длительность' },
              { type: 'number', min: 1, message: 'Минимум 1 день' },
            ]}
          >
            <InputNumber
              min={1}
              max={365}
              style={{ width: '100%' }}
              placeholder="30"
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="Цена (₽)"
            rules={[
              { required: true, message: 'Введите цену' },
              { type: 'number', min: 0, message: 'Цена не может быть отрицательной' },
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="999"
              addonAfter="₽"
            />
          </Form.Item>

          <Form.Item name="features" label="Описание функций (JSON)">
            <TextArea
              rows={4}
              placeholder='{"all_features": true, "support": "email"}'
            />
          </Form.Item>

          <Form.Item name="active" label="Активен" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
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
