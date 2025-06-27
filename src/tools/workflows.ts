import { RelayClient } from '../client/RelayClient.js';
import { listWorkflowsSchema, getWorkflowSchema } from '../schemas/workflows.js';
import { fetchAllPages } from '../utils/pagination.js';
import type { Workflow } from '../types/relay.js';

interface Tool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (args: unknown) => Promise<any>;
}

export function createWorkflowTools(client: RelayClient): Record<string, Tool> {
  return {
    relay_list_workflows: {
      name: 'relay_list_workflows',
      description: `List all available workflows.
      
Examples:
- Get first page: {}
- Get specific page: { "page": 2, "limit": 50 }
- Get all workflows: { "fetchAll": true }`,
      inputSchema: {
        type: "object",
        properties: {
          page: { type: "number", minimum: 1, default: 1, description: "Page number" },
          limit: { type: "number", minimum: 1, maximum: 100, default: 20, description: "Items per page" },
          fetchAll: { type: "boolean", default: false, description: "Automatically fetch all pages (use with caution)" }
        }
      },
      handler: async (args: unknown) => {
        const { page, limit, fetchAll } = listWorkflowsSchema.parse(args);

        if (fetchAll) {
          const workflows = await fetchAllPages<Workflow>(
            async (p, l) => client.listWorkflows(p, l),
            {}
          );
          return { workflows, totalFetched: workflows.length };
        }

        const response = await client.listWorkflows(page, limit);
        return {
          workflows: response.data,
          pagination: {
            ...response.pagination,
            nextPage: response.pagination.hasMore ? response.pagination.page + 1 : null,
          },
        };
      },
    },

    relay_get_workflow: {
      name: 'relay_get_workflow',
      description: 'Get details of a specific workflow by ID',
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "Workflow ID" }
        },
        required: ["id"]
      },
      handler: async (args: unknown) => {
        const { id } = getWorkflowSchema.parse(args);
        return await client.getWorkflow(id);
      },
    },
  };
}
