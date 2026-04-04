import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Breadcrumb,
  Button,
  Dropdown,
  Layout,
  Menu,
  Space,
  Tag,
  Typography,
} from 'antd';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { AppLogo } from '@/components/common/AppLogo';
import { APP_ROUTES } from '@/constants/routes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  getBreadcrumbItems,
  getPageTitle,
  getSelectedMenuKey,
  navigationMenuItems,
} from '@/router/navigation';
import { useAuthStore } from '@/store/auth';

const { Header, Content, Sider } = Layout;

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const pageTitle = getPageTitle(location.pathname);
  const selectedKey = getSelectedMenuKey(location.pathname);
  const breadcrumbItems = getBreadcrumbItems(location.pathname);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  useDocumentTitle(pageTitle);

  return (
    <Layout className="app-shell">
      <Sider
        breakpoint="lg"
        collapsed={collapsed}
        collapsible
        trigger={null}
        width={248}
        className="app-sider"
        onBreakpoint={(broken) => setCollapsed(broken)}
      >
        <AppLogo collapsed={collapsed} />

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={navigationMenuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header className="app-header">
          <Space size="middle">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((value) => !value)}
            />

            <div className="app-header__meta">
              <Typography.Text strong>{pageTitle}</Typography.Text>
              <Typography.Text type="secondary">
                企业级 AI 知识库与工单智能体后台
              </Typography.Text>
            </div>
          </Space>

          <Space size="middle">
            <Tag color="blue">Mock Mode</Tag>

            <Dropdown
              menu={{
                items: [
                  {
                    key: 'logout',
                    label: '退出登录',
                    icon: <LogoutOutlined />,
                  },
                ],
                onClick: ({ key }) => {
                  if (key === 'logout') {
                    clearSession();
                    navigate(APP_ROUTES.login, { replace: true });
                  }
                },
              }}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.name ?? '未登录用户'}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content className="app-content">
          <Breadcrumb items={breadcrumbItems} />
          <div style={{ height: 16 }} />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
