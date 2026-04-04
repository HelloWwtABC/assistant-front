import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Empty, Flex, Space, Spin, Tag, Typography } from 'antd';
import { useEffect, useRef } from 'react';

import type { QaMessageItem } from '@/types/qa';

import { CitationList } from './CitationList';

interface ChatMessageListProps {
  messages: QaMessageItem[];
  loading?: boolean;
  thinking?: boolean;
}

export function ChatMessageList({
  messages,
  loading = false,
  thinking = false,
}: ChatMessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) {
      return;
    }

    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }, [messages, thinking]);

  return (
    <div className="qa-message-scroll" ref={scrollContainerRef}>
      {loading ? (
        <div className="qa-chat-empty">
          <Spin size="large" tip="正在加载会话消息" />
        </div>
      ) : messages.length === 0 && !thinking ? (
        <div className="qa-chat-empty">
          <Empty
            description="当前会话暂无消息，输入问题后即可开始 RAG 智能问答"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <div className="qa-message-list">
          {messages.map((message) => {
            const isAssistant = message.role === 'assistant';

            return (
              <Card key={message.messageId} className="qa-message-card">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Flex align="center" gap={12}>
                    <Avatar
                      icon={isAssistant ? <RobotOutlined /> : <UserOutlined />}
                      style={{
                        backgroundColor: isAssistant ? '#1677ff' : '#d9d9d9',
                        color: isAssistant ? '#ffffff' : '#1f2329',
                        flex: '0 0 auto',
                      }}
                    />
                    <div className="qa-message-card__meta">
                      <Typography.Text strong>
                        {isAssistant ? '智能助手' : '你'}
                      </Typography.Text>
                      <div>
                        <Typography.Text type="secondary">
                          {message.createdAt}
                        </Typography.Text>
                      </div>
                    </div>
                    <Tag color={isAssistant ? 'processing' : 'default'}>
                      {isAssistant ? 'assistant' : 'user'}
                    </Tag>
                  </Flex>

                  <Typography.Paragraph
                    style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}
                  >
                    {message.content}
                  </Typography.Paragraph>

                  {isAssistant ? (
                    <div className="qa-message-card__citations">
                      <Typography.Text strong>引用来源</Typography.Text>
                      <CitationList citations={message.citations} />
                    </div>
                  ) : null}
                </Space>
              </Card>
            );
          })}

          {thinking ? (
            <Card className="qa-message-card qa-message-card--thinking">
              <Space align="center">
                <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1677ff' }} />
                <Space direction="vertical" size={2}>
                  <Typography.Text strong>智能助手</Typography.Text>
                  <Typography.Text type="secondary">
                    正在结合知识库检索结果思考中...
                  </Typography.Text>
                </Space>
              </Space>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
