import type {
  SessionDetail,
  SessionKnowledgeBaseItem,
  SessionMessageCitationItem,
  SessionMessageItem,
  SessionRecordListResponse,
  SessionRecordQuery,
} from '@/types/sessions';
import { sleep } from '@/utils/sleep';

const knowledgeBaseOptions: SessionKnowledgeBaseItem[] = [
  { value: 'kb_customer_service', label: '客服知识库' },
  { value: 'kb_product_manual', label: '产品手册库' },
  { value: 'kb_ticket_sop', label: '工单 SOP 库' },
  { value: 'kb_operation_guide', label: '运营手册库' },
];

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
): SessionMessageCitationItem {
  return {
    documentId,
    documentName,
    chunkIndex,
    snippet,
  };
}

function createMessage(
  sessionId: string,
  index: number,
  role: SessionMessageItem['role'],
  content: string,
  createdAt: string,
  citations?: SessionMessageCitationItem[],
): SessionMessageItem {
  return {
    messageId: `${sessionId}-MSG-${String(index).padStart(3, '0')}`,
    role,
    content,
    createdAt,
    citations,
  };
}

function createSessionDetail(config: {
  sessionId: string;
  title: string;
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  createdAt: string;
  updatedAt: string;
  messages: SessionMessageItem[];
}) {
  const questionMessages = config.messages.filter((item) => item.role === 'user');
  const lastQuestion = questionMessages[questionMessages.length - 1];

  const detail: SessionDetail = {
    sessionId: config.sessionId,
    title: config.title,
    knowledgeBaseId: config.knowledgeBaseId,
    knowledgeBaseName: config.knowledgeBaseName,
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
    questionCount: questionMessages.length,
    lastQuestionSnippet: lastQuestion?.content ?? '暂无用户提问记录',
    messages: config.messages,
  };

  return detail;
}

