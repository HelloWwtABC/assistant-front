import type {
  QaChatRequest,
  QaChatResponse,
  QaCitationItem,
  QaMessageItem,
  QaSessionDetail,
  QaSessionItem,
} from '@/types/qa';
import { sleep } from '@/utils/sleep';

function toSessionItem(session: QaSessionDetail): QaSessionItem {
  return {
    sessionId: session.sessionId,
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    lastMessagePreview: session.lastMessagePreview,
    messageCount: session.messages.length,
  };
}

function createCitation(
  sessionId: string,
  index: number,
  documentId: string,
  documentName: string,
  chunkIndex: number,
  snippet: string,
): QaCitationItem {
  return {
    citationId: `${sessionId}_citation_${index}`,
    documentId,
    documentName,
    chunkIndex,
    snippet,
  };
}

function createMessage(
  messageId: string,
  role: QaMessageItem['role'],
  content: string,
  createdAt: string,
  citations: QaCitationItem[] = [],
): QaMessageItem {
  return {
    messageId,
    role,
    content,
    createdAt,
    citations,
  };
}

function createAssistantReply(sessionId: string, question: string): QaMessageItem {
  const normalizedQuestion = question.trim();
  const shortQuestion =
    normalizedQuestion.length > 20
      ? `${normalizedQuestion.slice(0, 20)}...`
      : normalizedQuestion;

  return createMessage(
    `${sessionId}_assistant_${Date.now()}`,
    'assistant',
    `根据当前知识库召回结果，我已整理出与“${shortQuestion}”相关的结论。建议你优先查看下方引用片段中的流程规则、边界条件和操作步骤，再决定是否继续补充约束信息或切换知识库范围。`,
    new Date().toLocaleString('zh-CN', { hour12: false }),
    [
      createCitation(
        sessionId,
        1,
        'DOC-202604-008',
        '高频异常工单处理手册.pdf',
        2,
        '异常工单需先完成问题分类，再按照优先级分配处理人，并记录升级链路。',
      ),
      createCitation(
        sessionId,
        2,
        'DOC-202604-001',
        '客服机器人接待规范.pdf',
        4,
        '涉及人工接管场景时，应在首轮交互内明确告知转接条件与服务时效。',
      ),
    ],
  );
}

function updateSessionSummary(session: QaSessionDetail) {
  const lastMessage = session.messages[session.messages.length - 1];

  session.updatedAt = lastMessage?.createdAt ?? session.updatedAt;
  session.lastMessagePreview = lastMessage
    ? lastMessage.content.slice(0, 48)
    : '暂无消息，点击右侧输入框开始提问';
}

let mockQaSessions: QaSessionDetail[] = [
  {
    sessionId: 'qa_session_001',
    title: '退款流程问答',
    createdAt: '2026-04-02 09:00:00',
    updatedAt: '2026-04-04 09:12:00',
    lastMessagePreview: '退款申请提交后，需要先校验订单状态与审批节点。',
    messageCount: 4,
    messages: [
      createMessage(
        'qa_001_m1',
        'user',
        '退款工单在什么情况下需要升级审批？',
        '2026-04-04 09:08:00',
      ),
      createMessage(
        'qa_001_m2',
        'assistant',
        '当退款金额超出标准阈值、订单状态异常或涉及多次申诉时，需要升级到二线审批。',
        '2026-04-04 09:08:03',
        [
          createCitation(
            'qa_session_001',
            1,
            'DOC-202604-002',
            '退款流程说明.docx',
            3,
            '退款金额超过阈值或订单存在异常标记时，需转二线审批处理。',
          ),
        ],
      ),
      createMessage(
        'qa_001_m3',
        'user',
        '那审批前需要先做什么？',
        '2026-04-04 09:11:00',
      ),
      createMessage(
        'qa_001_m4',
        'assistant',
        '审批前应先校验订单状态、用户历史申请记录和售后凭证完整性，避免误转升级流程。',
        '2026-04-04 09:12:00',
        [
          createCitation(
            'qa_session_001',
            2,
            'DOC-202604-002',
            '退款流程说明.docx',
            1,
            '发起审批前必须完成订单状态、售后凭证与用户申请记录校验。',
          ),
        ],
      ),
    ],
  },
  {
    sessionId: 'qa_session_002',
    title: '知识库接入策略',
    createdAt: '2026-04-03 10:20:00',
    updatedAt: '2026-04-04 08:45:00',
    lastMessagePreview: '接入前需要先确认文档清洗规则、切片策略和召回字段映射。',
    messageCount: 3,
    messages: [
      createMessage(
        'qa_002_m1',
        'user',
        '企业知识库接入前要先准备什么？',
        '2026-04-04 08:41:00',
      ),
      createMessage(
        'qa_002_m2',
        'assistant',
        '建议先确认文档清洗规则、切片长度、标签字段以及后续召回需要引用的元信息字段。',
        '2026-04-04 08:42:00',
        [
          createCitation(
            'qa_session_002',
            1,
            'DOC-202604-011',
            '企业知识库接入说明.pdf',
            2,
            '接入前应先统一文档清洗、切片长度与元信息字段映射规则。',
          ),
          createCitation(
            'qa_session_002',
            2,
            'DOC-202604-006',
            '知识库标签规范.pdf',
            5,
            '标签字段建议统一命名，避免后续召回与评测口径不一致。',
          ),
        ],
      ),
      createMessage(
        'qa_002_m3',
        'assistant',
        '如果后续还要做评测面板，建议同时保留 chunk 来源、文档版本和更新时间等字段。',
        '2026-04-04 08:45:00',
        [
          createCitation(
            'qa_session_002',
            3,
            'DOC-202604-011',
            '企业知识库接入说明.pdf',
            7,
            '为了支持追溯与评测，应记录 chunk 来源、版本号与更新时间。',
          ),
        ],
      ),
    ],
  },
  {
    sessionId: 'qa_session_003',
    title: '客服 SLA 咨询',
    createdAt: '2026-04-03 14:10:00',
    updatedAt: '2026-04-04 07:30:00',
    lastMessagePreview: '售后类问题需要按优先级区分首次响应时间和最终处理时限。',
    messageCount: 2,
    messages: [
      createMessage(
        'qa_003_m1',
        'user',
        '售后工单的响应时效怎么看？',
        '2026-04-04 07:28:00',
      ),
      createMessage(
        'qa_003_m2',
        'assistant',
        '售后类问题应按优先级区分首次响应时间与最终处理时限，高优先级场景需要更短的首响目标。',
        '2026-04-04 07:30:00',
        [
          createCitation(
            'qa_session_003',
            1,
            'DOC-202604-007',
            '售后服务时效标准.md',
            2,
            '售后问题按优先级区分首响时间，高优先级场景应优先转人工处理。',
          ),
        ],
      ),
    ],
  },
  {
    sessionId: 'qa_session_004',
    title: '机器人回滚预案',
    createdAt: '2026-04-03 16:35:00',
    updatedAt: '2026-04-03 17:10:00',
    lastMessagePreview: '回滚前需要先冻结自动发布，并确认监控指标已触发预案阈值。',
    messageCount: 2,
    messages: [
      createMessage(
        'qa_004_m1',
        'user',
        '版本回滚前要先做哪些检查？',
        '2026-04-03 17:06:00',
      ),
      createMessage(
        'qa_004_m2',
        'assistant',
        '建议先冻结自动发布、确认异常指标已达到预案阈值，并准备回滚后验证清单。',
        '2026-04-03 17:10:00',
        [
          createCitation(
            'qa_session_004',
            1,
            'DOC-202604-010',
            '机器人升级回滚预案.docx',
            1,
            '触发回滚前需先冻结自动发布，并根据核心指标判断是否进入预案。',
          ),
        ],
      ),
    ],
  },
  {
    sessionId: 'qa_session_005',
    title: '新会话示例',
    createdAt: '2026-04-04 08:55:00',
    updatedAt: '2026-04-04 08:55:00',
    lastMessagePreview: '暂无消息，点击右侧输入框开始提问',
    messageCount: 0,
    messages: [],
  },
];

