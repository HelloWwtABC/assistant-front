import type {
  CreateTicketRequest,
  CreateTicketResult,
  ServiceHealthQueryRequest,
  ServiceHealthResult,
  TicketStatusQueryRequest,
  TicketStatusResult,
  ToolCallRecordItem,
  ToolCallRecordListResponse,
  ToolCallRecordQuery,
  ToolCallStatus,
  ToolName,
} from '@/types/tools';
import { sleep } from '@/utils/sleep';

const mockTickets: Record<string, TicketStatusResult> = {
  'TK-1001': {
    ticketId: 'TK-1001',
    title: '支付回调异常排查',
    status: 'processing',
    priority: 'high',
    owner: '李浩',
    updatedAt: '2026-04-04 09:12:23',
    summary: '支付回调接口在高峰期存在偶发超时，正在由支付中台与工单系统联合排查。',
  },
  'TK-1002': {
    ticketId: 'TK-1002',
    title: '知识库导入失败',
    status: 'pending',
    priority: 'medium',
    owner: '王敏',
    updatedAt: '2026-04-04 08:41:10',
    summary: '用户反馈文档导入后未生成切片，当前待知识库平台侧进一步确认文件格式。',
  },
  'TK-1003': {
    ticketId: 'TK-1003',
    title: '机器人回答偏差修复',
    status: 'resolved',
    priority: 'urgent',
    owner: '陈雪',
    updatedAt: '2026-04-03 18:05:02',
    summary: '错误召回链路已修复，答案偏差问题已回归验证通过。',
  },
};

const mockServices: Record<string, ServiceHealthResult> = {
  'rag-gateway': {
    serviceName: 'rag-gateway',
    healthStatus: 'healthy',
    instanceCount: 6,
    averageResponseTime: 86,
    checkedAt: '2026-04-04 09:28:11',
    remark: '入口服务运行正常，近 30 分钟错误率低于 0.1%。',
  },
  'ticket-worker': {
    serviceName: 'ticket-worker',
    healthStatus: 'warning',
    instanceCount: 3,
    averageResponseTime: 212,
    checkedAt: '2026-04-04 09:27:48',
    remark: '存在队列堆积，平均响应时间升高，建议关注异步消费速率。',
  },
  'vector-indexer': {
    serviceName: 'vector-indexer',
    healthStatus: 'critical',
    instanceCount: 2,
    averageResponseTime: 480,
    checkedAt: '2026-04-04 09:26:32',
    remark: '向量化链路异常，部分任务重试失败，需要尽快处理。',
  },
};

let recordSeed = 6;
let ticketSeed = 1004;

let mockToolCallRecords: ToolCallRecordItem[] = [
  {
    recordId: 'CALL-0001',
    toolName: 'ticket_status',
    requestSummary: '工单ID: TK-1001',
    resultSummary: '工单处理中，负责人李浩',
    status: 'success',
    durationMs: 286,
    calledAt: '2026-04-04 09:15:20',
  },
  {
    recordId: 'CALL-0002',
    toolName: 'service_health',
    requestSummary: '服务: rag-gateway',
    resultSummary: '服务状态正常，6 个实例在线',
    status: 'success',
    durationMs: 198,
    calledAt: '2026-04-04 09:17:04',
  },
  {
    recordId: 'CALL-0003',
    toolName: 'create_ticket',
    requestSummary: '标题: 向量索引重试失败',
    resultSummary: '工单创建成功，编号 TK-0999',
    status: 'success',
    durationMs: 332,
    calledAt: '2026-04-04 09:18:55',
  },
  {
    recordId: 'CALL-0004',
    toolName: 'ticket_status',
    requestSummary: '工单ID: TK-9999',
    resultSummary: '未找到对应工单',
    status: 'failed',
    durationMs: 214,
    calledAt: '2026-04-04 09:19:26',
  },
  {
    recordId: 'CALL-0005',
    toolName: 'service_health',
    requestSummary: '服务: unknown-service',
    resultSummary: '未找到对应服务',
    status: 'failed',
    durationMs: 176,
    calledAt: '2026-04-04 09:20:41',
  },
];

function createRecord(
  toolName: ToolName,
  requestSummary: string,
  resultSummary: string,
  status: ToolCallStatus,
  durationMs: number,
) {
  recordSeed += 1;

  const record: ToolCallRecordItem = {
    recordId: `CALL-${String(recordSeed).padStart(4, '0')}`,
    toolName,
    requestSummary,
    resultSummary,
    status,
    durationMs,
    calledAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  };

  mockToolCallRecords = [record, ...mockToolCallRecords];
}

export async function mockQueryTicketStatus(
  payload: TicketStatusQueryRequest,
): Promise<TicketStatusResult> {
  const durationMs = 180 + Math.floor(Math.random() * 120);
  await sleep(durationMs);

  const ticketId = payload.ticketId.trim().toUpperCase();
  const requestSummary = `工单ID: ${ticketId}`;
  const matchedTicket = mockTickets[ticketId];

  if (!matchedTicket) {
    createRecord('ticket_status', requestSummary, '未找到对应工单', 'failed', durationMs);
    throw new Error('未找到对应工单，请检查工单 ID 是否正确');
  }

  createRecord(
    'ticket_status',
    requestSummary,
    `工单${matchedTicket.status === 'processing' ? '处理中' : '查询成功'}`,
    'success',
    durationMs,
  );

  return matchedTicket;
}

export async function mockCreateTicket(
  payload: CreateTicketRequest,
): Promise<CreateTicketResult> {
  const durationMs = 260 + Math.floor(Math.random() * 140);
  await sleep(durationMs);

  const ticketId = `TK-${ticketSeed}`;
  ticketSeed += 1;

  const result: CreateTicketResult = {
    ticketId,
    createStatus: 'created',
    submittedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    assignee: '默认值班组',
    processStatus: 'pending',
  };

  mockTickets[ticketId] = {
    ticketId,
    title: payload.title.trim(),
    status: 'pending',
    priority: payload.priority,
    owner: result.assignee,
    updatedAt: result.submittedAt,
    summary: payload.description.trim(),
  };

  createRecord(
    'create_ticket',
    `标题: ${payload.title.trim()}`,
    `工单创建成功，编号 ${ticketId}`,
    'success',
    durationMs,
  );

  return result;
}

export async function mockQueryServiceHealth(
  payload: ServiceHealthQueryRequest,
): Promise<ServiceHealthResult> {
  const durationMs = 160 + Math.floor(Math.random() * 110);
  await sleep(durationMs);

  const serviceName = payload.serviceName.trim().toLowerCase();
  const requestSummary = `服务: ${serviceName}`;
  const matchedService = mockServices[serviceName];

  if (!matchedService) {
    createRecord('service_health', requestSummary, '未找到对应服务', 'failed', durationMs);
    throw new Error('未找到对应服务，请输入有效的服务名称');
  }

  createRecord(
    'service_health',
    requestSummary,
    `服务状态${matchedService.healthStatus === 'healthy' ? '正常' : '已返回健康结果'}`,
    'success',
    durationMs,
  );

  return matchedService;
}

export async function mockGetToolCallRecords(
  query: ToolCallRecordQuery,
): Promise<ToolCallRecordListResponse> {
  await sleep(240);

  const page = Math.max(query.page, 1);
  const pageSize = Math.max(query.pageSize, 1);
  const start = (page - 1) * pageSize;
  const list = mockToolCallRecords.slice(start, start + pageSize);

  return {
    list,
    total: mockToolCallRecords.length,
    page,
    pageSize,
  };
}
