import { ClearOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';

interface ChatComposerProps {
  disabled?: boolean;
  sending?: boolean;
  hasActiveSession?: boolean;
  onSend: (question: string) => Promise<void>;
  onClear: () => Promise<void>;
}

interface ChatComposerFormValues {
  question: string;
}

export function ChatComposer({
  disabled = false,
  sending = false,
  hasActiveSession = false,
  onSend,
  onClear,
}: ChatComposerProps) {
  const [form] = Form.useForm<ChatComposerFormValues>();

  const handleSubmit = async (values: ChatComposerFormValues) => {
    await onSend(values.question.trim());
    form.resetFields();
  };

  return (
    <Form<ChatComposerFormValues> form={form} onFinish={handleSubmit}>
      <div className="qa-composer">
        <Form.Item
          name="question"
          rules={[
            {
              required: true,
              whitespace: true,
              message: '请输入问题内容后再发送',
            },
          ]}
          style={{ marginBottom: 0 }}
        >
          <Input.TextArea
            rows={4}
            placeholder="请输入你想基于知识库检索回答的问题"
            disabled={disabled || !hasActiveSession}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div className="qa-composer__actions">
          <Button
            icon={<ClearOutlined />}
            onClick={() => void onClear()}
            disabled={disabled || !hasActiveSession}
          >
            清空上下文
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={sending}
            disabled={disabled || !hasActiveSession}
          >
            发送问题
          </Button>
        </div>
      </div>
    </Form>
  );
}
