import { ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Space, Tag, message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';

import { observabilityApi } from '@/api/modules/observability';
import { PageContainer } from '@/components/common/PageContainer';
import { EvaluationPanel } from '@/components/observability/EvaluationPanel';
import { MetricsOverview } from '@/components/observability/MetricsOverview';
import { RequestDetailDrawer } from '@/components/observability/RequestDetailDrawer';
import { RequestLogsTable } from '@/components/observability/RequestLogsTable';
import { PageStatus } from '@/components/status/PageStatus';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type {
  EvaluationSummary,
  ObservabilityMetrics,
  RequestLogDetail,
  RequestLogItem,
  RequestLogListResponse,
  RequestLogQuery,
  RequestStatus,
  RetrievalQualitySummary,
  ToolCallFlag,
} from '@/types/observability';
import {
  REQUEST_STATUS_OPTIONS,
  TOOL_CALL_FILTER_OPTIONS,
} from '@/types/observability';

const { RangePicker } = DatePicker;

interface LogFilterValues {
  keyword?: string;
  status?: RequestStatus;
  usedTool?: ToolCallFlag;
  requestRange?: [Dayjs, Dayjs];
}

const defaultQuery: RequestLogQuery = {
  keyword: '',
  status: undefined,
  usedTool: undefined,
  startDate: undefined,
  endDate: undefined,
  page: 1,
  pageSize: 10,
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '系统观测数据加载失败，请稍后重试';
}

export function ObservabilityPage() {
  const [form] = Form.useForm<LogFilterValues>();
  const [metrics, setMetrics] = useState<ObservabilityMetrics | null>(null);
  const [evaluationSummary, setEvaluationSummary] = useState<EvaluationSummary | null>(null);
  const [retrievalQualitySummary, setRetrievalQualitySummary] =
    useState<RetrievalQualitySummary | null>(null);
  const [query, setQuery] = useState<RequestLogQuery>(defaultQuery);
  const [logs, setLogs] = useState<RequestLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | false>(false);
  const [logsError, setLogsError] = useState<string | false>(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | false>(false);
  const [detail, setDetail] = useState<RequestLogDetail | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  useDocumentTitle('系统观测与评测');

  const loadOverview = async () => {
    setOverviewLoading(true);
    setOverviewError(false);

    try {
      const [metricsResult, evaluationResult, retrievalResult] = await Promise.all([
        observabilityApi.getObservabilityMetrics(),
        observabilityApi.getEvaluationSummary(),
        observabilityApi.getRetrievalQualitySummary(),
      ]);

      setMetrics(metricsResult);
      setEvaluationSummary(evaluationResult);
      setRetrievalQualitySummary(retrievalResult);
    } catch (error) {
      setOverviewError(getErrorMessage(error));
    } finally {
      setOverviewLoading(false);
    }
  };

  const applyLogsResult = (
    result: RequestLogListResponse,
    appliedQuery: RequestLogQuery,
  ) => {
    setLogs(result.list);
    setTotal(result.total);
    setQuery(appliedQuery);
  };

  const loadLogs = async (nextQuery = query) => {
    setLogsLoading(true);
    setLogsError(false);

    try {
      let appliedQuery = nextQuery;
      let result = await observabilityApi.getRequestLogs(appliedQuery);

      while (appliedQuery.page > 1 && result.list.length === 0 && result.total > 0) {
        appliedQuery = {
          ...appliedQuery,
          page: appliedQuery.page - 1,
        };
        result = await observabilityApi.getRequestLogs(appliedQuery);
      }

      applyLogsResult(result, appliedQuery);
    } catch (error) {
      setLogsError(getErrorMessage(error));
    } finally {
      setLogsLoading(false);
    }
  };

  const loadDetail = async (requestId: string) => {
    setDetailLoading(true);
    setDetailError(false);

    try {
      const result = await observabilityApi.getRequestLogDetail(requestId);

      setDetail(result);
    } catch (error) {
      setDetail(null);
      setDetailError(getErrorMessage(error));
      message.error(getErrorMessage(error));
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
    void loadLogs(defaultQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (values: LogFilterValues) => {
    await loadLogs({
      ...query,
      keyword: values.keyword?.trim() ?? '',
      status: values.status,
      usedTool: values.usedTool,
      startDate: values.requestRange?.[0]
        ? dayjs(values.requestRange[0]).format('YYYY-MM-DD')
        : undefined,
      endDate: values.requestRange?.[1]
        ? dayjs(values.requestRange[1]).format('YYYY-MM-DD')
        : undefined,
      page: 1,
    });
  };

  const handleReset = async () => {
    form.resetFields();
    await loadLogs(defaultQuery);
  };

  const handleRefreshLogs = async () => {
    await loadLogs(query);
    message.success('请求日志已刷新');
  };

  const handleViewDetail = async (requestId: string) => {
    setActiveRequestId(requestId);
    setDetailOpen(true);
    await loadDetail(requestId);
  };

  useEffect(() => {
    form.setFieldsValue({
      keyword: query.keyword,
      status: query.status,
      usedTool: query.usedTool,
      requestRange:
        query.startDate && query.endDate
          ? [dayjs(query.startDate), dayjs(query.endDate)]
          : undefined,
    });
  }, [form, query.endDate, query.keyword, query.startDate, query.status, query.usedTool]);

  const overviewReady = metrics && evaluationSummary && retrievalQualitySummary;

  return (
    <PageContainer
      title="系统观测与评测"
      description="用于查看问答系统运行指标、评测质量和最近请求日志，支持快速定位引用与工具链路表现"
      extra={<Tag color="processing">Mock Data</Tag>}
    >
      <PageStatus
          loading={overviewLoading}
          error={overviewError}
          empty={!overviewReady}
        emptyDescription="当前未获取到系统概览数据"
        onRetry={() => void loadOverview()}
      >
        {overviewReady ? (
          <>
            <MetricsOverview metrics={metrics} />
            <EvaluationPanel
              evaluationSummary={evaluationSummary}
              retrievalQualitySummary={retrievalQualitySummary}
            />
          </>
        ) : null}
      </PageStatus>

      <Card title="请求日志">
        <Form<LogFilterValues>
          form={form}
          layout="vertical"
          initialValues={{
            keyword: query.keyword,
            status: query.status,
            usedTool: query.usedTool,
            requestRange:
              query.startDate && query.endDate
                ? [dayjs(query.startDate), dayjs(query.endDate)]
                : undefined,
          }}
          onFinish={(values) => void handleSearch(values)}
          className="observability-filter"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} xl={6}>
              <Form.Item label="关键词搜索" name="keyword">
                <Input allowClear placeholder="请输入请求 ID 或问题摘要" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={4}>
              <Form.Item label="请求状态" name="status">
                <Select allowClear placeholder="请选择状态" options={REQUEST_STATUS_OPTIONS} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={4}>
              <Form.Item label="是否调用工具" name="usedTool">
                <Select allowClear placeholder="请选择" options={TOOL_CALL_FILTER_OPTIONS} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={6}>
              <Form.Item label="请求时间范围" name="requestRange">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={24} xl={4}>
              <Form.Item label=" ">
                <Space wrap>
                  <Button type="primary" htmlType="submit" loading={logsLoading}>
                    查询
                  </Button>
                  <Button onClick={() => void handleReset()}>重置</Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => void handleRefreshLogs()}
                    loading={logsLoading}
                  >
                    刷新
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <PageStatus error={logsError} onRetry={() => void loadLogs(query)}>
          <RequestLogsTable
            dataSource={logs}
            loading={logsLoading}
            pagination={{
              current: query.page,
              pageSize: query.pageSize,
              total,
            }}
            onPageChange={(page, pageSize) =>
              void loadLogs({
                ...query,
                page,
                pageSize,
              })
            }
            onViewDetail={(requestId) => void handleViewDetail(requestId)}
          />
        </PageStatus>
      </Card>

      <RequestDetailDrawer
        open={detailOpen}
        loading={detailLoading}
        detail={detail}
        error={detailError}
        onClose={() => setDetailOpen(false)}
        onRetry={() => {
          if (activeRequestId) {
            void loadDetail(activeRequestId);
          }
        }}
      />
    </PageContainer>
  );
}
