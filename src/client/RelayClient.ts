import axios, { AxiosInstance, AxiosError } from 'axios';
import { RelayAPIError, RelayConnectionError } from './errors.js';
import type {
  Job,
  CreateJobRequest,
  UpdateJobRequest,
  QueryJobsRequest,
  Workflow,
  Callback,
  RegisterCallbackRequest,
  PaginatedResponse,
} from '../types/relay.js';

export class RelayClient {
  private client: AxiosInstance;

  constructor(baseUrl: string, timeout: number = 30000) {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.debug(`[Relay API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          throw new RelayConnectionError('Request timed out', error);
        }

        if (!error.response) {
          throw new RelayConnectionError('Network error - no response received', error);
        }

        const errorMessage = 
          (error.response.data as any)?.message || 
          (error.response.data as any)?.error || 
          `HTTP ${error.response.status} error`;

        throw new RelayAPIError(
          errorMessage,
          error.response.status,
          error.response.data,
          error.config?.data
        );
      }
    );
  }

  // Job operations
  async createJob(request: CreateJobRequest): Promise<Job> {
    const response = await this.client.post<Job>('/jobs', request);
    return response.data;
  }

  async getJob(jobId: string): Promise<Job> {
    const response = await this.client.get<Job>(`/jobs/${jobId}`);
    return response.data;
  }

  async updateJob(jobId: string, request: UpdateJobRequest): Promise<Job> {
    const response = await this.client.put<Job>(`/jobs/${jobId}`, request);
    return response.data;
  }

  async queryJobs(request: QueryJobsRequest): Promise<PaginatedResponse<Job>> {
    const response = await this.client.get<PaginatedResponse<Job>>('/jobs', {
      params: request,
    });
    return response.data;
  }

  async deleteJob(jobId: string): Promise<void> {
    await this.client.delete(`/jobs/${jobId}`);
  }

  // Workflow operations
  async listWorkflows(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Workflow>> {
    const response = await this.client.get<PaginatedResponse<Workflow>>('/workflows', {
      params: { page, limit },
    });
    return response.data;
  }

  async getWorkflow(workflowId: string): Promise<Workflow> {
    const response = await this.client.get<Workflow>(`/workflows/${workflowId}`);
    return response.data;
  }

  // Callback operations
  async registerCallback(request: RegisterCallbackRequest): Promise<Callback> {
    const response = await this.client.post<Callback>('/callbacks', request);
    return response.data;
  }

  async listCallbacks(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Callback>> {
    const response = await this.client.get<PaginatedResponse<Callback>>('/callbacks', {
      params: { page, limit },
    });
    return response.data;
  }

  async getCallback(callbackId: string): Promise<Callback> {
    const response = await this.client.get<Callback>(`/callbacks/${callbackId}`);
    return response.data;
  }

  async updateCallback(callbackId: string, request: Partial<RegisterCallbackRequest>): Promise<Callback> {
    const response = await this.client.put<Callback>(`/callbacks/${callbackId}`, request);
    return response.data;
  }

  async deleteCallback(callbackId: string): Promise<void> {
    await this.client.delete(`/callbacks/${callbackId}`);
  }
}
