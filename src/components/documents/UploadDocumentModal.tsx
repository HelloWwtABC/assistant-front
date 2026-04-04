import { InboxOutlined } from '@ant-design/icons';
import { Form, Input, Modal, Select, Upload, message } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { useState } from 'react';

import type {
  KnowledgeBaseOption,
  UploadDocumentRequest,
} from '@/types/documents';

interface UploadDocumentModalProps {
  open: boolean;
  confirmLoading?: boolean;
  knowledgeBaseOptions: KnowledgeBaseOption[];
  onCancel: () => void;
  onSubmit: (values: UploadDocumentRequest) => Promise<void>;
}

interface UploadDocumentFormValues {
  knowledgeBaseId: string;
  remark?: string;
}

const acceptedExtensions = ['pdf', 'docx', 'md', 'txt'];

export function UploadDocumentModal({
  open,
  confirmLoading = false,
  knowledgeBaseOptions,
  onCancel,
  onSubmit,
}: UploadDocumentModalProps) {
  const [form] = Form.useForm<UploadDocumentFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !acceptedExtensions.includes(extension)) {
      message.error('仅支持上传 pdf、docx、md、txt 格式文件');

      return Upload.LIST_IGNORE;
    }

    setFileList([
      {
        uid: file.uid,
        name: file.name,
        status: 'done',
        originFileObj: file,
      },
    ]);

    return false;
  };

  const handleConfirm = async () => {
    const values = await form.validateFields();
    const currentFile = fileList[0]?.originFileObj;

    if (!currentFile) {
      message.error('请先选择需要上传的文件');

      return;
    }

    await onSubmit({
      knowledgeBaseId: values.knowledgeBaseId,
      remark: values.remark?.trim(),
      file: currentFile as File,
    });

    form.resetFields();
    setFileList([]);
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  return (
    <Modal
      title="上传文档"
      open={open}
      onCancel={handleCancel}
      onOk={() => void handleConfirm()}
      confirmLoading={confirmLoading}
      okText="确认上传"
      cancelText="取消"
    >
      <Form<UploadDocumentFormValues> form={form} layout="vertical">
        <Form.Item
          label="所属知识库"
          name="knowledgeBaseId"
          rules={[{ required: true, message: '请选择所属知识库' }]}
        >
          <Select
            placeholder="请选择所属知识库"
            options={knowledgeBaseOptions}
          />
        </Form.Item>

        <Form.Item
          label="文件上传"
          required
          extra="支持文件格式：pdf、docx、md、txt"
        >
          <Upload.Dragger
            accept=".pdf,.docx,.md,.txt"
            maxCount={1}
            beforeUpload={beforeUpload}
            fileList={fileList}
            onRemove={() => {
              setFileList([]);
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              上传后会新增一条 mock 文档记录，状态默认为“解析中”
            </p>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item label="备注" name="remark">
          <Input.TextArea
            rows={4}
            placeholder="可选，用于记录文档用途、适用范围等说明"
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
