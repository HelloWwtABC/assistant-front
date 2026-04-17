import { Card, Descriptions, Drawer, Space, Typography } from 'antd';

import { PageStatus } from '@/components/status/PageStatus';
import type { SessionDetail } from '@/types/sessions';

import { MessageHistoryList } from './MessageHistoryList';

interface SessionDetailDrawerProps {
  open: boolean;
  loading?: boolean;
  detail: SessionDetail | null;
  error?: boolean | string;
  onClose: () => void;
  onRetry?: () => void;
}

export function SessionDetailDrawer({
  open,
  loading = false,
  detail,
  error = false,
  onClose,
  onRetry,
}: SessionDetailDrawerProps) {
  return (
    <Drawer
      title="会话详情"
      open={open}
      width={860}
      onClose={onClose}
      className="sessions-detail-drawer"
      destroyOnClose={false}
    >
      <div className="sessions-detail-drawer__body">
        <PageStatus
          loading={loading}
          error={error}
          empty={!detail}
          emptyDescription="当前未获取到会话详情，请重新选择会话后重试。"
          onRetry={onRetry}
        >
          {detail ? (
            <div className="sessions-detail-drawer__content">
              <Card title="基础信息">
                <Descriptions column={{ xs: 1, md: 2 }} bordered size="small">
                  <Descriptions.Item label="会话 ID">
                    <Typography.Text code>{detail.sessionId}</Typography.Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="会话标题">
                    {detail.title}
                  </Descriptions.Item>
                  <Descriptions.Item label="关联知识库">
                    {detail.knowledgeBaseName}
                  </Descriptions.Item>
                  <Descriptions.Item label="提问次数">
                    {detail.questionCount}
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间">
                    {detail.createdAt}
                  </Descriptions.Item>
                  <Descriptions.Item label="最后活跃时间">
                    {detail.updatedAt}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card
                title="消息历史"
                className="sessions-detail-drawer__messages-card"
                extra={
                  <Space>
                    <Typography.Text type="secondary">
                      共 {detail.messages.length} 条消息
                    </Typography.Text>
                  </Space>
                }
              >
                <div className="sessions-detail-drawer__messages-scroll">
                  <MessageHistoryList messages={detail.messages} />
                </div>
              </Card>
            </div>
          ) : null}
        </PageStatus>
      </div>
    </Drawer>
  );
}