let mockSessionStore: SessionDetail[] = [
  createSessionDetail({
    sessionId: 'SESS-202604-001',
    title: '退款规则与升级工单处理路径确认',
    knowledgeBaseId: 'kb_ticket_sop',
    knowledgeBaseName: '工单 SOP 库',
    createdAt: createTimestamp(1, 9, 15),
    updatedAt: createTimestamp(4, 9, 42),
    messages: [
      createMessage(
        'SESS-202604-001',
        1,
        'user',
        '客户要求部分退款，但工单已进入财务复核阶段，应该怎么处理？',
        createTimestamp(4, 9, 30),
      ),
      createMessage(
        'SESS-202604-001',
        2,
        'assistant',
        '建议先确认退款原因与订单状态，若已进入财务复核阶段，需要补充审批备注后再升级至退款专员处理。',
        createTimestamp(4, 9, 31),
        [
          createCitation(
            'DOC-202604-002',
            '退款流程说明.docx',
            2,
            '财务复核中的退款工单需补齐审批备注，并在系统中升级到退款专员队列。',
          ),
        ],
      ),
      createMessage(
        'SESS-202604-001',
        3,
        'user',
        '如果客户坚持要求 2 小时内处理完，需要额外走加急流程吗？',
        createTimestamp(4, 9, 41),
      ),
    ],
  }),
  createSessionDetail({
    sessionId: 'SESS-202604-002',
    title: '知识库导入后标签命名规范咨询',
    knowledgeBaseId: 'kb_operation_guide',
    knowledgeBaseName: '运营手册库',
    createdAt: createTimestamp(1, 11, 0),
    updatedAt: createTimestamp(4, 10, 18),
    messages: [
      createMessage(
        'SESS-202604-002',
        1,
        'user',
        '我们导入新文档后，一级标签和二级标签的命名有什么统一要求？',
        createTimestamp(4, 10, 8),
      ),
      createMessage(
        'SESS-202604-002',
        2,
        'assistant',
        '一级标签建议按业务域命名，二级标签聚焦场景和动作，避免同义词并列，便于后续检索和评测。',
        createTimestamp(4, 10, 9),
        [
          createCitation(
            'DOC-202604-006',
            '知识库标签规范.pdf',
            1,
            '标签命名遵循业务域 > 场景 > 动作的层级规则，避免近义词重复出现。',
          ),
          createCitation(
            'DOC-202604-006',
            '知识库标签规范.pdf',
            4,
            '新增标签前应检查既有标签集合，保证命名一致性与归档稳定性。',
          ),
        ],
      ),
      createMessage(
        'SESS-202604-002',
        3,
        'user',
        '标签里是否允许直接写版本号，比如 2026Q2？',
        createTimestamp(4, 10, 18),
      ),
    ],
  }),
  createSessionDetail({
    sessionId: 'SESS-202604-003',
    title: '机器人接待话术与人工转接阈值确认',
    knowledgeBaseId: 'kb_customer_service',
    knowledgeBaseName: '客服知识库',
    createdAt: createTimestamp(1, 14, 20),
    updatedAt: createTimestamp(3, 16, 5),
    messages: [
      createMessage(
        'SESS-202604-003',
        1,
        'user',
        '机器人连续两次没有命中答案时，是否必须立刻转人工？',
        createTimestamp(3, 15, 54),
      ),
      createMessage(
        'SESS-202604-003',
        2,
        'assistant',
        '默认策略是两次未命中后提示人工接入，同时保留一次补充关键词检索机会，避免误判。',
        createTimestamp(3, 15, 55),
        [
          createCitation(
            'DOC-202604-001',
            '客服机器人接待规范.pdf',
            3,
            '机器人连续两次未命中后，应主动提示转人工，并保留一次补充检索机会。',
          ),
        ],
      ),
      createMessage(
        'SESS-202604-003',
        3,
        'user',
        '那深夜值班场景是不是仍然优先机器人回复？',
        createTimestamp(3, 16, 5),
      ),
    ],
  }),
  createSessionDetail({
    sessionId: 'SESS-202604-004',
    title: '权限中心配置项说明检索',
    knowledgeBaseId: 'kb_product_manual',
    knowledgeBaseName: '产品手册库',
    createdAt: createTimestamp(2, 9, 50),
    updatedAt: createTimestamp(3, 10, 26),
    messages: [
      createMessage(
        'SESS-202604-004',
        1,
        'user',
        '权限中心里的角色继承配置支持几级嵌套？',
        createTimestamp(3, 10, 20),
      ),
      createMessage(
        'SESS-202604-004',
        2,
        'assistant',
        '当前文档说明支持最多三级角色继承，且需要在高级设置里显式开启继承校验。',
        createTimestamp(3, 10, 21),
        [
          createCitation(
            'DOC-202604-009',
            '权限中心配置说明.txt',
            2,
            '角色继承默认关闭，开启后最多支持三级嵌套，并需进行循环依赖校验。',
          ),
        ],
      ),
      createMessage(
        'SESS-202604-004',
        3,
        'user',
        '如果超过三级，会直接保存失败吗？',
        createTimestamp(3, 10, 26),
      ),
    ],
  }),
  createSessionDetail({
    sessionId: 'SESS-202604-005',
    title: '高频异常工单闭环处理复盘',
    knowledgeBaseId: 'kb_ticket_sop',
    knowledgeBaseName: '工单 SOP 库',
    createdAt: createTimestamp(2, 11, 10),
    updatedAt: createTimestamp(3, 13, 48),
    messages: [
      createMessage(
        'SESS-202604-005',
        1,
        'user',
        '支付回调异常工单需要在多长时间内完成初步响应？',
        createTimestamp(3, 13, 35),
      ),
      createMessage(
        'SESS-202604-005',
        2,
        'assistant',
        '高频异常工单建议 10 分钟内完成首响，30 分钟内给出排查路径，并在系统中记录当前影响范围。',
        createTimestamp(3, 13, 36),
        [
          createCitation(
            'DOC-202604-008',
            '高频异常工单处理手册.pdf',
            2,
            '支付、登录等高频异常工单要求 10 分钟内首响，30 分钟内输出初步排查结论。',
          ),
        ],
      ),
      createMessage(
        'SESS-202604-005',
        3,
        'user',
        '排查结果同步给谁比较合适？',
        createTimestamp(3, 13, 48),
      ),
    ],
  }),
  createSessionDetail({
    sessionId: 'SESS-202604-006',
    title: '售后时效标准与 SLA 回答口径',
    knowledgeBaseId: 'kb_customer_service',
    knowledgeBaseName: '客服知识库',
    createdAt: createTimestamp(2, 15, 0),
    updatedAt: createTimestamp(3, 17, 11),
    messages: [
      createMessage(
        'SESS-202604-006',
        1,
        'user',
        '售后换货工单承诺 24 小时还是 48 小时反馈？',
        createTimestamp(3, 16, 58),
      ),
      createMessage(
        'SESS-202604-006',
        2,
        'assistant',
        '标准口径是 24 小时内给出受理反馈，复杂场景可在 48 小时内补充处理方案，但需要主动说明原因。',
        createTimestamp(3, 16, 59),
        [
          createCitation(
            'DOC-202604-007',
            '售后服务时效标准.md',
            5,
            '换货类售后需在 24 小时内完成受理反馈，复杂场景可在 48 小时内补充处理方案。',
          ),
        ],
      ),
      createMessage(
        'SESS-202604-006',
        3,
        'user',
        '如果客户问进度，可以引用这个 SLA 吗？',
        createTimestamp(3, 17, 11),
      ),
    ],
  }),
  createSessionDetail({
    sessionId: 'SESS-202604-007',
    title: '企业知识库接入方案评审记录',
    knowledgeBaseId: 'kb_product_manual',
    knowledgeBaseName: '产品手册库',
    createdAt: createTimestamp(2, 16, 40),
    updatedAt: createTimestamp(2, 18, 22),
    messages: [
      createMessage(
        'SESS-202604-007',
        1,
        'user',
        '企业版知识库导入时，切片长度推荐怎么设定？',
        createTimestamp(2, 18, 10),
      ),
      createMessage(
        'SESS-202604-007',
        2,
        'assistant',
        '建议从 400 到 600 token 的切片长度起步，再根据引用命中率和召回质量做二次调优。',
        createTimestamp(2, 18, 12),
        [
          createCitation(
            'DOC-202604-011',
            '企业知识库接入说明.pdf',
            6,
            '推荐初始切片长度为 400-600 token，并按召回质量进行灰度调优。',
          ),
        ],
      ),
      createMessage(
        'SESS-202604-007',
        3,
        'user',
        '向量模型需要和线上问答模型保持一致吗？',
        createTimestamp(2, 18, 22),
      ),
    ],
  }),
  createSessionDetail({
    sessionId: 'SESS-202604-008',
    title: '值班交接清单检索与引用核验',
    knowledgeBaseId: 'kb_customer_service',
    knowledgeBaseName: '客服知识库',
    createdAt: createTimestamp(3, 8, 30),
    updatedAt: createTimestamp(4, 8, 40),
    messages: [
      createMessage(
        'SESS-202604-008',
        1,
        'user',
        '夜班交接时必须同步哪些遗留事项？',
        createTimestamp(4, 8, 28),
      ),
      createMessage(
        'SESS-202604-008',
        2,
        'assistant',
        '至少需要同步未闭环工单、已升级问题、重点客户跟进项以及当天知识库变更说明。',
        createTimestamp(4, 8, 29),
        [
          createCitation(
            'DOC-202604-012',
            '值班客服交接清单.md',
            1,
            '交接清单需覆盖未闭环工单、升级问题、重点客户跟进和知识库变更。',
          ),
        ],
      ),
      createMessage(
        'SESS-202604-008',
        3,
        'user',
        '交接记录要留在知识库里还是工单系统里？',
        createTimestamp(4, 8, 40),
      ),
    ],
  }),
  createSessionDetail({
    sessionId: 'SESS-202604-009',
    title: '版本上线公告模板检索',
    knowledgeBaseId: 'kb_operation_guide',
    knowledgeBaseName: '运营手册库',
    createdAt: createTimestamp(3, 10, 15),
    updatedAt: createTimestamp(4, 11, 5),
    messages: [
      createMessage(
        'SESS-202604-009',
        1,
        'user',
        '发布公告里需要单独说明回滚方案吗？',
        createTimestamp(4, 10, 59),
      ),
      createMessage(
        'SESS-202604-009',
        2,
        'assistant',
        '如果上线影响范围较大或依赖链较长，建议在公告中追加回滚触发条件和应急联系人。',
        createTimestamp(4, 11, 0),
      ),
      createMessage(
        'SESS-202604-009',
        3,
        'user',
        '公告模板里变更窗口如何填写更规范？',
        createTimestamp(4, 11, 5),
      ),
    ],
  }),
  createSessionDetail({
    sessionId: 'SESS-202604-010',
    title: '机器人回滚预案检索',
    knowledgeBaseId: 'kb_operation_guide',
    knowledgeBaseName: '运营手册库',
    createdAt: createTimestamp(3, 12, 5),
    updatedAt: createTimestamp(4, 12, 48),
    messages: [
      createMessage(
        'SESS-202604-010',
        1,
        'user',
        '如果机器人升级后召回质量下降，回滚步骤应该先做哪一步？',
        createTimestamp(4, 12, 34),
      ),
      createMessage(
        'SESS-202604-010',
        2,
        'assistant',
        '先冻结新索引写入，再切回上一版问答配置，最后验证关键场景命中率是否恢复。',
        createTimestamp(4, 12, 35),
        [
          createCitation(
            'DOC-202604-010',
            '机器人升级回滚预案.docx',
            2,
            '回滚前需先冻结新索引写入，随后切换配置并执行关键场景回归验证。',
          ),
        ],
      ),
      createMessage(
        'SESS-202604-010',
        3,
        'user',
        '回滚后要不要重新生成评测报告？',
        createTimestamp(4, 12, 48),
      ),
    ],
  }),
  createSessionDetail({
    sessionId: 'SESS-202604-011',
    title: '产品 FAQ 命中率分析',
    knowledgeBaseId: 'kb_product_manual',
    knowledgeBaseName: '产品手册库',
    createdAt: createTimestamp(3, 14, 22),
    updatedAt: createTimestamp(3, 18, 16),
    messages: [
      createMessage(
        'SESS-202604-011',
        1,
        'user',
        '产品 FAQ 最近命中率下降，优先排查知识库还是检索参数？',
        createTimestamp(3, 18, 4),
      ),
      createMessage(
        'SESS-202604-011',
        2,
        'assistant',
        '建议先排查最近新增 FAQ 是否存在重复问法，再检查重排阈值和召回条数配置。',
        createTimestamp(3, 18, 5),
      ),
      createMessage(
        'SESS-202604-011',
        3,
        'user',
        '如果重复问法过多，应该怎么整理？',
        createTimestamp(3, 18, 16),
      ),
    ],
  }),
  createSessionDetail({
    sessionId: 'SESS-202604-012',
    title: '客服话术知识库周度检查',
    knowledgeBaseId: 'kb_customer_service',
    knowledgeBaseName: '客服知识库',
    createdAt: createTimestamp(4, 8, 5),
    updatedAt: createTimestamp(4, 14, 22),
    messages: [
      createMessage(
        'SESS-202604-012',
        1,
        'user',
        '客服话术库每周检查时，重点看哪些指标？',
        createTimestamp(4, 14, 10),
      ),
      createMessage(
        'SESS-202604-012',
        2,
        'assistant',
        '重点看高频问题命中率、人工转接率、失配问题聚类以及最近新增文档的解析成功率。',
        createTimestamp(4, 14, 11),
      ),
      createMessage(
        'SESS-202604-012',
        3,
        'user',
        '这些指标里哪个适合作为周会汇报主指标？',
        createTimestamp(4, 14, 22),
      ),
    ],
  }),
];

