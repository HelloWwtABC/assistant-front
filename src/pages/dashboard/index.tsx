import { Card, Col, List, Row, Space, Tag, Typography } from 'antd';

import { PageContainer } from '@/components/common/PageContainer';
import { PageStatus } from '@/components/status/PageStatus';

const overviewCards = [
  {
    title: '知识文档总量',
    value: '128',
    trend: '较昨日 +12',
  },
  {
    title: 'RAG 问答次数',
    value: '2,486',
    trend: '近 24h 响应正常',
  },
  {
    title: '工具调用任务',
    value: '64',
    trend: '成功率 98.4%',
  },
  {
    title: '待处理观测告警',
    value: '3',
    trend: '需要尽快跟进',
  },
];

const recentModules = [
  '登录态、路由守卫与后台主布局已完成初始化',
  'Axios 请求层已统一处理 token 注入与 401 跳转',
  '各业务模块已预留独立页面与 mock 对接入口',
  '后续可按模块逐步补充表格、筛选器与详情面板',
];

export function DashboardPage() {
  return (
    <PageContainer
      title="工作台首页"
      description="用于承载平台总览、待办、运行态势和后续业务模块快捷入口。"
      extra={<Tag color="processing">Base Ready</Tag>}
    >
      <PageStatus>
        <Row gutter={[16, 16]}>
          {overviewCards.map((item) => (
            <Col xs={24} md={12} xl={6} key={item.title}>
              <Card>
                <div className="dashboard-stat">
                  <span className="dashboard-stat__label">{item.title}</span>
                  <span className="dashboard-stat__value">{item.value}</span>
                  <span className="dashboard-stat__trend">{item.trend}</span>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={14}>
            <Card title="初始化进展">
              <List
                dataSource={recentModules}
                renderItem={(item) => <List.Item>{item}</List.Item>}
              />
            </Card>
          </Col>

          <Col xs={24} xl={10}>
            <Card title="当前交付范围">
              <Space direction="vertical" size="middle">
                <Typography.Text className="placeholder-note">
                  本轮先完成前端基础工程、路由骨架、全局布局、请求封装和登录态管理。
                </Typography.Text>
                <div>
                  <Tag>createBrowserRouter</Tag>
                  <Tag>Ant Design</Tag>
                  <Tag>Axios</Tag>
                  <Tag>Zustand</Tag>
                  <Tag>Mock First</Tag>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </PageStatus>
    </PageContainer>
  );
}
