export type RequestStatus = 'success' | 'failed' | 'partial_success';

export type ToolCallFlag = 'yes' | 'no';

export type QualityLevel = 'high' | 'medium' | 'low';

export interface ObservabilityMetrics {
  todayRequestCount: number;
  avgLatencyMs: number;
  toolCallCount: number;
  errorRate: number;
  avgHitChunkCount: number;
  citationCoverage: number;
}

export interface EvaluationSummary {
  positiveFeedbackCount: number;
  negativeFeedbackCount: number;
  avgScore: number;
  helpfulRate: number;
  effectiveAnswerCount: number;
}

export interface CommonQuestionCategoryItem {
  category: string;
  count: number;
}

export interface RetrievalQualitySummary {
  avgHitChunks: number;
  avgCitationCount: number;
  highQualityRate: number;
  lowQualityRate: number;
  commonQuestionCategories: CommonQuestionCategoryItem[];
}

export interface RequestCitationItem {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  snippet: string;
}

export interface RequestToolCallItem {
  toolName: string;
  inputSummary: string;
  outputSummary: string;
  status: 'success' | 'failed';
  durationMs: number;
}

export interface RequestEvaluationItem {
  userScore: number;
  helpful: boolean;
  remark?: string;
  qualityLevel: QualityLevel;
}

export interface RequestLogItem {
  requestId: string;
  sessionId: string;
  questionSummary: string;
  status: RequestStatus;
  latencyMs: number;
  hitChunkCount: number;
  citationCount: number;
  usedTool: ToolCallFlag;
  createdAt: string;
}

export interface RequestLogQuery {
  keyword?: string;
  status?: RequestStatus;
  usedTool?: ToolCallFlag;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

export interface RequestLogListResponse {
  list: RequestLogItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RequestLogDetail extends RequestLogItem {
  modelName: string;
  question: string;
  answer: string;
  citations: RequestCitationItem[];
  toolCalls: RequestToolCallItem[];
  evaluation: RequestEvaluationItem;
}

export const REQUEST_STATUS_OPTIONS: Array<{
  label: string;
  value: RequestStatus;
}> = [
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failed' },
  { label: '部分成功', value: 'partial_success' },
];

export const TOOL_CALL_FILTER_OPTIONS: Array<{
  label: string;
  value: ToolCallFlag;
}> = [
  { label: '是', value: 'yes' },
  { label: '否', value: 'no' },
];

export const REQUEST_STATUS_META: Record<
  RequestStatus,
  {
    text: string;
    color: string;
  }
> = {
  success: {
    text: '成功',
    color: 'success',
  },
  failed: {
    text: '失败',
    color: 'error',
  },
  partial_success: {
    text: '部分成功',
    color: 'warning',
  },
};

export const TOOL_CALL_FLAG_META: Record<
  ToolCallFlag,
  {
    text: string;
    color: string;
  }
> = {
  yes: {
    text: '已调用',
    color: 'processing',
  },
  no: {
    text: '未调用',
    color: 'default',
  },
};

export const QUALITY_LEVEL_META: Record<
  QualityLevel,
  {
    text: string;
    color: string;
  }
> = {
  high: {
    text: '高',
    color: 'success',
  },
  medium: {
    text: '中',
    color: 'warning',
  },
  low: {
    text: '低',
    color: 'error',
  },
};
