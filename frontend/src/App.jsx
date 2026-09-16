import { BrowserRouter, Routes, Route, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Tag, Space } from 'antd';
import {
  FileTextOutlined,
  AuditOutlined,
  WalletOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { UserProvider, useUser } from './context/UserContext';
import { ROLE_NAMES } from './constants';
import Login from './pages/Login';
import MyRequests from './pages/MyRequests';
import RequestEdit from './pages/RequestEdit';
import RequestDetail from './pages/RequestDetail';
import Approvals from './pages/Approvals';
import Balances from './pages/Balances';

const { Header, Sider, Content } = Layout;

function RequireUser() {
  const { user, logout } = useUser();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const menuItems = [
    { key: '/requests', icon: <FileTextOutlined />, label: <NavLink to="/requests">我的请假单</NavLink> },
    ...(user.role === 'MANAGER'
      ? [{ key: '/approvals', icon: <AuditOutlined />, label: <NavLink to="/approvals">审批中心</NavLink> }]
      : []),
    { key: '/balances', icon: <WalletOutlined />, label: <NavLink to="/balances">假期余额</NavLink> },
  ];
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={200}>
        <div className="logo">请假审批系统</div>
        <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems} />
      </Sider>
      <Layout>
        <Header className="app-header">
          <Space size="middle">
            <span>{user.name}</span>
            <Tag color={user.role === 'MANAGER' ? 'gold' : 'blue'}>{ROLE_NAMES[user.role]}</Tag>
            <Button type="text" icon={<LogoutOutlined />} onClick={logout}>
              退出
            </Button>
          </Space>
        </Header>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireUser />}>
            <Route path="/" element={<Navigate to="/requests" replace />} />
            <Route path="/requests" element={<MyRequests />} />
            <Route path="/requests/new" element={<RequestEdit />} />
            <Route path="/requests/:code/edit" element={<RequestEdit />} />
            <Route path="/requests/:code" element={<RequestDetail />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/balances" element={<Balances />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
