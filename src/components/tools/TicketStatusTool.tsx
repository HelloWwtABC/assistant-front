import { Button, Card, Descriptions, Form, Input, Typography } from 'antd';
import { useState } from 'react';

import { PageStatus } from '@/components/status/PageStatus';
import {
  TICKET_PRIORITY_META,
  TICKET_STATUS_META,
  type TicketStatusQueryRequest,
  type TicketStatusResult,
} from '@/types/tools';

interface TicketStatusToolProps {
  onQuery: (payload: TicketStatusQueryRequest) => Promise<TicketStatusResult>;
  onFinished?: () => Promise<void> | void;
}

export function TicketStatusTool({
  onQuery,
  onFinished,
}: TicketStatusToolProps) {
  const [form] = Form.useForm<TicketStatusQueryRequest>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TicketStatusResult | null>(null);
  const [error, setError] = useState<string | false>(false);
  const [touched, setTouched] = useState(false);

  const handleSubmit = async (values: TicketStatusQueryRequest) => {
    setLoading(true);
    setTouched(true);
    setError(false);

    try {
      const response = await onQuery({
        ticketId: values.ticketId.trim(),
      });

      setResult(response);
    } catch (queryError) {
      setResult(null);
      setError(queryError instanceof Error ? queryError.message : '工单查询失败');
    } finally {
      setLoading(false);
      await onFinished?.();
    }
  };

  return (
    <Card
      title="查询工单状态"
      className="tool-card"
      extra={<Typography.Text type="secondary">输入工单 ID 查询处理进度</Typography.Text>}
    >
      <Form<TicketStatusQueryRequest>
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
      >
        <Form.Item
          label="工单ID"
          name="ticketId"
          rules={[{ required: true, message: '请输入工单 ID' }]}
        >
          <Input placeholder="例如：TK-1001" allowClear />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            查询工单
          </Button>
        </Form.Item>
      </Form>

      <div className="tool-card__result">
        <PageStatus
          loading={loading}
          error={error}
          empty={!touched || !result}
          emptyDescription="输入工单 ID 后可查看工单状态、负责人和摘要信息。"
        >
          {result ? (
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label="工单ID">{result.ticketId}</Descriptions.Item>
              <Descriptions.Item label="工单标题">{result.title}</Descriptions.Item>
              <Descriptions.Item label="当前状态">
                {TICKET_STATUS_META[result.status].text}
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                {TICKET_PRIORITY_META[result.priority]}
              </Descriptions.Item>
              <Descriptions.Item label="负责人">{result.owner}</Descriptions.Item>
              <Descriptions.Item label="最近更新时间">{result.updatedAt}</Descriptions.Item>
              <Descriptions.Item label="工单摘要说明">{result.summary}</Descriptions.Item>
            </Descriptions>
          ) : null}
        </PageStatus>
      </div>
    </Card>
  );
}
