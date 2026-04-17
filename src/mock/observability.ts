import type {
  EvaluationSummary,
  ObservabilityMetrics,
  RequestCitationItem,
  RequestLogDetail,
  RequestLogListResponse,
  RequestLogQuery,
  RequestToolCallItem,
  RetrievalQualitySummary,
} from '@/types/observability';
import { sleep } from '@/utils/sleep';

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function createTimestamp(day: number, hour: number, minute: number) {
  return formatDate(new Date(2026, 3, day, hour, minute, 0));
}

function toTimeValue(value: string) {
  return new Date(value.replace(/-/g, '/')).getTime();
}

function createCitation(
  documentId: string,
  documentName: string,
  chunkIndex: number,
  snippet: string,
): RequestCitationItem {
  return {
    documentId,
    documentName,
    chunkIndex,
    snippet,
  };
}

function createToolCall(
  toolName: string,
  inputSummary: string,
  outputSummary: string,
  status: RequestToolCallItem['status'],
  durationMs: number,
): RequestToolCallItem {
  return {
    toolName,
    inputSummary,
    outputSummary,
    status,
    durationMs,
  };
}

function createRequestDetail(config: Omit<RequestLogDetail, 'questionSummary' | 'citationCount'>) {
  return {
    ...config,
    questionSummary:
      config.question.length > 64 ? `${config.question.slice(0, 64)}...` : config.question,
    citationCount: config.citations.length,
  };
}

const mockMetrics: ObservabilityMetrics = {
  todayRequestCount: 1286,
  avgLatencyMs: 842,
  toolCallCount: 173,
  errorRate: 0.062,
  avgHitChunkCount: 4.8,
  citationCoverage: 0.783,
};

const mockEvaluationSummary: EvaluationSummary = {
  effectiveAnswerCount: 962,
  positiveFeedbackCount: 318,
  negativeFeedbackCount: 57,
  avgScore: 4.3,
  helpfulRate: 0.847,
};

const mockRetrievalQualitySummary: RetrievalQualitySummary = {
  avgHitChunks: 4.8,
  avgCitationCount: 2.6,
  highQualityRate: 0.713,
  lowQualityRate: 0.096,
  commonQuestionCategories: [
    { category: '退款与售后', count: 126 },
    { category: '权限与配置', count: 98 },
    { category: '上线与回滚', count: 84 },
    { category: '工单状态查询', count: 77 },
    { category: '知识库维护', count: 63 },
  ],
};

