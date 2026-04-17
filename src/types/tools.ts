export type ToolName = 'ticket_status' | 'create_ticket' | 'service_health';

export type ToolCallStatus = 'success' | 'failed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketProcessStatus =
  | 'pending'
  | 'processing'
  | 'resolved'
  | 'closed';

export type ServiceHealthStatus = 'healthy' | 'warning' | 'critical';

export interface TicketStatusQueryRequest {
  ticketId: string;
}

export interface TicketStatusResult {
  ticketId: string;
  title: string;
  status: TicketProcessStatus;
  priority: TicketPriority;
  owner: string;
  updatedAt: string;
  summary: string;
}

export interface CreateTicketRequest {
  title: string;
  priority: TicketPriority;
  description: string;
}

export interface CreateTicketResult {
  ticketId: string;
  createStatus: 'created';
  submittedAt: string;
  assignee: string;
  processStatus: TicketProcessStatus;
}

export interface ServiceHealthQueryRequest {
  serviceName: string;
}

export interface ServiceHealthResult {
  serviceName: string;
  healthStatus: ServiceHealthStatus;
  instanceCount: number;
  averageResponseTime: number;
  checkedAt: string;
  remark: string;
}

export interface ToolCallRecordItem {
  recordId: string;
  toolName: ToolName;
  requestSummary: string;
  resultSummary: string;
  status: ToolCallStatus;
  durationMs: number;
  calledAt: string;
}

export interface ToolCallRecordQuery {
  page: number;
  pageSize: number;
}

export interface ToolCallRecordListResponse {
  list: ToolCallRecordItem[];
  total: number;
  page: number;
  pageSize: number;
}

export const TOOL_NAME_META: Record<ToolName, string> = {
  ticket_status: '查询工单状态',
  create_ticket: '创建工单',
  service_health: '查询服务健康状态',
};

export const TOOL_CALL_STATUS_META: Record<
  ToolCallStatus,
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
};

export const TICKET_PRIORITY_OPTIONS: Array<{
  label: string;
  value: TicketPriority;
}> = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' },
];

export const TICKET_PRIORITY_META: Record<TicketPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

export const TICKET_STATUS_META: Record<
  TicketProcessStatus,
  {
    text: string;
    color: string;
  }
> = {
  pending: {
    text: '待处理',
    color: 'default',
  },
  processing: {
    text: '处理中',
    color: 'processing',
  },
  resolved: {
    text: '已解决',
    color: 'success',
  },
  closed: {
    text: '已关闭',
    color: 'default',
  },
};

export const SERVICE_HEALTH_META: Record<
  ServiceHealthStatus,
  {
    text: string;
    color: string;
  }
> = {
  healthy: {
    text: '正常',
    color: 'success',
  },
  warning: {
    text: '告警',
    color: 'warning',
  },
  critical: {
    text: '异常',
    color: 'error',
  },
};
