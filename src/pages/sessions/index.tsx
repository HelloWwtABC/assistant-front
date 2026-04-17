import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Popconfirm, Space, Statistic, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { sessionsApi } from '@/api/modules/sessions';
import { PageContainer } from '@/components/common/PageContainer';
import {
  SessionFilter,
  type SessionFilterValues,
} from '@/components/sessions/SessionFilter';
import { SessionDetailDrawer } from '@/components/sessions/SessionDetailDrawer';
import { SessionTable } from '@/components/sessions/SessionTable';
import { PageStatus } from '@/components/status/PageStatus';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type {
  SessionDetail,
  SessionKnowledgeBaseItem,
  SessionRecordItem,
  SessionRecordListResponse,
  SessionRecordQuery,
} from '@/types/sessions';

const defaultQuery: SessionRecordQuery = {
  keyword: '',
  knowledgeBaseId: undefined,
  startDate: undefined,
  endDate: undefined,
  page: 1,
  pageSize: 10,
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '会话记录加载失败，请稍后重试';
}

export function SessionRecordsPage() {
  const [query, setQuery] = useState<SessionRecordQuery>(defaultQuery);
  const [sessions, setSessions] = useState<SessionRecordItem[]>([]);
  const [knowledgeBaseOptions, setKnowledgeBaseOptions] = useState<
    SessionKnowledgeBaseItem[]
  >([]);
  const [total, setTotal] = useState(0);
  const [todayActiveCount, setTodayActiveCount] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | false>(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | false>(false);
  const [currentDetail, setCurrentDetail] = useState<SessionDetail | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useDocumentTitle('会话记录');

  const applyListResult = (
    result: SessionRecordListResponse,
    appliedQuery: SessionRecordQuery,
  ) => {
    setSessions(result.list);
    setTotal(result.total);
    setKnowledgeBaseOptions(result.knowledgeBaseOptions);
    setTodayActiveCount(result.todayActiveCount);
    setQuery(appliedQuery);
  };

  const fetchSessions = async (nextQuery = query) => {
    setLoading(true);
    setError(false);

    try {
      let appliedQuery = nextQuery;
      let result = await sessionsApi.getSessions(appliedQuery);

      while (appliedQuery.page > 1 && result.list.length === 0 && result.total > 0) {
        appliedQuery = {
          ...appliedQuery,
          page: appliedQuery.page - 1,
        };
        result = await sessionsApi.getSessions(appliedQuery);
      }

      applyListResult(result, appliedQuery);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError));
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (sessionId: string) => {
    setDetailLoading(true);
    setDetailError(false);

    try {
      const result = await sessionsApi.getSessionDetail(sessionId);

      setCurrentDetail(result);
    } catch (detailFetchError) {
      setCurrentDetail(null);
      setDetailError(getErrorMessage(detailFetchError));
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    void fetchSessions(defaultQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (values: SessionFilterValues) => {
    setSelectedRowKeys([]);

    await fetchSessions({
      ...query,
      keyword: values.keyword?.trim() ?? '',
      knowledgeBaseId: values.knowledgeBaseId,
      startDate: values.activeRange?.[0]
        ? dayjs(values.activeRange[0]).format('YYYY-MM-DD')
        : undefined,
      endDate: values.activeRange?.[1]
        ? dayjs(values.activeRange[1]).format('YYYY-MM-DD')
        : undefined,
      page: 1,
    });
  };

  const handleReset = async () => {
    setSelectedRowKeys([]);
    await fetchSessions(defaultQuery);
  };

  const handleRefresh = async () => {
    await fetchSessions(query);
  };

  const handleViewDetail = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    setDetailOpen(true);
    await fetchDetail(sessionId);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setDetailError(false);
  };

  const handleDelete = async (sessionId: string) => {
    setDeleteLoading(true);

    try {
      await sessionsApi.deleteSession(sessionId);
      message.success('会话删除成功');
      setSelectedRowKeys((currentKeys) => currentKeys.filter((key) => key !== sessionId));

      if (activeSessionId === sessionId) {
        setDetailOpen(false);
        setCurrentDetail(null);
        setActiveSessionId(null);
      }

      await fetchSessions(query);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    setDeleteLoading(true);

    try {
      await sessionsApi.batchDeleteSessions(selectedRowKeys as string[]);
      message.success('批量删除成功');

      if (
        activeSessionId &&
        (selectedRowKeys as string[]).includes(activeSessionId)
      ) {
        setDetailOpen(false);
        setCurrentDetail(null);
        setActiveSessionId(null);
      }

      setSelectedRowKeys([]);
      await fetchSessions(query);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filterValues: SessionFilterValues = {
    keyword: query.keyword,
    knowledgeBaseId: query.knowledgeBaseId,
    activeRange:
      query.startDate && query.endDate
        ? [dayjs(query.startDate), dayjs(query.endDate)]
        : undefined,
  };

  return (
    <PageContainer
      title="会话记录"
      description="用于查看知识问答会话记录、筛选活跃会话、审阅消息历史并执行会话清理操作"
      extra={<Tag color="processing">Mock Data</Tag>}
    >
      <Card>
        <SessionFilter
          loading={loading}
          values={filterValues}
          knowledgeBaseOptions={knowledgeBaseOptions}
          onSearch={(values) => void handleSearch(values)}
          onReset={() => void handleReset()}
        />
      </Card>

      <Card>
        <div className="document-toolbar">
          <Space wrap>
            <Popconfirm
              title="确认批量删除已选会话吗？"
              description="删除后将无法恢复，请谨慎操作。"
              onConfirm={() => void handleBatchDelete()}
              disabled={selectedRowKeys.length === 0}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedRowKeys.length === 0}
                loading={deleteLoading}
              >
                批量删除
              </Button>
            </Popconfirm>

            <Button
              icon={<ReloadOutlined />}
              onClick={() => void handleRefresh()}
              loading={loading}
            >
              刷新
            </Button>
          </Space>

          <div className="document-toolbar__summary">
            <Typography.Text type="secondary">
              已选 {selectedRowKeys.length} 项
            </Typography.Text>
            <Statistic title="会话总数" value={total} />
            <Statistic title="今日活跃会话数" value={todayActiveCount} />
          </div>
        </div>
      </Card>

      <PageStatus error={error} onRetry={() => void handleRefresh()}>
        <Card>
          <SessionTable
            dataSource={sessions}
            loading={loading || deleteLoading}
            selectedRowKeys={selectedRowKeys}
            pagination={{
              current: query.page,
              pageSize: query.pageSize,
              total,
            }}
            onSelectionChange={setSelectedRowKeys}
            onPageChange={(page, pageSize) =>
              void fetchSessions({
                ...query,
                page,
                pageSize,
              })
            }
            onViewDetail={(sessionId) => void handleViewDetail(sessionId)}
            onDelete={(sessionId) => void handleDelete(sessionId)}
          />
        </Card>
      </PageStatus>

      <SessionDetailDrawer
        open={detailOpen}
        loading={detailLoading}
        detail={currentDetail}
        error={detailError}
        onClose={handleCloseDetail}
        onRetry={() => {
          if (activeSessionId) {
            void fetchDetail(activeSessionId);
          }
        }}
      />
    </PageContainer>
  );
}
