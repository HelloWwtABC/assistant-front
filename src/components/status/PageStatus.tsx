import type { ReactNode } from 'react';
import { Button, Card, Empty, Result, Spin } from 'antd';

interface PageStatusProps {
  loading?: boolean;
  error?: boolean | string;
  empty?: boolean;
  emptyDescription?: string;
  onRetry?: () => void;
  children: ReactNode;
}

export function PageStatus({
  loading = false,
  error = false,
  empty = false,
  emptyDescription = '当前暂无数据，请稍后补充或调整筛选条件。',
  onRetry,
  children,
}: PageStatusProps) {
  if (loading) {
    return (
      <Card className="page-status-card">
        <Spin size="large" tip="正在加载页面数据" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="page-status-card">
        <Result
          status="error"
          title="页面加载失败"
          subTitle={typeof error === 'string' ? error : '请稍后重试'}
          extra={
            onRetry ? (
              <Button type="primary" onClick={onRetry}>
                重新加载
              </Button>
            ) : null
          }
        />
      </Card>
    );
  }

  if (empty) {
    return (
      <Card className="page-status-card">
        <Empty description={emptyDescription} />
      </Card>
    );
  }

  return <>{children}</>;
}
