import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';

import {
  DOCUMENT_STATUS_META,
  type KnowledgeDocumentItem,
} from '@/types/documents';

interface DocumentTableProps {
  dataSource: KnowledgeDocumentItem[];
  loading?: boolean;
  selectedRowKeys: React.Key[];
  pagination: TablePaginationConfig;
  onSelectionChange: (selectedRowKeys: React.Key[]) => void;
  onPageChange: (page: number, pageSize: number) => void;
  onViewDetail: (documentId: string) => void;
  onDelete: (documentId: string) => void;
}

export function DocumentTable({
  dataSource,
  loading = false,
  selectedRowKeys,
  pagination,
  onSelectionChange,
  onPageChange,
  onViewDetail,
  onDelete,
}: DocumentTableProps) {
  const columns: ColumnsType<KnowledgeDocumentItem> = [
    {
      title: '文档ID',
      dataIndex: 'documentId',
      width: 160,
      ellipsis: true,
      render: (value: string) => <Typography.Text code>{value}</Typography.Text>,
    },
    {
      title: '文档名称',
      dataIndex: 'documentName',
      width: 220,
      ellipsis: true,
    },
    {
      title: '所属知识库',
      dataIndex: 'knowledgeBaseName',
      width: 140,
    },
    {
      title: '文件类型',
      dataIndex: 'fileType',
      width: 100,
      render: (value: string) => <Tag>{value.toUpperCase()}</Tag>,
    },
    {
      title: '解析状态',
      dataIndex: 'status',
      width: 120,
      render: (value: KnowledgeDocumentItem['status']) => {
        const meta = DOCUMENT_STATUS_META[value];

        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: 'chunk 数量',
      dataIndex: 'chunkCount',
      width: 110,
    },
    {
      title: '上传人',
      dataIndex: 'uploader',
      width: 110,
    },
    {
      title: '上传时间',
      dataIndex: 'uploadedAt',
      width: 180,
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
            onClick={() => onViewDetail(record.documentId)}
          >
            查看详情
          </Button>
          <Popconfirm
            title="确认删除该文档吗？"
            description="删除后将无法恢复，请谨慎操作。"
            onConfirm={() => onDelete(record.documentId)}
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
    <Table<KnowledgeDocumentItem>
      rowKey="documentId"
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      scroll={{ x: 1380 }}
      rowSelection={{
        selectedRowKeys,
        onChange: onSelectionChange,
      }}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条文档`,
        onChange: onPageChange,
      }}
      locale={{
        emptyText: '暂无文档数据',
      }}
    />
  );
}
