import { Button, Result, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

import { APP_ROUTES } from '@/constants/routes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAuthStore } from '@/store/auth';

export function NotFoundPage() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);

  useDocumentTitle('页面不存在');

  return (
    <div className="fullscreen-loading">
      <Result
        status="404"
        title="404"
        subTitle="当前访问的页面不存在或路由尚未配置。"
        extra={
          <Space>
            <Button
              type="primary"
              onClick={() =>
                navigate(token ? APP_ROUTES.dashboard : APP_ROUTES.login, {
                  replace: true,
                })
              }
            >
              返回首页
            </Button>
            <Button onClick={() => navigate(-1)}>返回上一页</Button>
          </Space>
        }
      />
    </div>
  );
}
