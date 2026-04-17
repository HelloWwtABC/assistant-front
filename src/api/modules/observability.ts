import { appEnv } from '@/config/env';
import {
  mockGetEvaluationSummary,
  mockGetObservabilityMetrics,
  mockGetRequestLogDetail,
  mockGetRequestLogs,
  mockGetRetrievalQualitySummary,
} from '@/mock/observability';
import { mockRequest } from '@/mock/request';
import type {
  EvaluationSummary,
  ObservabilityMetrics,
  RequestLogDetail,
  RequestLogListResponse,
  RequestLogQuery,
  RetrievalQualitySummary,
} from '@/types/observability';

import { request } from '../request';

export const observabilityApi = {
  getObservabilityMetrics() {
    if (appEnv.useMock) {
      return mockRequest(() => mockGetObservabilityMetrics());
    }

    return request.get<ObservabilityMetrics>('/observability/metrics');
  },
  getEvaluationSummary() {
    if (appEnv.useMock) {
      return mockRequest(() => mockGetEvaluationSummary());
    }

    return request.get<EvaluationSummary>('/observability/evaluation-summary');
  },
  getRetrievalQualitySummary() {
    if (appEnv.useMock) {
      return mockRequest(() => mockGetRetrievalQualitySummary());
    }

    return request.get<RetrievalQualitySummary>('/observability/retrieval-quality');
  },
  getRequestLogs(query: RequestLogQuery) {
    if (appEnv.useMock) {
      return mockRequest(() => mockGetRequestLogs(query));
    }

    return request.get<RequestLogListResponse>('/observability/request-logs', {
      params: query,
    });
  },
  getRequestLogDetail(requestId: string) {
    if (appEnv.useMock) {
      return mockRequest(() => mockGetRequestLogDetail(requestId));
    }

    return request.get<RequestLogDetail>(`/observability/request-logs/${requestId}`);
  },
};
