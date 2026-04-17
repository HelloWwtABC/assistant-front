import { Card, Descriptions, Drawer, Empty, List, Space, Tag, Typography } from 'antd';

import { PageStatus } from '@/components/status/PageStatus';
import {
  QUALITY_LEVEL_META,
  REQUEST_STATUS_META,
  TOOL_CALL_FLAG_META,
  type RequestLogDetail,
  type RequestToolCallItem,
} from '@/types/observability';

interface RequestDetailDrawerProps {
  open: boolean;
  loading?: boolean;
  detail: RequestLogDetail | null;
  error?: boolean | string;
  onClose: () => void;
  onRetry?: () => void;
}

function ToolCallList({ toolCalls }: { toolCalls: RequestToolCallItem[] }) {
  if (toolCalls.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="当前请求未触发工具调用"
      />
    );
  }

  return (
    <List
      itemLayout="vertical"
      dataSource={toolCalls}
      renderItem={(item) => (
        <List.Item>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="工具名称">{item.toolName}</Descriptions.Item>
            <Descriptions.Item label="输入摘要">{item.inputSummary}</Descriptions.Item>
            <Descriptions.Item label="输出摘要">{item.outputSummary}</Descriptions.Item>
            <Descriptions.Item label="调用状态">
              <Tag color={item.status === 'success' ? 'success' : 'error'}>
                {item.status === 'success' ? '成功' : '失败'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="调用耗时">
              {item.durationMs} ms
            </Descriptions.Item>
          </Descriptions>
        </List.Item>
      )}
    />
  );
}

export function RequestDetailDrawer({
  open,
  loading = false,
  detail,
  error = false,
  onClose,
  onRetry,
}: RequestDetailDrawerProps) {
  return (
    <Drawer
      title="请求详情"
      open={open}
      width={920}
      onClose={onClose}
      className="observability-detail-drawer"
      destroyOnClose={false}
    >
      <div className="observability-detail-drawer__body">
        <PageStatus
          loading={loading}
          error={error}
          empty={!detail}
          emptyDescription="当前未获取到请求详情，请返回日志列表重新选择。"
          onRetry={onRetry}
        >
          {detail ? (
            <div className="observability-detail-drawer__content">
              <Card title="基础信息">
                <Descriptions column={{ xs: 1, md: 2 }} bordered size="small">
                  <Descriptions.Item label="请求 ID">
                    <Typography.Text code>{detail.requestId}</Typography.Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="会话 ID">
                    <Typography.Text code>{detail.sessionId}</Typography.Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="模型名称">{detail.modelName}</Descriptions.Item>
                  <Descriptions.Item label="请求状态">
                    <Tag color={REQUEST_STATUS_META[detail.status].color}>
                      {REQUEST_STATUS_META[detail.status].text}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="响应耗时">{detail.latencyMs} ms</Descriptions.Item>
                  <Descriptions.Item label="请求时间">{detail.createdAt}</Descriptions.Item>
                  <Descriptions.Item label="是否调用工具">
                    <Tag color={TOOL_CALL_FLAG_META[detail.usedTool].color}>
                      {TOOL_CALL_FLAG_META[detail.usedTool].text}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="问答内容">
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="用户问题">
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      {detail.question}
                    </Typography.Paragraph>
                  </Descriptions.Item>
                  <Descriptions.Item label="模型回答">
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      {detail.answer}
                    </Typography.Paragraph>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="检索与引用信息">
                <Descriptions column={{ xs: 1, md: 2 }} bordered size="small">
                  <Descriptions.Item label="命中片段数">
                    {detail.hitChunkCount}
                  </Descriptions.Item>
                  <Descriptions.Item label="引用数">
                    {detail.citationCount}
                  </Descriptions.Item>
                </Descriptions>

                <div className="observability-panel__section">
                  {detail.citations.length > 0 ? (
                    <List
                      itemLayout="vertical"
                      dataSource={detail.citations}
                      renderItem={(item) => (
                        <List.Item>
                          <Space direction="vertical" size={8} style={{ width: '100%' }}>
                            <Space wrap>
                              <Typography.Text strong>{item.documentName}</Typography.Text>
                              <Tag>{item.documentId}</Tag>
                              <Tag color="blue">Chunk #{item.chunkIndex}</Tag>
                            </Space>
                            <Typography.Paragraph
                              type="secondary"
                              ellipsis={{ rows: 2, expandable: false }}
                              style={{ marginBottom: 0 }}
                            >
                              {item.snippet}
                            </Typography.Paragraph>
                          </Space>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="当前请求暂无引用来源"
                    />
                  )}
                </div>
              </Card>

              <Card title="工具调用信息">
                <ToolCallList toolCalls={detail.toolCalls} />
              </Card>

              <Card title="评测信息">
                <Descriptions column={{ xs: 1, md: 2 }} bordered size="small">
                  <Descriptions.Item label="用户评分">
                    {detail.evaluation.userScore} / 5
                  </Descriptions.Item>
                  <Descriptions.Item label="是否有帮助">
                    {detail.evaluation.helpful ? '是' : '否'}
                  </Descriptions.Item>
                  <Descriptions.Item label="回答质量等级">
                    <Tag color={QUALITY_LEVEL_META[detail.evaluation.qualityLevel].color}>
                      {QUALITY_LEVEL_META[detail.evaluation.qualityLevel].text}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="评测备注">
                    {detail.evaluation.remark || '暂无备注'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </div>
          ) : null}
        </PageStatus>
      </div>
    </Drawer>
  );
}
