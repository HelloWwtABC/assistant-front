import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Space, Table, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';

import type { SessionRecordItem } from '@/types/sessions';

interface SessionTableProps {
  dataSource: SessionRecordItem[];
  loading?: boolean;
  selectedRowKeys: React.Key[];
  pagination: TablePaginationConfig;
  onSelectionChange: (selectedRowKeys: React.Key[]) => void;
  onPageChange: (page: number, pageSize: number) => void;
  onViewDetail: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

export function SessionTable({
  dataSource,
  loading = false,
  selectedRowKeys,
  pagination,
  onSelectionChange,
  onPageChange,
  onViewDetail,
  onDelete,
}: SessionTableProps) {
  const columns: ColumnsType<SessionRecordItem> = [
    {
      title: '会话 ID',
      dataIndex: 'sessionId',
      width: 170,
      ellipsis: true,
      render: (value: string) => <Typography.Text code>{value}</Typography.Text>,
    },
    {
      title: '会话标题',
      dataIndex: 'title',
      width: 220,
      ellipsis: true,
    },
    {
      title: '提问次数',
      dataIndex: 'questionCount',
      width: 110,
    },
    {
      title: '最后活跃时间',
      dataIndex: 'updatedAt',
      width: 180,
    },
    {
      title: '关联知识库',
      dataIndex: 'knowledgeBaseName',
      width: 140,
    },
    {
      title: '最近问题摘要',
      dataIndex: 'lastQuestionSnippet',
      ellipsis: true,
      render: (value: string) => (
        <Typography.Text
          className="sessions-table__snippet"
          title={value}
        >
          {value}
        </Typography.Text>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => onViewDetail(record.sessionId)}
          >
            查看详情
          </Button>
          <Popconfirm
            title="确认删除该会话吗？"
            description="删除后将无法恢复，请谨慎操作。"
            onConfirm={() => onDelete(record.sessionId)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table<SessionRecordItem>
      rowKey="sessionId"
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      scroll={{ x: 1260 }}
      rowSelection={{
        selectedRowKeys,
        onChange: onSelectionChange,
      }}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条会话`,
        onChange: onPageChange,
      }}
      locale={{
        emptyText: '暂无会话记录',
      }}
    />
  );
}
