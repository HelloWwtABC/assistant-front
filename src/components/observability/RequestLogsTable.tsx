import { Button, Table, Tag, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';

import {
  REQUEST_STATUS_META,
  TOOL_CALL_FLAG_META,
  type RequestLogItem,
} from '@/types/observability';

interface RequestLogsTableProps {
  dataSource: RequestLogItem[];
  loading?: boolean;
  pagination: TablePaginationConfig;
  onPageChange: (page: number, pageSize: number) => void;
  onViewDetail: (requestId: string) => void;
}

export function RequestLogsTable({
  dataSource,
  loading = false,
  pagination,
  onPageChange,
  onViewDetail,
}: RequestLogsTableProps) {
  const columns: ColumnsType<RequestLogItem> = [
    {
      title: '请求 ID',
      dataIndex: 'requestId',
      width: 150,
      ellipsis: true,
      render: (value: string) => <Typography.Text code>{value}</Typography.Text>,
    },
    {
      title: '会话 ID',
      dataIndex: 'sessionId',
      width: 150,
      ellipsis: true,
    },
    {
      title: '问题摘要',
      dataIndex: 'questionSummary',
      ellipsis: true,
      render: (value: string) => (
        <Typography.Text className="observability-table__summary" title={value}>
          {value}
        </Typography.Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (value: RequestLogItem['status']) => (
        <Tag color={REQUEST_STATUS_META[value].color}>
          {REQUEST_STATUS_META[value].text}
        </Tag>
      ),
    },
    {
      title: '响应耗时',
      dataIndex: 'latencyMs',
      width: 110,
      render: (value: number) => `${value} ms`,
    },
    {
      title: '命中片段数',
      dataIndex: 'hitChunkCount',
      width: 110,
    },
    {
      title: '引用数',
      dataIndex: 'citationCount',
      width: 90,
    },
    {
      title: '是否调用工具',
      dataIndex: 'usedTool',
      width: 120,
      render: (value: RequestLogItem['usedTool']) => (
        <Tag color={TOOL_CALL_FLAG_META[value].color}>
          {TOOL_CALL_FLAG_META[value].text}
        </Tag>
      ),
    },
    {
      title: '请求时间',
      dataIndex: 'createdAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 110,
      render: (_, record) => (
        <Button type="link" onClick={() => onViewDetail(record.requestId)}>
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <Table<RequestLogItem>
      rowKey="requestId"
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      scroll={{ x: 1450 }}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条请求日志`,
        onChange: onPageChange,
      }}
      locale={{
        emptyText: '暂无请求日志',
      }}
    />
  );
}
