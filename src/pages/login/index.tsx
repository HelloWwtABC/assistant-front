import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Space, Typography, message } from 'antd';
import { useState } from 'react';
import type { Location } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';

import { authApi } from '@/api/modules/auth';
import { APP_ROUTES } from '@/constants/routes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAuthStore } from '@/store/auth';
import type { LoginPayload } from '@/types/auth';

interface LoginLocationState {
  from?: Location;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const [form] = Form.useForm<LoginPayload>();
  const [submitting, setSubmitting] = useState(false);

  useDocumentTitle('登录');

  const redirectTo =
    (location.state as LoginLocationState | null)?.from?.pathname ??
    APP_ROUTES.dashboard;

  const handleSubmit = async (values: LoginPayload) => {
    setSubmitting(true);

    try {
      const result = await authApi.login(values);

      setSession(result);
      message.success('登录成功');
      navigate(redirectTo, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="login-card" bordered={false}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 8 }}>
            欢迎登录
          </Typography.Title>
          <Typography.Text type="secondary">
            使用平台账号进入后台，当前已对接 mock 登录接口。
          </Typography.Text>
        </div>

        <Alert
          type="info"
          showIcon
          message="演示账号：admin / Admin123456"
        />

        <Form<LoginPayload>
          layout="vertical"
          form={form}
          initialValues={{
            username: 'admin',
            password: 'Admin123456',
          }}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={submitting}>
              登录系统
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  );
}
