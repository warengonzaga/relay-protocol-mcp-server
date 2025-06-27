import { RelayClient } from '../client/RelayClient.js';
import {
  registerCallbackSchema,
  listCallbacksSchema,
  getCallbackSchema,
  updateCallbackSchema,
  deleteCallbackSchema,
} from '../schemas/callbacks.js';
import { fetchAllPages } from '../utils/pagination.js';
import type { Callback } from '../types/relay.js';

interface Tool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (args: unknown) => Promise<any>;
}

export function createCallbackTools(client: RelayClient): Record<string, Tool> {
  return {
    relay_register_callback: {
      name: 'relay_register_callback',
      description: `Register a new webhook callback.
      
Examples:
- Basic callback: { "url": "https://example.com/webhook", "events": ["job.completed"] }
- All events: { "url": "https://example.com/webhook", "events": ["job.created", "job.started", "job.completed", "job.failed"] }
- With headers: { "url": "https://example.com/webhook", "events": ["job.completed"], "headers": { "X-API-Key": "secret" } }`,
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string", format: "uri", description: "Webhook URL to receive events" },
          events: { 
            type: "array", 
            items: { 
              type: "string", 
              enum: ["job.created", "job.started", "job.completed", "job.failed"] 
            },
            minItems: 1,
            description: "Events to subscribe to" 
          },
          headers: { 
            type: "object", 
            additionalProperties: { type: "string" },
            description: "Custom headers to include in webhook requests" 
          }
        },
        required: ["url", "events"]
      },
      handler: async (args: unknown) => {
        const validated = registerCallbackSchema.parse(args);
        return await client.registerCallback(validated);
      },
    },

    relay_list_callbacks: {
      name: 'relay_list_callbacks',
      description: `List all registered callbacks.
      
Examples:
- Get first page: {}
- Get all callbacks: { "fetchAll": true }`,
      inputSchema: {
        type: "object",
        properties: {
          page: { type: "number", minimum: 1, default: 1, description: "Page number" },
          limit: { type: "number", minimum: 1, maximum: 100, default: 20, description: "Items per page" },
          fetchAll: { type: "boolean", default: false, description: "Automatically fetch all pages (use with caution)" }
        }
      },
      handler: async (args: unknown) => {
        const { page, limit, fetchAll } = listCallbacksSchema.parse(args);

        if (fetchAll) {
          const callbacks = await fetchAllPages<Callback>(
            async (p, l) => client.listCallbacks(p, l),
            {}
          );
          return { callbacks, totalFetched: callbacks.length };
        }

        const response = await client.listCallbacks(page, limit);
        return {
          callbacks: response.data,
          pagination: {
            ...response.pagination,
            nextPage: response.pagination.hasMore ? response.pagination.page + 1 : null,
          },
        };
      },
    },

    relay_get_callback: {
      name: 'relay_get_callback',
      description: 'Get details of a specific callback by ID',
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "Callback ID" }
        },
        required: ["id"]
      },
      handler: async (args: unknown) => {
        const { id } = getCallbackSchema.parse(args);
        return await client.getCallback(id);
      },
    },

    relay_update_callback: {
      name: 'relay_update_callback',
      description: `Update a callback's configuration.
      
Examples:
- Change URL: { "id": "callback-123", "url": "https://new-example.com/webhook" }
- Update events: { "id": "callback-123", "events": ["job.completed", "job.failed"] }
- Disable callback: { "id": "callback-123", "active": false }`,
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "Callback ID to update" },
          url: { type: "string", format: "uri", description: "Updated webhook URL" },
          events: { 
            type: "array", 
            items: { 
              type: "string", 
              enum: ["job.created", "job.started", "job.completed", "job.failed"] 
            },
            minItems: 1,
            description: "Updated event subscriptions" 
          },
          headers: { 
            type: "object", 
            additionalProperties: { type: "string" },
            description: "Updated custom headers" 
          },
          active: { type: "boolean", description: "Enable or disable the callback" }
        },
        required: ["id"]
      },
      handler: async (args: unknown) => {
        const { id, ...updateData } = updateCallbackSchema.parse(args);
        return await client.updateCallback(id, updateData);
      },
    },

    relay_delete_callback: {
      name: 'relay_delete_callback',
      description: 'Delete a callback by ID',
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "Callback ID" }
        },
        required: ["id"]
      },
      handler: async (args: unknown) => {
        const { id } = deleteCallbackSchema.parse(args);
        await client.deleteCallback(id);
        return { success: true, message: `Callback ${id} deleted successfully` };
      },
    },
  };
}
