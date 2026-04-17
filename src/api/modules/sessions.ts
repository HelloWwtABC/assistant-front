import { appEnv } from '@/config/env';
import {
  mockBatchDeleteSessions,
  mockDeleteSession,
  mockGetSessionDetail,
  mockGetSessions,
} from '@/mock/sessions';
import { mockRequest } from '@/mock/request';
import type {
  SessionDetail,
  SessionRecordListResponse,
  SessionRecordQuery,
} from '@/types/sessions';

import { request } from '../request';

export const sessionsApi = {
  getSessions(query: SessionRecordQuery) {
    if (appEnv.useMock) {
      return mockRequest(() => mockGetSessions(query));
    }

    return request.get<SessionRecordListResponse>('/sessions', {
      params: query,
    });
  },
  getSessionDetail(sessionId: string) {
    if (appEnv.useMock) {
      return mockRequest(() => mockGetSessionDetail(sessionId));
    }

    return request.get<SessionDetail>(`/sessions/${sessionId}`);
  },
  deleteSession(sessionId: string) {
    if (appEnv.useMock) {
      return mockRequest(() => mockDeleteSession(sessionId));
    }

    return request.delete<void>(`/sessions/${sessionId}`);
  },
  batchDeleteSessions(sessionIds: string[]) {
    if (appEnv.useMock) {
      return mockRequest(() => mockBatchDeleteSessions(sessionIds));
    }

    return request.post<void, { sessionIds: string[] }>('/sessions/batch-delete', {
      sessionIds,
    });
  },
};