const mockRequestStore: RequestLogDetail[] = [
  createRequestDetail({
    requestId: 'REQ-20260404-001',
    sessionId: 'SESS-202604-001',
    modelName: 'gpt-4.1-mini',
    status: 'success',
    latencyMs: 768,
    hitChunkCount: 5,
    usedTool: 'no',
    createdAt: createTimestamp(4, 9, 30),
    question: '客户要求部分退款，但工单已经进入财务复核阶段，客服应该如何说明处理路径？',
    answer:
      '建议先说明退款申请已进入财务复核阶段，当前需要补充审批备注并升级到退款专员队列，客服侧同步给出预计反馈时间。',
    citations: [
      createCitation(
        'DOC-202604-002',
        '退款流程说明.docx',
        2,
        '财务复核中的退款工单需补齐审批备注，并升级到退款专员队列。',
      ),
      createCitation(
        'DOC-202604-008',
        '高频异常工单处理手册.pdf',
        4,
        '涉及用户升级诉求时，需要同步预计反馈时间并记录影响范围。',
      ),
    ],
    toolCalls: [],
    evaluation: {
      userScore: 5,
      helpful: true,
      remark: '回答可直接给一线客服参考。',
      qualityLevel: 'high',
    },
  }),
  createRequestDetail({
    requestId: 'REQ-20260404-002',
    sessionId: 'SESS-202604-002',
    modelName: 'gpt-4.1-mini',
    status: 'success',
    latencyMs: 911,
    hitChunkCount: 6,
    usedTool: 'no',
    createdAt: createTimestamp(4, 10, 8),
    question: '新导入的知识库标签该如何命名，一级标签和二级标签的规范分别是什么？',
    answer:
      '一级标签建议按业务域命名，二级标签聚焦具体场景和动作，新增前先检查现有标签集合，避免近义词重复。',
    citations: [
      createCitation(
        'DOC-202604-006',
        '知识库标签规范.pdf',
        1,
        '标签命名遵循业务域、场景、动作的层级规则。',
      ),
      createCitation(
        'DOC-202604-006',
        '知识库标签规范.pdf',
        4,
        '新增标签前应检查既有标签集合，保证命名一致性。',
      ),
    ],
    toolCalls: [],
    evaluation: {
      userScore: 4,
      helpful: true,
      qualityLevel: 'high',
    },
  }),
  createRequestDetail({
    requestId: 'REQ-20260404-003',
    sessionId: 'SESS-202604-003',
    modelName: 'gpt-4.1-mini',
    status: 'partial_success',
    latencyMs: 1234,
    hitChunkCount: 3,
    usedTool: 'yes',
    createdAt: createTimestamp(4, 10, 40),
    question: '机器人连续两次未命中之后是否必须转人工，同时想确认当前值班队列是否饱和。',
    answer:
      '默认策略是在连续两次未命中后提示转人工，并保留一次补充检索机会。本次工具查询未返回完整队列负载，因此人工接入时建议先按标准话术说明。',
    citations: [
      createCitation(
        'DOC-202604-001',
        '客服机器人接待规范.pdf',
        3,
        '机器人连续两次未命中后，应主动提示转人工并保留一次补充检索机会。',
      ),
    ],
    toolCalls: [
      createToolCall(
        '查询服务健康状态',
        '服务名称：queue-scheduler',
        '返回部分成功，当前仅获取到实例数量，未返回负载详情。',
        'failed',
        386,
      ),
    ],
    evaluation: {
      userScore: 3,
      helpful: true,
      remark: '规则说明清楚，但队列信息不完整。',
      qualityLevel: 'medium',
    },
  }),
  createRequestDetail({
    requestId: 'REQ-20260404-004',
    sessionId: 'SESS-202604-004',
    modelName: 'gpt-4.1-mini',
    status: 'success',
    latencyMs: 864,
    hitChunkCount: 4,
    usedTool: 'no',
    createdAt: createTimestamp(4, 11, 5),
    question: '权限中心的角色继承最多支持几级嵌套，超过限制时系统会如何处理？',
    answer:
      '当前文档说明最多支持三级角色继承，若继续增加层级，系统会在保存时触发校验并阻止提交。',
    citations: [
      createCitation(
        'DOC-202604-009',
        '权限中心配置说明.txt',
        2,
        '角色继承开启后最多支持三级嵌套，并需进行循环依赖校验。',
      ),
    ],
    toolCalls: [],
    evaluation: {
      userScore: 4,
      helpful: true,
      qualityLevel: 'high',
    },
  }),
  createRequestDetail({
    requestId: 'REQ-20260404-005',
    sessionId: 'SESS-202604-005',
    modelName: 'gpt-4.1-mini',
    status: 'success',
    latencyMs: 702,
    hitChunkCount: 4,
    usedTool: 'yes',
    createdAt: createTimestamp(4, 11, 26),
    question: '支付回调异常工单需要多久首响，能不能顺便查一下 TK-1002 当前状态？',
    answer:
      '高频异常工单建议 10 分钟内首响、30 分钟内给出排查路径。附加工具查询显示 TK-1002 当前处于处理中状态，由退款专员跟进。',
    citations: [
      createCitation(
        'DOC-202604-008',
        '高频异常工单处理手册.pdf',
        2,
        '支付、登录等高频异常工单要求 10 分钟内首响。',
      ),
    ],
    toolCalls: [
      createToolCall(
        '查询工单状态',
        '工单 ID：TK-1002',
        '工单状态：处理中，负责人：刘晨。',
        'success',
        278,
      ),
    ],
    evaluation: {
      userScore: 5,
      helpful: true,
      remark: '同时给到规则和工单状态，帮助较大。',
      qualityLevel: 'high',
    },
  }),
  createRequestDetail({
    requestId: 'REQ-20260404-006',
    sessionId: 'SESS-202604-006',
    modelName: 'gpt-4.1-mini',
    status: 'success',
    latencyMs: 655,
    hitChunkCount: 5,
    usedTool: 'no',
    createdAt: createTimestamp(4, 11, 58),
    question: '售后换货工单对外承诺的反馈时效是 24 小时还是 48 小时？',
    answer:
      '标准口径是 24 小时内给出受理反馈，复杂场景可以在 48 小时内补充处理方案，但需要主动说明原因。',
    citations: [
      createCitation(
        'DOC-202604-007',
        '售后服务时效标准.md',
        5,
        '换货类售后需在 24 小时内完成受理反馈，复杂场景可在 48 小时内补充处理方案。',
      ),
    ],
    toolCalls: [],
    evaluation: {
      userScore: 4,
      helpful: true,
      qualityLevel: 'high',
    },
  }),
  createRequestDetail({
    requestId: 'REQ-20260404-007',
    sessionId: 'SESS-202604-007',
    modelName: 'gpt-4.1-mini',
    status: 'success',
    latencyMs: 1088,
    hitChunkCount: 7,
    usedTool: 'no',
    createdAt: createTimestamp(4, 12, 12),
    question: '企业知识库导入时，切片长度推荐多少，后续应该根据什么指标调优？',
    answer:
      '建议从 400 到 600 token 起步，再根据引用命中率、召回质量和评测结果做逐步调优。',
    citations: [
      createCitation(
        'DOC-202604-011',
        '企业知识库接入说明.pdf',
        6,
        '推荐初始切片长度为 400-600 token，并按召回质量进行灰度调优。',
      ),
      createCitation(
        'DOC-202604-011',
        '企业知识库接入说明.pdf',
        8,
        '应结合引用命中率和评测结果逐步优化切片和重排参数。',
      ),
    ],
    toolCalls: [],
    evaluation: {
      userScore: 5,
      helpful: true,
      qualityLevel: 'high',
    },
  }),
  createRequestDetail({
    requestId: 'REQ-20260404-008',
    sessionId: 'SESS-202604-008',
    modelName: 'gpt-4.1-mini',
    status: 'failed',
    latencyMs: 1450,
    hitChunkCount: 0,
    usedTool: 'no',
    createdAt: createTimestamp(4, 12, 35),
    question: '夜班交接时必须同步哪些遗留事项，最好按优先级列一下。',
    answer: '本次未检索到可用知识片段，建议稍后重试或检查知识库索引状态。',
    citations: [],
    toolCalls: [],
    evaluation: {
      userScore: 1,
      helpful: false,
      remark: '没有给到有效答案。',
      qualityLevel: 'low',
    },
  }),
  createRequestDetail({
    requestId: 'REQ-20260404-009',
    sessionId: 'SESS-202604-009',
    modelName: 'gpt-4.1-mini',
    status: 'partial_success',
    latencyMs: 1176,
    hitChunkCount: 2,
    usedTool: 'yes',
    createdAt: createTimestamp(4, 13, 4),
    question: '发布公告是否需要写回滚方案，同时帮我看下公告服务 notice-center 是否健康。',
    answer:
      '若上线影响范围较大，建议在公告中追加回滚触发条件和应急联系人。本次健康检查返回告警状态，建议确认响应时间波动。',
    citations: [],
    toolCalls: [
      createToolCall(
        '查询服务健康状态',
        '服务名称：notice-center',
        '服务状态：告警，平均响应时间 286ms，建议关注实例抖动。',
        'success',
        302,
      ),
    ],
    evaluation: {
      userScore: 3,
      helpful: true,
      qualityLevel: 'medium',
    },
  }),
  createRequestDetail({
    requestId: 'REQ-20260404-010',
    sessionId: 'SESS-202604-010',
    modelName: 'gpt-4.1-mini',
    status: 'success',
    latencyMs: 932,
    hitChunkCount: 4,
    usedTool: 'yes',
    createdAt: createTimestamp(4, 13, 28),
    question: '机器人召回质量下降时回滚应该先做什么，顺便确认一下 rag-indexer 服务是否正常。',
    answer:
      '建议先冻结新索引写入，再切回上一版配置并验证关键场景命中率。工具查询显示 rag-indexer 当前健康正常。',
    citations: [
      createCitation(
        'DOC-202604-010',
        '机器人升级回滚预案.docx',
        2,
        '回滚前需先冻结新索引写入，随后切换配置并执行关键场景回归验证。',
      ),
    ],
    toolCalls: [
      createToolCall(
        '查询服务健康状态',
        '服务名称：rag-indexer',
        '服务状态：正常，实例 6，平均响应时间 124ms。',
        'success',
        226,
      ),
    ],
    evaluation: {
      userScore: 4,
      helpful: true,
      qualityLevel: 'high',
    },
  }),
  createRequestDetail({
    requestId: 'REQ-20260404-011',
    sessionId: 'SESS-202604-011',
    modelName: 'gpt-4.1-mini',
    status: 'success',
    latencyMs: 1035,
    hitChunkCount: 3,
    usedTool: 'no',
    createdAt: createTimestamp(4, 13, 56),
    question: '产品 FAQ 命中率下降时，优先排查知识库内容还是检索参数？',
    answer:
      '建议先排查最近新增 FAQ 是否存在重复问法，再检查重排阈值和召回条数配置，最后再评估索引质量。',
    citations: [],
    toolCalls: [],
    evaluation: {
      userScore: 4,
      helpful: true,
      qualityLevel: 'medium',
    },
  }),
  createRequestDetail({
    requestId: 'REQ-20260404-012',
    sessionId: 'SESS-202604-012',
    modelName: 'gpt-4.1-mini',
    status: 'success',
    latencyMs: 623,
    hitChunkCount: 4,
    usedTool: 'no',
    createdAt: createTimestamp(4, 14, 10),
    question: '客服话术库每周检查时应该优先看哪些指标？',
    answer:
      '建议重点看高频问题命中率、人工转接率、失配问题聚类以及最近新增文档的解析成功率。',
    citations: [],
    toolCalls: [],
    evaluation: {
      userScore: 4,
      helpful: true,
      qualityLevel: 'medium',
    },
  }),
  createRequestDetail({
    requestId: 'REQ-20260404-013',
    sessionId: 'SESS-202604-003',
    modelName: 'gpt-4.1-mini',
    status: 'failed',
    latencyMs: 1516,
    hitChunkCount: 1,
    usedTool: 'yes',
    createdAt: createTimestamp(4, 14, 18),
    question: '帮我查看当前值班队列拥塞情况，并结合机器人接待规则给出应对建议。',
    answer:
      '工具调用失败，未能获取实时队列状态。建议先按默认接待规则处理，并稍后重试实时查询。',
    citations: [
      createCitation(
        'DOC-202604-001',
        '客服机器人接待规范.pdf',
        3,
        '机器人连续两次未命中后，应主动提示转人工。',
      ),
    ],
    toolCalls: [
      createToolCall(
        '查询服务健康状态',
        '服务名称：agent-queue',
        '调用失败，服务超时未返回。',
        'failed',
        800,
      ),
    ],
    evaluation: {
      userScore: 2,
      helpful: false,
      remark: '缺少实时队列信息。',
      qualityLevel: 'low',
    },
  }),
  createRequestDetail({
    requestId: 'REQ-20260404-014',
    sessionId: 'SESS-202604-005',
    modelName: 'gpt-4.1-mini',
    status: 'success',
    latencyMs: 744,
    hitChunkCount: 5,
    usedTool: 'yes',
    createdAt: createTimestamp(4, 14, 36),
    question: '请创建一个支付异常跟进工单，并告诉我高频异常工单的首响标准。',
    answer:
      '已根据工具返回生成新的支付异常跟进工单。知识库规则显示高频异常工单建议 10 分钟内首响。',
    citations: [
      createCitation(
        'DOC-202604-008',
        '高频异常工单处理手册.pdf',
        2,
        '高频异常工单要求 10 分钟内首响。',
      ),
    ],
    toolCalls: [
      createToolCall(
        '创建工单',
        '标题：支付异常跟进；优先级：高',
        '工单创建成功：TK-1098，默认负责人：赵安。',
        'success',
        248,
      ),
    ],
    evaluation: {
      userScore: 5,
      helpful: true,
      qualityLevel: 'high',
    },
  }),
  createRequestDetail({
    requestId: 'REQ-20260404-015',
    sessionId: 'SESS-202604-009',
    modelName: 'gpt-4.1-mini',
    status: 'success',
    latencyMs: 881,
    hitChunkCount: 2,
    usedTool: 'yes',
    createdAt: createTimestamp(4, 15, 2),
    question: '查询 TK-1001 当前状态，并说明公告模板里是否建议写回滚触发条件。',
    answer:
      '工具返回 TK-1001 当前处于待处理状态。若上线影响范围较大，公告中建议写明回滚触发条件和应急联系人。',
    citations: [],
    toolCalls: [
      createToolCall(
        '查询工单状态',
        '工单 ID：TK-1001',
        '工单状态：待处理，负责人：李航。',
        'success',
        218,
      ),
    ],
    evaluation: {
      userScore: 4,
      helpful: true,
      qualityLevel: 'medium',
    },
  }),
];

