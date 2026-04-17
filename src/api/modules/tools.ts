import { appEnv } from '@/config/env';
import {
  mockCreateTicket,
  mockGetToolCallRecords,
  mockQueryServiceHealth,
  mockQueryTicketStatus,
} from '@/mock/tools';
import { mockRequest } from '@/mock/request';
import type {
  CreateTicketRequest,
  CreateTicketResult,
  ServiceHealthQueryRequest,
  ServiceHealthResult,
  TicketStatusQueryRequest,
  TicketStatusResult,
  ToolCallRecordListResponse,
  ToolCallRecordQuery,
} from '@/types/tools';

import { request } from '../request';

export const toolsApi = {
  queryTicketStatus(payload: TicketStatusQueryRequest) {
    if (appEnv.useMock) {
      return mockRequest(() => mockQueryTicketStatus(payload));
    }

    return request.post<TicketStatusResult, TicketStatusQueryRequest>(
      '/tools/ticket-status',
      payload,
    );
  },
  createTicket(payload: CreateTicketRequest) {
    if (appEnv.useMock) {
      return mockRequest(() => mockCreateTicket(payload));
    }

    return request.post<CreateTicketResult, CreateTicketRequest>(
      '/tools/create-ticket',
      payload,
    );
  },
  queryServiceHealth(payload: ServiceHealthQueryRequest) {
    if (appEnv.useMock) {
      return mockRequest(() => mockQueryServiceHealth(payload));
    }

    return request.post<ServiceHealthResult, ServiceHealthQueryRequest>(
      '/tools/service-health',
      payload,
    );
  },
  getToolCallRecords(query: ToolCallRecordQuery) {
    if (appEnv.useMock) {
      return mockRequest(() => mockGetToolCallRecords(query));
    }

    return request.get<ToolCallRecordListResponse>('/tools/call-records', {
      params: query,
    });
  },
};
