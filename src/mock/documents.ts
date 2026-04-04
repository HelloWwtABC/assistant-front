import type {
  DocumentChunkItem,
  DocumentDetail,
  DocumentFileType,
  DocumentListResponse,
  KnowledgeBaseOption,
  KnowledgeDocumentQuery,
  UploadDocumentPayload,
} from '@/types/documents';
import { sleep } from '@/utils/sleep';

const knowledgeBaseOptions: KnowledgeBaseOption[] = [
  { value: 'kb_customer_service', label: '客服知识库' },
  { value: 'kb_product_manual', label: '产品手册库' },
  { value: 'kb_ticket_sop', label: '工单 SOP 库' },
  { value: 'kb_operation_guide', label: '运营手册库' },
];

function createChunks(
  documentId: string,
  count: number,
  topic: string,
): DocumentChunkItem[] {
  return Array.from({ length: count }).map((_, index) => {
    const vectorStatus: DocumentChunkItem['vectorStatus'] =
      index % 5 === 0 ? 'pending' : 'completed';

    return {
      chunkId: `${documentId}_chunk_${index + 1}`,
      chunkIndex: index + 1,
      summary: `${topic}片段 ${index + 1}：聚焦关键规则、操作步骤与上下文说明，便于后续召回与问答引用。`,
      tokenCount: 120 + index * 18,
      vectorStatus,
    };
  });
}

let mockDocumentStore: DocumentDetail[] = [
  {
    documentId: 'DOC-202604-001',
    documentName: '客服机器人接待规范.pdf',
    knowledgeBaseId: 'kb_customer_service',
    knowledgeBaseName: '客服知识库',
    fileType: 'pdf',
    status: 'completed',
    chunkCount: 8,
    uploader: '王敏',
    uploadedAt: '2026-04-01 09:12:33',
    remark: '用于统一售前接待话术和升级路径。',
    chunks: createChunks('DOC-202604-001', 8, '接待规范'),
  },
  {
    documentId: 'DOC-202604-002',
    documentName: '退款流程说明.docx',
    knowledgeBaseId: 'kb_ticket_sop',
    knowledgeBaseName: '工单 SOP 库',
    fileType: 'docx',
    status: 'parsing',
    chunkCount: 4,
    uploader: '李航',
    uploadedAt: '2026-04-01 11:05:18',
    remark: '覆盖退款审批、异常分支与升级工单流程。',
    chunks: createChunks('DOC-202604-002', 4, '退款流程'),
  },
  {
    documentId: 'DOC-202604-003',
    documentName: '产品功能 FAQ.md',
    knowledgeBaseId: 'kb_product_manual',
    knowledgeBaseName: '产品手册库',
    fileType: 'md',
    status: 'completed',
    chunkCount: 10,
    uploader: '周宁',
    uploadedAt: '2026-04-01 14:21:09',
    remark: '常见功能问答合集。',
    chunks: createChunks('DOC-202604-003', 10, '功能 FAQ'),
  },
  {
    documentId: 'DOC-202604-004',
    documentName: '工单分派规则.txt',
    knowledgeBaseId: 'kb_ticket_sop',
    knowledgeBaseName: '工单 SOP 库',
    fileType: 'txt',
    status: 'unparsed',
    chunkCount: 0,
    uploader: '陈雪',
    uploadedAt: '2026-04-02 08:48:12',
    remark: '尚未开始解析。',
    chunks: [],
  },
  {
    documentId: 'DOC-202604-005',
    documentName: '新版本上线公告模板.docx',
    knowledgeBaseId: 'kb_operation_guide',
    knowledgeBaseName: '运营手册库',
    fileType: 'docx',
    status: 'failed',
    chunkCount: 2,
    uploader: '王敏',
    uploadedAt: '2026-04-02 10:31:41',
    remark: '历史文档格式异常，解析失败。',
    chunks: createChunks('DOC-202604-005', 2, '上线公告'),
  },
  {
    documentId: 'DOC-202604-006',
    documentName: '知识库标签规范.pdf',
    knowledgeBaseId: 'kb_operation_guide',
    knowledgeBaseName: '运营手册库',
    fileType: 'pdf',
    status: 'completed',
    chunkCount: 6,
    uploader: '赵安',
    uploadedAt: '2026-04-02 13:15:55',
    remark: '规范知识标签命名与归档方式。',
    chunks: createChunks('DOC-202604-006', 6, '标签规范'),
  },
  {
    documentId: 'DOC-202604-007',
    documentName: '售后服务时效标准.md',
    knowledgeBaseId: 'kb_customer_service',
    knowledgeBaseName: '客服知识库',
    fileType: 'md',
    status: 'completed',
    chunkCount: 7,
    uploader: '刘婷',
    uploadedAt: '2026-04-02 16:42:17',
    remark: '用于售后响应 SLA 说明。',
    chunks: createChunks('DOC-202604-007', 7, '时效标准'),
  },
  {
    documentId: 'DOC-202604-008',
    documentName: '高频异常工单处理手册.pdf',
    knowledgeBaseId: 'kb_ticket_sop',
    knowledgeBaseName: '工单 SOP 库',
    fileType: 'pdf',
    status: 'completed',
    chunkCount: 9,
    uploader: '李航',
    uploadedAt: '2026-04-03 09:03:22',
    remark: '高频问题工单闭环处理手册。',
    chunks: createChunks('DOC-202604-008', 9, '异常工单'),
  },
  {
    documentId: 'DOC-202604-009',
    documentName: '权限中心配置说明.txt',
    knowledgeBaseId: 'kb_product_manual',
    knowledgeBaseName: '产品手册库',
    fileType: 'txt',
    status: 'parsing',
    chunkCount: 3,
    uploader: '周宁',
    uploadedAt: '2026-04-03 10:26:31',
    remark: '当前正在解析权限配置说明。',
    chunks: createChunks('DOC-202604-009', 3, '权限中心'),
  },
  {
    documentId: 'DOC-202604-010',
    documentName: '机器人升级回滚预案.docx',
    knowledgeBaseId: 'kb_operation_guide',
    knowledgeBaseName: '运营手册库',
    fileType: 'docx',
    status: 'completed',
    chunkCount: 5,
    uploader: '陈雪',
    uploadedAt: '2026-04-03 14:18:44',
    remark: '平台升级失败时的回滚策略。',
    chunks: createChunks('DOC-202604-010', 5, '回滚预案'),
  },
  {
    documentId: 'DOC-202604-011',
    documentName: '企业知识库接入说明.pdf',
    knowledgeBaseId: 'kb_product_manual',
    knowledgeBaseName: '产品手册库',
    fileType: 'pdf',
    status: 'completed',
    chunkCount: 11,
    uploader: '赵安',
    uploadedAt: '2026-04-03 17:07:58',
    remark: '介绍知识库导入、切片与召回配置。',
    chunks: createChunks('DOC-202604-011', 11, '知识库接入'),
  },
  {
    documentId: 'DOC-202604-012',
    documentName: '值班客服交接清单.md',
    knowledgeBaseId: 'kb_customer_service',
    knowledgeBaseName: '客服知识库',
    fileType: 'md',
    status: 'failed',
    chunkCount: 1,
    uploader: '刘婷',
    uploadedAt: '2026-04-04 08:15:06',
    remark: '旧版 markdown 标记异常导致解析失败。',
    chunks: createChunks('DOC-202604-012', 1, '交接清单'),
  },
];

