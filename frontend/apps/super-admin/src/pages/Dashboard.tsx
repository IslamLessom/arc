import { Card, Row, Col, Statistic, Typography } from 'antd';
import { UserOutlined, FileProtectOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const { Title } = Typography;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function Dashboard() {
  const { data: subscriptionsData } = useQuery({
    queryKey: ['subscriptions-stats'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/super-admin/subscriptions`, {
        params: { limit: 1000, offset: 0 },
      });
      return response.data;
    },
  });

  const activeSubscriptions = subscriptionsData?.subscriptions?.filter(
    (sub: any) => sub.is_active && new Date(sub.end_date) > new Date()
  ).length || 0;

  const expiredSubscriptions = subscriptionsData?.subscriptions?.filter(
    (sub: any) => new Date(sub.end_date) <= new Date()
  ).length || 0;

  const totalUsers = subscriptionsData?.total || 0;

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Всего пользователей"
              value={totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#9333ea' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Всего подписок"
              value={subscriptionsData?.total || 0}
              prefix={<FileProtectOutlined />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Активных"
              value={activeSubscriptions}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Истекших"
              value={expiredSubscriptions}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
