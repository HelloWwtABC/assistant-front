import { FileSearchOutlined } from '@ant-design/icons';
import { Card, Empty, Space, Tag, Typography } from 'antd';

import {
  SESSION_ROLE_META,
  type SessionMessageCitationItem,
  type SessionMessageItem,
} from '@/types/sessions';

interface MessageHistoryListProps {
  messages: SessionMessageItem[];
}

function CitationInfo({ citations }: { citations: SessionMessageCitationItem[] }) {
  return (
    <div className="sessions-message-history__citations">
      <Typography.Text strong>引用来源</Typography.Text>

      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        {citations.map((citation) => (
          <div
            key={`${citation.documentId}-${citation.chunkIndex}`}
            className="sessions-message-history__citation-item"
          >
            <Space wrap>
              <FileSearchOutlined />
              <Typography.Text strong>{citation.documentName}</Typography.Text>
              <Tag>{citation.documentId}</Tag>
              <Tag color="blue">Chunk #{citation.chunkIndex}</Tag>
            </Space>
            <Typography.Paragraph
              type="secondary"
              ellipsis={{ rows: 2, expandable: false }}
              style={{ marginBottom: 0 }}
            >
              {citation.snippet}
            </Typography.Paragraph>
          </div>
        ))}
      </Space>
    </div>
  );
}

export function MessageHistoryList({ messages }: MessageHistoryListProps) {
  if (messages.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="当前会话暂无消息记录"
      />
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {messages.map((message) => {
        const roleMeta = SESSION_ROLE_META[message.role];

        return (
          <Card
            key={message.messageId}
            size="small"
            className="sessions-message-history__card"
          >
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div className="sessions-message-history__header">
                <Space wrap>
                  <Tag color={roleMeta.color}>{roleMeta.text}</Tag>
                  <Typography.Text type="secondary">
                    {message.createdAt}
                  </Typography.Text>
                </Space>
              </div>

              <Typography.Paragraph
                className="sessions-message-history__content"
                style={{ marginBottom: 0 }}
              >
                {message.content}
              </Typography.Paragraph>

              {message.role === 'assistant' && message.citations?.length ? (
                <CitationInfo citations={message.citations} />
              ) : null}
            </Space>
          </Card>
        );
      })}
    </Space>
  );
}