export async function mockGetQaSessions(): Promise<QaSessionItem[]> {
  await sleep(300);

  return [...mockQaSessions]
    .sort((prev, next) => next.updatedAt.localeCompare(prev.updatedAt))
    .map(toSessionItem);
}

export async function mockGetQaSessionDetail(
  sessionId: string,
): Promise<QaSessionDetail> {
  await sleep(260);

  const session = mockQaSessions.find((item) => item.sessionId === sessionId);

  if (!session) {
    throw new Error('未找到对应会话，请刷新后重试');
  }

  return {
    ...session,
    messages: [...session.messages],
  };
}

export async function mockCreateQaSession(): Promise<QaSessionDetail> {
  await sleep(240);

  const createdAt = new Date().toLocaleString('zh-CN', { hour12: false });
  const nextSequence = String(mockQaSessions.length + 1).padStart(3, '0');
  const newSession: QaSessionDetail = {
    sessionId: `qa_session_${nextSequence}`,
    title: '新建问答会话',
    createdAt,
    updatedAt: createdAt,
    lastMessagePreview: '暂无消息，点击右侧输入框开始提问',
    messageCount: 0,
    messages: [],
  };

  mockQaSessions = [newSession, ...mockQaSessions];

  return {
    ...newSession,
    messages: [],
  };
}

export async function mockDeleteQaSession(sessionId: string): Promise<void> {
  await sleep(220);

  const originalLength = mockQaSessions.length;
  mockQaSessions = mockQaSessions.filter((item) => item.sessionId !== sessionId);

  if (mockQaSessions.length === originalLength) {
    throw new Error('会话不存在，删除失败');
  }
}

export async function mockSendQaMessage(
  payload: QaChatRequest,
): Promise<QaChatResponse> {
  await sleep(900);

  const session = mockQaSessions.find((item) => item.sessionId === payload.sessionId);

  if (!session) {
    throw new Error('当前会话不存在，请重新选择会话');
  }

  const timestamp = new Date().toLocaleString('zh-CN', { hour12: false });
  const userMessage = createMessage(
    `${payload.sessionId}_user_${Date.now()}`,
    'user',
    payload.question.trim(),
    timestamp,
  );
  const assistantMessage = createAssistantReply(payload.sessionId, payload.question);

  session.messages = [...session.messages, userMessage, assistantMessage];

  if (session.messages.length <= 2 && session.title === '新建问答会话') {
    session.title =
      payload.question.trim().length > 16
        ? `${payload.question.trim().slice(0, 16)}...`
        : payload.question.trim();
  }

  updateSessionSummary(session);

  return {
    sessionId: session.sessionId,
    userMessage,
    assistantMessage,
    updatedSession: toSessionItem(session),
  };
}

export async function mockClearQaSessionContext(sessionId: string): Promise<void> {
  await sleep(260);

  const session = mockQaSessions.find((item) => item.sessionId === sessionId);

  if (!session) {
    throw new Error('当前会话不存在，无法清空上下文');
  }

  session.messages = [];
  session.lastMessagePreview = '上下文已清空，继续输入新问题开始问答';
  session.updatedAt = new Date().toLocaleString('zh-CN', { hour12: false });
}
