import { Button, Card, Descriptions, Form, Input, Typography } from 'antd';
import { useState } from 'react';

import { PageStatus } from '@/components/status/PageStatus';
import {
  SERVICE_HEALTH_META,
  type ServiceHealthQueryRequest,
  type ServiceHealthResult,
} from '@/types/tools';

interface ServiceHealthToolProps {
  onQuery: (payload: ServiceHealthQueryRequest) => Promise<ServiceHealthResult>;
  onFinished?: () => Promise<void> | void;
}

export function ServiceHealthTool({
  onQuery,
  onFinished,
}: ServiceHealthToolProps) {
  const [form] = Form.useForm<ServiceHealthQueryRequest>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ServiceHealthResult | null>(null);
  const [error, setError] = useState<string | false>(false);
  const [touched, setTouched] = useState(false);

  const handleSubmit = async (values: ServiceHealthQueryRequest) => {
    setLoading(true);
    setTouched(true);
    setError(false);

    try {
      const response = await onQuery({
        serviceName: values.serviceName.trim(),
      });

      setResult(response);
    } catch (queryError) {
      setResult(null);
      setError(queryError instanceof Error ? queryError.message : '健康状态查询失败');
    } finally {
      setLoading(false);
      await onFinished?.();
    }
  };

  return (
    <Card
      title="查询服务健康状态"
      className="tool-card"
      extra={<Typography.Text type="secondary">支持固定 mock 服务名称查询</Typography.Text>}
    >
      <Form<ServiceHealthQueryRequest>
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
      >
        <Form.Item
          label="服务名称"
          name="serviceName"
          rules={[{ required: true, whitespace: true, message: '请输入服务名称' }]}
        >
          <Input placeholder="例如：rag-gateway" allowClear />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            查询健康状态
          </Button>
        </Form.Item>
      </Form>

      <div className="tool-card__result">
        <PageStatus
          loading={loading}
          error={error}
          empty={!touched || !result}
          emptyDescription="输入服务名称后，可查看服务健康状态、实例数量和平均响应时间。"
        >
          {result ? (
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label="服务名称">{result.serviceName}</Descriptions.Item>
              <Descriptions.Item label="健康状态">
                {SERVICE_HEALTH_META[result.healthStatus].text}
              </Descriptions.Item>
              <Descriptions.Item label="实例数量">{result.instanceCount}</Descriptions.Item>
              <Descriptions.Item label="平均响应时间">
                {result.averageResponseTime} ms
              </Descriptions.Item>
              <Descriptions.Item label="最近检查时间">{result.checkedAt}</Descriptions.Item>
              <Descriptions.Item label="备注说明">{result.remark}</Descriptions.Item>
            </Descriptions>
          ) : null}
        </PageStatus>
      </div>
    </Card>
  );
}