function toRecordItem(detail: SessionDetail) {
  return {
    sessionId: detail.sessionId,
    title: detail.title,
    questionCount: detail.questionCount,
    knowledgeBaseName: detail.knowledgeBaseName,
    knowledgeBaseId: detail.knowledgeBaseId,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    lastQuestionSnippet:
      detail.lastQuestionSnippet.length > 120
        ? `${detail.lastQuestionSnippet.slice(0, 120)}...`
        : detail.lastQuestionSnippet,
  };
}

function normalizeValue(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

function matchDateRange(
  value: string,
  startDate?: string,
  endDate?: string,
) {
  const timeValue = toTimeValue(value);
  const start = startDate ? toTimeValue(`${startDate} 00:00:00`) : Number.NEGATIVE_INFINITY;
  const end = endDate ? toTimeValue(`${endDate} 23:59:59`) : Number.POSITIVE_INFINITY;

  return timeValue >= start && timeValue <= end;
}

export async function mockGetSessions(
  query: SessionRecordQuery,
): Promise<SessionRecordListResponse> {
  await sleep(420);

  const keyword = normalizeValue(query.keyword);
  const filteredList = mockSessionStore
    .filter((item) => {
      const matchedKeyword = keyword
        ? item.title.toLowerCase().includes(keyword) ||
          item.lastQuestionSnippet.toLowerCase().includes(keyword) ||
          item.sessionId.toLowerCase().includes(keyword)
        : true;
      const matchedKnowledgeBase = query.knowledgeBaseId
        ? item.knowledgeBaseId === query.knowledgeBaseId
        : true;
      const matchedDateRange = matchDateRange(
        item.updatedAt,
        query.startDate,
        query.endDate,
      );

      return matchedKeyword && matchedKnowledgeBase && matchedDateRange;
    })
    .sort((prev, next) => toTimeValue(next.updatedAt) - toTimeValue(prev.updatedAt));

  const page = Math.max(query.page, 1);
  const pageSize = Math.max(query.pageSize, 1);
  const startIndex = (page - 1) * pageSize;
  const list = filteredList
    .slice(startIndex, startIndex + pageSize)
    .map((item) => toRecordItem(item));
  const todayActiveCount = mockSessionStore.filter((item) =>
    item.updatedAt.startsWith('2026-04-04'),
  ).length;

  return {
    list,
    total: filteredList.length,
    page,
    pageSize,
    knowledgeBaseOptions,
    todayActiveCount,
  };
}

export async function mockGetSessionDetail(sessionId: string): Promise<SessionDetail> {
  await sleep(320);

  const matchedSession = mockSessionStore.find((item) => item.sessionId === sessionId);

  if (!matchedSession) {
    throw new Error('未找到对应会话详情，请返回列表重新选择。');
  }

  return {
    ...matchedSession,
    messages: [...matchedSession.messages].sort(
      (prev, next) => toTimeValue(prev.createdAt) - toTimeValue(next.createdAt),
    ),
  };
}

export async function mockDeleteSession(sessionId: string): Promise<void> {
  await sleep(300);

  const originalLength = mockSessionStore.length;
  mockSessionStore = mockSessionStore.filter((item) => item.sessionId !== sessionId);

  if (mockSessionStore.length === originalLength) {
    throw new Error('会话不存在，删除失败。');
  }
}

export async function mockBatchDeleteSessions(sessionIds: string[]): Promise<void> {
  await sleep(380);

  if (sessionIds.length === 0) {
    throw new Error('请先选择需要删除的会话。');
  }

  mockSessionStore = mockSessionStore.filter(
    (item) => !sessionIds.includes(item.sessionId),
  );
}
