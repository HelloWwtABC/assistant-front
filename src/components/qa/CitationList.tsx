import { FileSearchOutlined } from '@ant-design/icons';
import { Empty, List, Space, Tag, Typography } from 'antd';

import type { QaCitationItem } from '@/types/qa';

interface CitationListProps {
  citations: QaCitationItem[];
}

export function CitationList({ citations }: CitationListProps) {
  if (citations.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="当前回答暂无引用来源"
      />
    );
  }

  return (
    <List
      size="small"
      dataSource={citations}
      renderItem={(item) => (
        <List.Item className="qa-citation-list__item">
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Space wrap>
              <FileSearchOutlined />
              <Typography.Text strong>{item.documentName}</Typography.Text>
              <Tag>{item.documentId}</Tag>
              <Tag color="blue">Chunk #{item.chunkIndex}</Tag>
            </Space>
            <Typography.Text type="secondary">{item.snippet}</Typography.Text>
          </Space>
        </List.Item>
      )}
    />
  );
}
