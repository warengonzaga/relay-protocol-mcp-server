import { z } from 'zod';
import { RelayClient } from '../client/RelayClient.js';

const getExecutionStatusSchema = z.object({
  requestId: z.string().describe('The ID of the cross-chain request to check status for'),
});

const getRequestSchema = z.object({
  requestId: z.string().describe('The ID of the cross-chain request to retrieve details for'),
});

export function createRequestTools(client: RelayClient) {
  return {
    relay_get_execution_status: {
      name: 'relay_get_execution_status',
      description: 'Get the current execution status of a cross-chain request. Returns status, transaction hash, and other execution details.',
      inputSchema: {
        type: 'object',
        properties: {
          requestId: {
            type: 'string',
            description: 'The ID of the cross-chain request to check status for'
          }
        },
        required: ['requestId'],
        additionalProperties: false
      },
      handler: async (args: unknown) => {
        const { requestId } = getExecutionStatusSchema.parse(args);
        return await client.getExecutionStatus(requestId);
      },
    },

    relay_get_request: {
      name: 'relay_get_request',
      description: 'Get detailed information about a specific cross-chain request including origin/destination chains, currencies, amounts, and current status.',
      inputSchema: {
        type: 'object',
        properties: {
          requestId: {
            type: 'string',
            description: 'The ID of the cross-chain request to retrieve details for'
          }
        },
        required: ['requestId'],
        additionalProperties: false
      },
      handler: async (args: unknown) => {
        const { requestId } = getRequestSchema.parse(args);
        return await client.getRequest(requestId);
      },
    },
  };
}
