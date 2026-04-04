import { Button, Result, Space } from 'antd';
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from 'react-router-dom';

export function RouteErrorResult() {
  const navigate = useNavigate();
  const error = useRouteError();

  let description = '路由加载时发生异常，请稍后重试。';

  if (isRouteErrorResponse(error)) {
    description = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    description = error.message;
  }

  return (
    <div className="fullscreen-loading">
      <Result
        status="error"
        title="页面发生错误"
        subTitle={description}
        extra={
          <Space>
            <Button type="primary" onClick={() => window.location.reload()}>
              刷新页面
            </Button>
            <Button onClick={() => navigate(-1)}>返回上一页</Button>
          </Space>
        }
      />
    </div>
  );
}
