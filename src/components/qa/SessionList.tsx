import {
  DeleteOutlined,
  MessageOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Empty,
  Input,
  List,
  Popconfirm,
  Spin,
  Typography,
} from 'antd';

import type { QaSessionItem } from '@/types/qa';

interface SessionListProps {
  sessions: QaSessionItem[];
  activeSessionId?: string;
  keyword: string;
  loading?: boolean;
  creating?: boolean;
  onKeywordChange: (keyword: string) => void;
  onCreate: () => void;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

export function SessionList({
  sessions,
  activeSessionId,
  keyword,
  loading = false,
  creating = false,
  onKeywordChange,
  onCreate,
  onSelect,
  onDelete,
}: SessionListProps) {
  return (
    <div className="qa-session-list">
      <div className="qa-session-list__toolbar">
        <Button
          type="primary"
          block
          icon={<PlusOutlined />}
          onClick={onCreate}
          loading={creating}
        >
          新建会话
        </Button>

        <Input
          allowClear
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="搜索会话标题或摘要"
          prefix={<SearchOutlined />}
        />
      </div>

      <div className="qa-session-list__content">
        {loading ? (
          <div className="qa-session-list__loading">
            <Spin tip="正在加载会话列表" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="qa-session-list__empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="当前没有匹配的会话"
            />
          </div>
        ) : (
          <List
            dataSource={sessions}
            renderItem={(item) => {
              const active = item.sessionId === activeSessionId;

              return (
                <List.Item
                  className={`qa-session-item${active ? ' qa-session-item--active' : ''}`}
                  onClick={() => onSelect(item.sessionId)}
                >
                  <div className="qa-session-item__main">
                    <div className="qa-session-item__icon">
                      <MessageOutlined
                        style={{ color: active ? '#1677ff' : '#667085' }}
                      />
                    </div>

                    <div className="qa-session-item__content">
                      <Typography.Text
                        strong
                        className="qa-session-item__title"
                        title={item.title}
                      >
                        {item.title}
                      </Typography.Text>

                      <Typography.Paragraph
                        className="qa-session-item__summary"
                        ellipsis={{ rows: 2, tooltip: item.lastMessagePreview }}
                      >
                        {item.lastMessagePreview || '暂无消息摘要'}
                      </Typography.Paragraph>

                      <Typography.Text
                        type="secondary"
                        className="qa-session-item__time"
                      >
                        最近活跃：{item.updatedAt}
                      </Typography.Text>
                    </div>
                  </div>

                  <div
                    className="qa-session-item__actions"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Popconfirm
                      title="确认删除该会话吗？"
                      description="删除后聊天记录将无法恢复。"
                      onConfirm={() => onDelete(item.sessionId)}
                    >
                      <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                </List.Item>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