function normalizeQueryValue(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

function getFileType(fileName: string): DocumentFileType {
  const matched = fileName.toLowerCase().split('.').pop();

  if (matched === 'pdf' || matched === 'docx' || matched === 'md' || matched === 'txt') {
    return matched;
  }

  return 'txt';
}

function toListItem(document: DocumentDetail) {
  const { chunks, ...rest } = document;

  return {
    ...rest,
    chunkCount: document.chunkCount || chunks.length,
  };
}

export async function mockGetDocuments(
  query: KnowledgeDocumentQuery,
): Promise<DocumentListResponse> {
  await sleep(450);

  const keyword = normalizeQueryValue(query.keyword);
  const uploader = normalizeQueryValue(query.uploader);

  const filteredList = mockDocumentStore.filter((item) => {
    const matchedKeyword = keyword
      ? item.documentName.toLowerCase().includes(keyword) ||
        item.documentId.toLowerCase().includes(keyword)
      : true;
    const matchedStatus = query.status ? item.status === query.status : true;
    const matchedUploader = uploader
      ? item.uploader.toLowerCase().includes(uploader)
      : true;

    return matchedKeyword && matchedStatus && matchedUploader;
  });

  const page = Math.max(query.page, 1);
  const pageSize = Math.max(query.pageSize, 1);
  const start = (page - 1) * pageSize;
  const list = filteredList.slice(start, start + pageSize).map(toListItem);

  return {
    list,
    total: filteredList.length,
    page,
    pageSize,
    knowledgeBaseOptions,
  };
}

export async function mockGetDocumentDetail(documentId: string): Promise<DocumentDetail> {
  await sleep(350);

  const matchedDocument = mockDocumentStore.find(
    (item) => item.documentId === documentId,
  );

  if (!matchedDocument) {
    throw new Error('未找到对应文档详情，请检查文档 ID 是否正确');
  }

  return {
    ...matchedDocument,
    chunkCount: matchedDocument.chunkCount || matchedDocument.chunks.length,
  };
}

export async function mockUploadDocument(
  payload: UploadDocumentPayload,
): Promise<DocumentDetail> {
  await sleep(600);

  const nextSequence = String(mockDocumentStore.length + 1).padStart(3, '0');
  const documentId = `DOC-202604-${nextSequence}`;
  const fileType = getFileType(payload.file.name);

  const newDocument: DocumentDetail = {
    documentId,
    documentName: payload.file.name,
    knowledgeBaseId: payload.knowledgeBaseId,
    knowledgeBaseName: payload.knowledgeBaseName,
    fileType,
    status: 'parsing',
    chunkCount: 0,
    uploader: payload.uploader,
    uploadedAt: new Date().toLocaleString('zh-CN', {
      hour12: false,
    }),
    remark: payload.remark,
    chunks: [],
  };

  mockDocumentStore = [newDocument, ...mockDocumentStore];

  return newDocument;
}

export async function mockDeleteDocument(documentId: string): Promise<void> {
  await sleep(300);

  const originalLength = mockDocumentStore.length;
  mockDocumentStore = mockDocumentStore.filter((item) => item.documentId !== documentId);

  if (mockDocumentStore.length === originalLength) {
    throw new Error('文档不存在，删除失败');
  }
}

export async function mockBatchDeleteDocuments(documentIds: string[]): Promise<void> {
  await sleep(400);

  if (documentIds.length === 0) {
    throw new Error('请先选择需要删除的文档');
  }

  mockDocumentStore = mockDocumentStore.filter(
    (item) => !documentIds.includes(item.documentId),
  );
}
