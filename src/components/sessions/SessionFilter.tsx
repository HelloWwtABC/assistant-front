import { Button, Col, DatePicker, Form, Input, Row, Select, Space } from 'antd';
import type { Dayjs } from 'dayjs';
import { useEffect } from 'react';

import type { SessionKnowledgeBaseItem } from '@/types/sessions';

const { RangePicker } = DatePicker;

export interface SessionFilterValues {
  keyword?: string;
  knowledgeBaseId?: string;
  activeRange?: [Dayjs, Dayjs];
}

interface SessionFilterProps {
  loading?: boolean;
  values: SessionFilterValues;
  knowledgeBaseOptions: SessionKnowledgeBaseItem[];
  onSearch: (values: SessionFilterValues) => void;
  onReset: () => void;
}

export function SessionFilter({
  loading = false,
  values,
  knowledgeBaseOptions,
  onSearch,
  onReset,
}: SessionFilterProps) {
  const [form] = Form.useForm<SessionFilterValues>();

  useEffect(() => {
    form.setFieldsValue(values);
  }, [form, values]);

  return (
    <Form<SessionFilterValues>
      form={form}
      layout="vertical"
      initialValues={values}
      onFinish={onSearch}
      className="sessions-filter"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={8}>
          <Form.Item label="关键词搜索" name="keyword">
            <Input
              allowClear
              placeholder="请输入会话标题、问题摘要或会话 ID"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12} xl={6}>
          <Form.Item label="关联知识库" name="knowledgeBaseId">
            <Select
              allowClear
              placeholder="请选择知识库"
              options={knowledgeBaseOptions}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12} xl={6}>
          <Form.Item label="最近活跃时间" name="activeRange">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12} xl={4}>
          <Form.Item label=" ">
            <Space wrap>
              <Button type="primary" htmlType="submit" loading={loading}>
                查询
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  onReset();
                }}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
