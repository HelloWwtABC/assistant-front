import { Table, Tag } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';

import {
  TOOL_CALL_STATUS_META,
  TOOL_NAME_META,
  type ToolCallRecordItem,
} from '@/types/tools';

interface ToolCallRecordsTableProps {
  dataSource: ToolCallRecordItem[];
  loading?: boolean;
  pagination: TablePaginationConfig;
  onPageChange: (page: number, pageSize: number) => void;
}

export function ToolCallRecordsTable({
  dataSource,
  loading = false,
  pagination,
  onPageChange,
}: ToolCallRecordsTableProps) {
  const columns: ColumnsType<ToolCallRecordItem> = [
    {
      title: '调用记录ID',
      dataIndex: 'recordId',
      width: 120,
    },
    {
      title: '工具名称',
      dataIndex: 'toolName',
      width: 150,
      render: (value: ToolCallRecordItem['toolName']) => TOOL_NAME_META[value],
    },
    {
      title: '请求摘要',
      dataIndex: 'requestSummary',
      ellipsis: true,
    },
    {
      title: '调用结果',
      dataIndex: 'resultSummary',
      ellipsis: true,
    },
    {
      title: '调用状态',
      dataIndex: 'status',
      width: 110,
      render: (value: ToolCallRecordItem['status']) => (
        <Tag color={TOOL_CALL_STATUS_META[value].color}>
          {TOOL_CALL_STATUS_META[value].text}
        </Tag>
      ),
    },
    {
      title: '调用耗时',
      dataIndex: 'durationMs',
      width: 110,
      render: (value: number) => `${value} ms`,
    },
    {
      title: '调用时间',
      dataIndex: 'calledAt',
      width: 180,
    },
  ];

  return (
    <Table<ToolCallRecordItem>
      rowKey="recordId"
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条调用记录`,
        onChange: onPageChange,
      }}
      locale={{
        emptyText: '暂无调用记录',
      }}
      scroll={{ x: 1100 }}
    />
  );
}
