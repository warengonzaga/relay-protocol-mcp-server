import { RelayClient } from '../client/RelayClient.js';
import {
  createJobSchema,
  getJobSchema,
  updateJobSchema,
  queryJobsSchema,
  deleteJobSchema,
} from '../schemas/jobs.js';
import { fetchAllPages } from '../utils/pagination.js';
import type { Job } from '../types/relay.js';

interface Tool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (args: unknown) => Promise<any>;
}

export function createJobTools(client: RelayClient): Record<string, Tool> {
  return {
    relay_create_job: {
      name: 'relay_create_job',
      description: `Create a new job in Relay Protocol.
      
Examples:
- Basic job: { "workflowId": "workflow-123", "inputs": { "text": "Hello" } }
- With metadata: { "workflowId": "workflow-123", "inputs": { "text": "Hello" }, "metadata": { "source": "api" } }
- With callback: { "workflowId": "workflow-123", "inputs": { "text": "Hello" }, "callbackUrl": "https://example.com/webhook" }`,
      inputSchema: {
        type: "object",
        properties: {
          workflowId: { type: "string", description: "ID of the workflow to execute" },
          inputs: { type: "object", description: "Input parameters for the workflow" },
          metadata: { type: "object", description: "Optional metadata to attach to the job" },
          callbackUrl: { type: "string", format: "uri", description: "URL to receive job status updates" }
        },
        required: ["workflowId", "inputs"]
      },
      handler: async (args: unknown) => {
        const validated = createJobSchema.parse(args);
        return await client.createJob(validated);
      },
    },

    relay_get_job: {
      name: 'relay_get_job',
      description: 'Get details of a specific job by ID',
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "Job ID" }
        },
        required: ["id"]
      },
      handler: async (args: unknown) => {
        const { id } = getJobSchema.parse(args);
        return await client.getJob(id);
      },
    },

    relay_update_job: {
      name: 'relay_update_job',
      description: `Update a job's status, outputs, or metadata.
      
Examples:
- Update status: { "id": "job-123", "status": "completed" }
- Add outputs: { "id": "job-123", "outputs": { "result": "Success" } }
- Report error: { "id": "job-123", "status": "failed", "error": { "message": "Processing failed" } }`,
      inputSchema: updateJobSchema,
      handler: async (args: unknown) => {
        const { id, ...updateData } = updateJobSchema.parse(args);
        return await client.updateJob(id, updateData);
      },
    },

    relay_query_jobs: {
      name: 'relay_query_jobs',
      description: `Query jobs with filters and pagination.
      
Examples:
- Get first page: {}
- Get completed jobs: { "status": "completed" }
- Get all jobs for workflow: { "workflowId": "workflow-123", "fetchAll": true }
- With date range: { "createdAfter": "2024-01-01T00:00:00Z", "status": "failed" }`,
      inputSchema: queryJobsSchema,
      handler: async (args: unknown) => {
        const validated = queryJobsSchema.parse(args);
        const { fetchAll, page, limit, ...filters } = validated;

        if (fetchAll) {
          const jobs = await fetchAllPages<Job>(
            async (p, l) => client.queryJobs({ ...filters, page: p, limit: l }),
            filters
          );
          return { jobs, totalFetched: jobs.length };
        }

        const response = await client.queryJobs({ ...filters, page, limit });
        return {
          jobs: response.data,
          pagination: {
            ...response.pagination,
            nextPage: response.pagination.hasMore ? response.pagination.page + 1 : null,
          },
        };
      },
    },

    relay_delete_job: {
      name: 'relay_delete_job',
      description: 'Delete a job by ID',
      inputSchema: deleteJobSchema,
      handler: async (args: unknown) => {
        const { id } = deleteJobSchema.parse(args);
        await client.deleteJob(id);
        return { success: true, message: `Job ${id} deleted successfully` };
      },
    },
  };
}
