import { Card, Col, List, Progress, Row, Space, Statistic, Tag, Typography } from 'antd';

import type {
  EvaluationSummary,
  RetrievalQualitySummary,
} from '@/types/observability';

interface EvaluationPanelProps {
  evaluationSummary: EvaluationSummary;
  retrievalQualitySummary: RetrievalQualitySummary;
}

export function EvaluationPanel({
  evaluationSummary,
  retrievalQualitySummary,
}: EvaluationPanelProps) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={12}>
        <Card title="问答评测概览">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic title="今日有效回答数" value={evaluationSummary.effectiveAnswerCount} />
            </Col>
            <Col span={12}>
              <Statistic title="平均人工评分" value={evaluationSummary.avgScore} precision={1} suffix="/ 5" />
            </Col>
            <Col span={12}>
              <Statistic title="正向反馈数" value={evaluationSummary.positiveFeedbackCount} />
            </Col>
            <Col span={12}>
              <Statistic title="负向反馈数" value={evaluationSummary.negativeFeedbackCount} />
            </Col>
          </Row>

          <div className="observability-panel__section">
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Typography.Text type="secondary">是否有帮助占比</Typography.Text>
              <Progress percent={Number((evaluationSummary.helpfulRate * 100).toFixed(1))} strokeColor="#1677ff" />
            </Space>
          </div>
        </Card>
      </Col>

      <Col xs={24} xl={12}>
        <Card title="引用与召回质量概览">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic title="平均命中 chunk 数" value={retrievalQualitySummary.avgHitChunks} precision={1} />
            </Col>
            <Col span={12}>
              <Statistic title="平均引用数" value={retrievalQualitySummary.avgCitationCount} precision={1} />
            </Col>
          </Row>

          <div className="observability-panel__section">
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div>
                <Typography.Text type="secondary">高质量回答占比</Typography.Text>
                <Progress
                  percent={Number((retrievalQualitySummary.highQualityRate * 100).toFixed(1))}
                  strokeColor="#16a34a"
                />
              </div>

              <div>
                <Typography.Text type="secondary">低质量回答占比</Typography.Text>
                <Progress
                  percent={Number((retrievalQualitySummary.lowQualityRate * 100).toFixed(1))}
                  strokeColor="#ef4444"
                />
              </div>
            </Space>
          </div>

          <div className="observability-panel__section">
            <Typography.Text type="secondary">常见问题类型统计</Typography.Text>
            <List
              size="small"
              dataSource={retrievalQualitySummary.commonQuestionCategories}
              renderItem={(item) => (
                <List.Item>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Typography.Text>{item.category}</Typography.Text>
                    <Tag color="blue">{item.count}</Tag>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        </Card>
      </Col>
    </Row>
  );
}
