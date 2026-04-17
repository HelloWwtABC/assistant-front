import { Card, Col, Row } from 'antd';

import type { ObservabilityMetrics } from '@/types/observability';

interface MetricsOverviewProps {
  metrics: ObservabilityMetrics;
}

const metricItems = (metrics: ObservabilityMetrics) => [
  {
    key: 'todayRequestCount',
    label: '今日请求次数',
    value: metrics.todayRequestCount.toLocaleString(),
    trend: '较昨日整体请求量保持平稳增长',
  },
  {
    key: 'avgLatencyMs',
    label: '平均响应时间',
    value: `${metrics.avgLatencyMs} ms`,
    trend: '覆盖检索、生成与工具链路耗时',
  },
  {
    key: 'toolCallCount',
    label: '工具调用次数',
    value: metrics.toolCallCount.toLocaleString(),
    trend: '统计问答链路中的工具触发总量',
  },
  {
    key: 'errorRate',
    label: '错误率',
    value: `${(metrics.errorRate * 100).toFixed(1)}%`,
    trend: '包括失败与部分成功请求占比',
  },
  {
    key: 'avgHitChunkCount',
    label: '平均命中片段数',
    value: metrics.avgHitChunkCount.toFixed(1),
    trend: '衡量检索召回的平均覆盖深度',
  },
  {
    key: 'citationCoverage',
    label: '引用覆盖率',
    value: `${(metrics.citationCoverage * 100).toFixed(1)}%`,
    trend: '有引用支撑的回答占全部回答比例',
  },
];

export function MetricsOverview({ metrics }: MetricsOverviewProps) {
  return (
    <Row gutter={[16, 16]}>
      {metricItems(metrics).map((item) => (
        <Col key={item.key} xs={24} md={12} xl={8}>
          <Card>
            <div className="dashboard-stat">
              <span className="dashboard-stat__label">{item.label}</span>
              <span className="dashboard-stat__value">{item.value}</span>
              <span className="dashboard-stat__trend">{item.trend}</span>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