function normalizeValue(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

function matchDateRange(value: string, startDate?: string, endDate?: string) {
  const timeValue = toTimeValue(value);
  const start = startDate ? toTimeValue(`${startDate} 00:00:00`) : Number.NEGATIVE_INFINITY;
  const end = endDate ? toTimeValue(`${endDate} 23:59:59`) : Number.POSITIVE_INFINITY;

  return timeValue >= start && timeValue <= end;
}

export async function mockGetObservabilityMetrics(): Promise<ObservabilityMetrics> {
  await sleep(240);

  return mockMetrics;
}

export async function mockGetEvaluationSummary(): Promise<EvaluationSummary> {
  await sleep(260);

  return mockEvaluationSummary;
}

export async function mockGetRetrievalQualitySummary(): Promise<RetrievalQualitySummary> {
  await sleep(280);

  return mockRetrievalQualitySummary;
}

export async function mockGetRequestLogs(
  query: RequestLogQuery,
): Promise<RequestLogListResponse> {
  await sleep(420);

  const keyword = normalizeValue(query.keyword);

  const filteredList = mockRequestStore
    .filter((item) => {
      const matchedKeyword = keyword
        ? item.requestId.toLowerCase().includes(keyword) ||
          item.questionSummary.toLowerCase().includes(keyword)
        : true;
      const matchedStatus = query.status ? item.status === query.status : true;
      const matchedTool = query.usedTool ? item.usedTool === query.usedTool : true;
      const matchedDateRange = matchDateRange(
        item.createdAt,
        query.startDate,
        query.endDate,
      );

      return matchedKeyword && matchedStatus && matchedTool && matchedDateRange;
    })
    .sort((prev, next) => toTimeValue(next.createdAt) - toTimeValue(prev.createdAt));

  const page = Math.max(query.page, 1);
  const pageSize = Math.max(query.pageSize, 1);
  const startIndex = (page - 1) * pageSize;
  const list = filteredList.slice(startIndex, startIndex + pageSize).map((item) => ({
    requestId: item.requestId,
    sessionId: item.sessionId,
    questionSummary: item.questionSummary,
    status: item.status,
    latencyMs: item.latencyMs,
    hitChunkCount: item.hitChunkCount,
    citationCount: item.citationCount,
    usedTool: item.usedTool,
    createdAt: item.createdAt,
  }));

  return {
    list,
    total: filteredList.length,
    page,
    pageSize,
  };
}

export async function mockGetRequestLogDetail(
  requestId: string,
): Promise<RequestLogDetail> {
  await sleep(320);

  const matchedRequest = mockRequestStore.find((item) => item.requestId === requestId);

  if (!matchedRequest) {
    throw new Error('未找到对应请求详情，请返回日志列表重新选择。');
  }

  return matchedRequest;
}
