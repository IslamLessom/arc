import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button, Typography, Space } from 'antd';
import {
  DashboardOutlined,
  FileProtectOutlined,
  TagsOutlined,
  LogoutOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const { Header, Sider, Content } = AntLayout;
const { Title } = Typography;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/subscriptions',
      icon: <FileProtectOutlined />,
      label: 'Подписки',
    },
    {
      key: '/plans',
      icon: <TagsOutlined />,
      label: 'Тарифные планы',
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: '#1a1a1a',
          borderBottom: '1px solid #333',
        }}
      >
        <Space>
          <CrownOutlined style={{ fontSize: 24, color: '#9333ea' }} />
          <Title level={4} style={{ margin: 0, color: '#fff' }}>
            Super Admin Panel
          </Title>
        </Space>
        <Space>
          <span style={{ color: '#999' }}>{user?.name || user?.email}</span>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: '#999' }}
          >
            Выйти
          </Button>
        </Space>
      </Header>
      <AntLayout>
        <Sider width={250} style={{ background: '#1a1a1a' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ height: '100%', borderRight: 0, background: '#1a1a1a' }}
          />
        </Sider>
        <Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: '#0f0f0f',
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
