// Job related types
export interface Job {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  error?: {
    message: string;
    code?: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CreateJobRequest {
  workflowId: string;
  inputs: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  callbackUrl?: string;
}

export interface UpdateJobRequest {
  status?: Job['status'];
  outputs?: Record<string, unknown>;
  error?: Job['error'];
  metadata?: Record<string, unknown>;
}

export interface QueryJobsRequest {
  page?: number;
  limit?: number;
  status?: Job['status'];
  workflowId?: string;
  createdAfter?: string;
  createdBefore?: string;
}

// Workflow related types
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  inputs: WorkflowInput[];
  outputs: WorkflowOutput[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowInput {
  name: string;
  type: string;
  description?: string;
  required: boolean;
  default?: unknown;
}

export interface WorkflowOutput {
  name: string;
  type: string;
  description?: string;
}

// Callback related types
export interface Callback {
  id: string;
  url: string;
  events: CallbackEvent[];
  headers?: Record<string, string>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CallbackEvent = 'job.created' | 'job.started' | 'job.completed' | 'job.failed';

export interface RegisterCallbackRequest {
  url: string;
  events: CallbackEvent[];
  headers?: Record<string, string>;
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
