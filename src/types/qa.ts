export type QaMessageRole = 'user' | 'assistant';

export interface QaCitationItem {
  citationId: string;
  documentId: string;
  documentName: string;
  chunkIndex: number;
  snippet: string;
}

export interface QaMessageItem {
  messageId: string;
  role: QaMessageRole;
  content: string;
  createdAt: string;
  citations: QaCitationItem[];
}

export interface QaSessionItem {
  sessionId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessagePreview: string;
  messageCount: number;
}

export interface QaSessionDetail extends QaSessionItem {
  messages: QaMessageItem[];
}

export interface QaChatRequest {
  sessionId: string;
  question: string;
}

export interface QaChatResponse {
  sessionId: string;
  userMessage: QaMessageItem;
  assistantMessage: QaMessageItem;
  updatedSession: QaSessionItem;
}
