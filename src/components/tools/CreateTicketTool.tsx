import { Button, Card, Checkbox, Descriptions, Form, Input, Select, Typography } from 'antd';
import { useState } from 'react';

import { PageStatus } from '@/components/status/PageStatus';
import {
  TICKET_PRIORITY_OPTIONS,
  TICKET_STATUS_META,
  type CreateTicketRequest,
  type CreateTicketResult,
} from '@/types/tools';

interface CreateTicketToolProps {
  onCreate: (payload: CreateTicketRequest) => Promise<CreateTicketResult>;
  onFinished?: () => Promise<void> | void;
}

interface CreateTicketFormValues extends CreateTicketRequest {
  clearAfterSubmit: boolean;
}

export function CreateTicketTool({
  onCreate,
  onFinished,
}: CreateTicketToolProps) {
  const [form] = Form.useForm<CreateTicketFormValues>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreateTicketResult | null>(null);
  const [error, setError] = useState<string | false>(false);
  const [touched, setTouched] = useState(false);

  const handleSubmit = async (values: CreateTicketFormValues) => {
    setLoading(true);
    setTouched(true);
    setError(false);

    try {
      const response = await onCreate({
        title: values.title.trim(),
        priority: values.priority,
        description: values.description.trim(),
      });

      setResult(response);

      if (values.clearAfterSubmit) {
        form.resetFields();
        form.setFieldValue('clearAfterSubmit', true);
      }
    } catch (createError) {
      setResult(null);
      setError(createError instanceof Error ? createError.message : '工单创建失败');
    } finally {
      setLoading(false);
      await onFinished?.();
    }
  };

  return (
    <Card
      title="创建工单"
      className="tool-card"
      extra={<Typography.Text type="secondary">快速创建新工单并查看默认分派结果</Typography.Text>}
    >
      <Form<CreateTicketFormValues>
        layout="vertical"
        form={form}
        initialValues={{
          priority: 'medium',
          clearAfterSubmit: true,
        }}
        onFinish={handleSubmit}
      >
        <Form.Item
          label="工单标题"
          name="title"
          rules={[{ required: true, whitespace: true, message: '请输入工单标题' }]}
        >
          <Input placeholder="请输入工单标题" maxLength={60} />
        </Form.Item>

        <Form.Item
          label="优先级"
          name="priority"
          rules={[{ required: true, message: '请选择优先级' }]}
        >
          <Select options={TICKET_PRIORITY_OPTIONS} />
        </Form.Item>

        <Form.Item
          label="工单描述"
          name="description"
          rules={[{ required: true, whitespace: true, message: '请输入工单描述' }]}
        >
          <Input.TextArea rows={4} placeholder="请描述问题背景、影响范围和期望处理方式" />
        </Form.Item>

        <Form.Item name="clearAfterSubmit" valuePropName="checked">
          <Checkbox>创建成功后清空表单</Checkbox>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            创建工单
          </Button>
        </Form.Item>
      </Form>

      <div className="tool-card__result">
        <PageStatus
          loading={loading}
          error={error}
          empty={!touched || !result}
          emptyDescription="填写标题、优先级和描述后，可创建新的 mock 工单。"
        >
          {result ? (
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label="新工单ID">{result.ticketId}</Descriptions.Item>
              <Descriptions.Item label="创建状态">创建成功</Descriptions.Item>
              <Descriptions.Item label="提交时间">{result.submittedAt}</Descriptions.Item>
              <Descriptions.Item label="默认负责人">{result.assignee}</Descriptions.Item>
              <Descriptions.Item label="默认处理状态">
                {TICKET_STATUS_META[result.processStatus].text}
              </Descriptions.Item>
            </Descriptions>
          ) : null}
        </PageStatus>
      </div>
    </Card>
  );
}
