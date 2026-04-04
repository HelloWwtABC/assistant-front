import { appEnv } from '@/config/env';
import {
  mockClearQaSessionContext,
  mockCreateQaSession,
  mockDeleteQaSession,
  mockGetQaSessionDetail,
  mockGetQaSessions,
  mockSendQaMessage,
} from '@/mock/qa';
import { mockRequest } from '@/mock/request';
import type {
  QaChatRequest,
  QaChatResponse,
  QaSessionDetail,
  QaSessionItem,
} from '@/types/qa';

import { request } from '../request';

export const qaApi = {
  getQaSessions() {
    if (appEnv.useMock) {
      return mockRequest(() => mockGetQaSessions());
    }

    return request.get<QaSessionItem[]>('/qa/sessions');
  },
  getQaSessionDetail(sessionId: string) {
    if (appEnv.useMock) {
      return mockRequest(() => mockGetQaSessionDetail(sessionId));
    }

    return request.get<QaSessionDetail>(`/qa/sessions/${sessionId}`);
  },
  createQaSession() {
    if (appEnv.useMock) {
      return mockRequest(() => mockCreateQaSession());
    }

    return request.post<QaSessionDetail>('/qa/sessions');
  },
  deleteQaSession(sessionId: string) {
    if (appEnv.useMock) {
      return mockRequest(() => mockDeleteQaSession(sessionId));
    }

    return request.delete<void>(`/qa/sessions/${sessionId}`);
  },
  sendQaMessage(payload: QaChatRequest) {
    if (appEnv.useMock) {
      return mockRequest(() => mockSendQaMessage(payload));
    }

    return request.post<QaChatResponse, QaChatRequest>('/qa/chat', payload);
  },
  clearQaSessionContext(sessionId: string) {
    if (appEnv.useMock) {
      return mockRequest(() => mockClearQaSessionContext(sessionId));
    }

    return request.post<void, { sessionId: string }>('/qa/clear-context', {
      sessionId,
    });
  },
};
