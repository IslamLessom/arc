import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, CrownOutlined } from '@ant-design/icons';
import { getApiErrorMessage } from '@restaurant-pos/api-client';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Вход выполнен успешно');
      navigate('/dashboard');
    } catch (error: unknown) {
      message.error(getApiErrorMessage(error, 'Ошибка входа'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <CrownOutlined style={{ fontSize: 48, color: '#9333ea' }} />
            <Title level={2} style={{ marginTop: 16, marginBottom: 8 }}>
              Super Admin Panel
            </Title>
            <Text type="secondary">
              Панель управления подписками и пользователями
            </Text>
          </div>

          <Form name="login" onFinish={onFinish} layout="vertical" size="large">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Введите email' },
                { type: 'email', message: 'Некорректный email' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Введите пароль' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Пароль"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: 48 }}
              >
                Войти
              </Button>
            </Form.Item>
          </Form>

          <Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
            Доступ только для супер-администраторов системы
          </Text>
        </Space>
      </Card>
    </div>
  );
}
