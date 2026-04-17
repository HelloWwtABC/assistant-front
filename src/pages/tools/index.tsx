import { Card, Col, Row, Tag, message } from 'antd';
import { useEffect, useState } from 'react';

import { toolsApi } from '@/api/modules/tools';
import { PageContainer } from '@/components/common/PageContainer';
import { PageStatus } from '@/components/status/PageStatus';
import { CreateTicketTool } from '@/components/tools/CreateTicketTool';
import { ServiceHealthTool } from '@/components/tools/ServiceHealthTool';
import { TicketStatusTool } from '@/components/tools/TicketStatusTool';
import { ToolCallRecordsTable } from '@/components/tools/ToolCallRecordsTable';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type {
  CreateTicketRequest,
  ServiceHealthQueryRequest,
  TicketStatusQueryRequest,
  ToolCallRecordItem,
  ToolCallRecordQuery,
} from '@/types/tools';

const defaultRecordQuery: ToolCallRecordQuery = {
  page: 1,
  pageSize: 8,
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '工具调用记录加载失败，请稍后重试';
}

export function ToolCenterPage() {
  const [recordQuery, setRecordQuery] = useState<ToolCallRecordQuery>(defaultRecordQuery);
  const [records, setRecords] = useState<ToolCallRecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState<string | false>(false);

  useDocumentTitle('工具调用中心');

  const loadRecords = async (nextQuery = recordQuery) => {
    setRecordsLoading(true);
    setRecordsError(false);

    try {
      let appliedQuery = nextQuery;
      let result = await toolsApi.getToolCallRecords(appliedQuery);

      while (appliedQuery.page > 1 && result.list.length === 0 && result.total > 0) {
        appliedQuery = {
          ...appliedQuery,
          page: appliedQuery.page - 1,
        };
        result = await toolsApi.getToolCallRecords(appliedQuery);
      }

      setRecords(result.list);
      setTotal(result.total);
      setRecordQuery(appliedQuery);
    } catch (loadError) {
      setRecordsError(getErrorMessage(loadError));
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    void loadRecords(defaultRecordQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefreshRecords = async () => {
    await loadRecords({
      ...recordQuery,
      page: 1,
    });
  };

  const handleQueryTicket = async (payload: TicketStatusQueryRequest) => {
    try {
      const result = await toolsApi.queryTicketStatus(payload);
      message.success('工单状态查询成功');

      return result;
    } catch (error) {
      message.error(getErrorMessage(error));
      throw error;
    }
  };

  const handleCreateTicket = async (payload: CreateTicketRequest) => {
    try {
      const result = await toolsApi.createTicket(payload);
      message.success('工单创建成功');

      return result;
    } catch (error) {
      message.error(getErrorMessage(error));
      throw error;
    }
  };

  const handleQueryServiceHealth = async (payload: ServiceHealthQueryRequest) => {
    try {
      const result = await toolsApi.queryServiceHealth(payload);
      message.success('服务健康状态查询成功');

      return result;
    } catch (error) {
      message.error(getErrorMessage(error));
      throw error;
    }
  };

  return (
    <PageContainer
      title="工具调用中心"
      description="用于演示工单与服务类工具调用、结果反馈以及最近调用记录追踪能力"
      extra={<Tag color="processing">Mock Mode</Tag>}
    >
      <Row gutter={[16, 16]} className="tools-grid">
        <Col xs={24} lg={12} xxl={8}>
          <TicketStatusTool
            onQuery={handleQueryTicket}
            onFinished={() => void handleRefreshRecords()}
          />
        </Col>

        <Col xs={24} lg={12} xxl={8}>
          <CreateTicketTool
            onCreate={handleCreateTicket}
            onFinished={() => void handleRefreshRecords()}
          />
        </Col>

        <Col xs={24} lg={12} xxl={8}>
          <ServiceHealthTool
            onQuery={handleQueryServiceHealth}
            onFinished={() => void handleRefreshRecords()}
          />
        </Col>
      </Row>

      <PageStatus error={recordsError} onRetry={() => void loadRecords(recordQuery)}>
        <Card title="最近工具调用记录">
          <ToolCallRecordsTable
            dataSource={records}
            loading={recordsLoading}
            pagination={{
              current: recordQuery.page,
              pageSize: recordQuery.pageSize,
              total,
            }}
            onPageChange={(page, pageSize) =>
              void loadRecords({
                ...recordQuery,
                page,
                pageSize,
              })
            }
          />
        </Card>
      </PageStatus>
    </PageContainer>
  );
}
