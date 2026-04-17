import { Card, Col, List, Row, Space, Tag, Typography } from 'antd';

import { PageContainer } from '@/components/common/PageContainer';
import { PageStatus } from '@/components/status/PageStatus';

const overviewCards = [
  {
    title: '知识文档总量',
    value: '128',
    trend: '近 7 日新增 12 份文档',
  },
  {
    title: 'RAG 问答次数',
    value: '2,486',
    trend: '近 24 小时响应整体稳定',
  },
  {
    title: '工具调用任务',
    value: '64',
    trend: '成功率 98.4%',
  },
  {
    title: '待处理观测告警',
    value: '3',
    trend: '建议优先关注引用覆盖率波动',
  },
];

const recentModules = [
  '知识库文档管理已支持筛选、上传、删除、详情查看与 Mock 数据增删联动',
  'RAG 智能问答已支持会话管理、多轮消息流、引用来源展示与上下文清空',
  '工具调用中心已支持工单查询、工单创建、服务健康查询与最近调用记录追踪',
  '会话记录与系统观测页已补齐筛选、详情抽屉、评测信息和日志审查能力',
];

export function DashboardPage() {
  return (
    <PageContainer
      title="工作台首页"
      description="用于概览当前平台运行状态、核心模块交付情况，以及知识问答与工具调用的演示入口"
      extra={<Tag color="processing">Demo Ready</Tag>}
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
            <Card title="当前交付进展">
              <List
                dataSource={recentModules}
                renderItem={(item) => <List.Item>{item}</List.Item>}
              />
            </Card>
          </Col>

          <Col xs={24} xl={10}>
            <Card title="项目能力概览">
              <Space direction="vertical" size="middle">
                <Typography.Text className="placeholder-note">
                  当前版本已经完成后台基础工程、五个业务模块页面、统一请求封装、
                  Mock 数据层、详情抽屉与分页筛选能力，已具备完整演示链路。
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
