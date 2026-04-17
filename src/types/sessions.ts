export type SessionMessageRole = 'user' | 'assistant';

export interface SessionKnowledgeBaseItem {
  value: string;
  label: string;
}

export interface SessionMessageCitationItem {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  snippet: string;
}

export interface SessionMessageItem {
  messageId: string;
  role: SessionMessageRole;
  content: string;
  createdAt: string;
  citations?: SessionMessageCitationItem[];
}

export interface SessionRecordItem {
  sessionId: string;
  title: string;
  questionCount: number;
  knowledgeBaseName: string;
  knowledgeBaseId: string;
  lastQuestionSnippet: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionRecordQuery {
  keyword?: string;
  knowledgeBaseId?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

export interface SessionRecordListResponse {
  list: SessionRecordItem[];
  total: number;
  page: number;
  pageSize: number;
  knowledgeBaseOptions: SessionKnowledgeBaseItem[];
  todayActiveCount: number;
}

export interface SessionDetail extends SessionRecordItem {
  messages: SessionMessageItem[];
}

export const SESSION_ROLE_META: Record<
  SessionMessageRole,
  {
    text: string;
    color: string;
  }
> = {
  user: {
    text: '用户',
    color: 'blue',
  },
  assistant: {
    text: '智能体',
    color: 'geekblue',
  },
};
