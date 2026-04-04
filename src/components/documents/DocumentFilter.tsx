import { Button, Col, Form, Input, Row, Select, Space } from 'antd';
import { useEffect } from 'react';

import {
  DOCUMENT_STATUS_OPTIONS,
  type DocumentStatus,
} from '@/types/documents';

export interface DocumentFilterValues {
  keyword?: string;
  status?: DocumentStatus;
  uploader?: string;
}

interface DocumentFilterProps {
  loading?: boolean;
  values: DocumentFilterValues;
  onSearch: (values: DocumentFilterValues) => void;
  onReset: () => void;
}

export function DocumentFilter({
  loading = false,
  values,
  onSearch,
  onReset,
}: DocumentFilterProps) {
  const [form] = Form.useForm<DocumentFilterValues>();

  useEffect(() => {
    form.setFieldsValue(values);
  }, [form, values]);

  return (
    <Form<DocumentFilterValues>
      form={form}
      layout="vertical"
      initialValues={values}
      onFinish={onSearch}
      className="document-filter"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={8}>
          <Form.Item label="文档名称" name="keyword">
            <Input placeholder="请输入文档名称或文档 ID" allowClear />
          </Form.Item>
        </Col>

        <Col xs={24} md={12} xl={6}>
          <Form.Item label="解析状态" name="status">
            <Select
              allowClear
              placeholder="请选择解析状态"
              options={DOCUMENT_STATUS_OPTIONS}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12} xl={6}>
          <Form.Item label="上传人" name="uploader">
            <Input placeholder="请输入上传人" allowClear />
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
