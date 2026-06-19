import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, message, Typography, Space } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  DashboardOutlined,
  AppleOutlined,
  FormOutlined,
  BellOutlined,
  CameraOutlined,
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('userInfo') || localStorage.getItem('user');
    if (user) {
      try {
        setUserInfo(JSON.parse(user));
      } catch (e) {
        setUserInfo({ username: '用户' });
      }
    } else {
      setUserInfo({ username: '用户' });
    }
  }, []);

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/plants', icon: <AppleOutlined />, label: '植物档案' },
    { key: '/diaries', icon: <FormOutlined />, label: '种植日记' },
    { key: '/reminders', icon: <BellOutlined />, label: '养护提醒' },
    { key: '/recognition', icon: <CameraOutlined />, label: '植物识别' },
    { key: '/community', icon: <TeamOutlined />, label: '社区交流' },
    { key: '/wiki', icon: <BookOutlined />, label: '植物百科' }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('user');
    message.success('已退出登录');
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: userInfo?.username || '用户名'
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 10
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0'
          }}
        >
          <AppleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
          {!collapsed && (
            <Text strong style={{ fontSize: 18, marginLeft: 12, color: '#52c41a' }}>
              园艺助手
            </Text>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0, padding: '16px 8px' }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 9
          }}
        >
          <Space>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              onClick: () => setCollapsed(!collapsed),
              style: { fontSize: 18, cursor: 'pointer' }
            })}
          </Space>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />
              {userInfo?.username && (
                <Text style={{ fontSize: 14 }}>{userInfo.username}</Text>
              )}
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            padding: 24,
            minHeight: 'calc(100vh - 64px)',
            height: 'calc(100vh - 64px)',
            overflow: 'auto',
            background: '#f5f7fa'
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
