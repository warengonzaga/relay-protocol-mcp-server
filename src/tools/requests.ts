import { z } from 'zod';
import { RelayClient } from '../client/RelayClient.js';

const getExecutionStatusSchema = z.object({
  requestId: z.string().describe('The ID of the cross-chain request to check status for'),
});

const getRequestsSchema = z.object({
  limit: z.number().min(1).max(50).optional().describe('Limit the number of results (1-50, default: 20)'),
  continuation: z.string().optional().describe('Continuation token for pagination'),
  user: z.string().optional().describe('Filter by user address'),
  hash: z.string().optional().describe('Filter by transaction hash'),
  originChainId: z.number().optional().describe('Filter by origin chain ID'),
  destinationChainId: z.number().optional().describe('Filter by destination chain ID'),
  privateChainsToInclude: z.string().optional().describe('Private chains to include'),
  id: z.string().optional().describe('Filter by request ID'),
  startTimestamp: z.number().optional().describe('Start timestamp filter'),
  endTimestamp: z.number().optional().describe('End timestamp filter'),
  startBlock: z.number().optional().describe('Start block filter'),
  endBlock: z.number().optional().describe('End block filter'),
  chainId: z.string().optional().describe('Filter by chain ID (either direction)'),
  referrer: z.string().optional().describe('Filter by referrer'),
  sortBy: z.enum(['createdAt', 'updatedAt']).optional().describe('Sort field'),
  sortDirection: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
});

export function createRequestTools(client: RelayClient) {
  return {
    relay_get_execution_status: {
      name: 'relay_get_execution_status',
      description: 'Get the current execution status of a cross-chain request. Returns status, transaction hash, and other execution details.\n\nWhen to use: After executing a quote/swap, use the requestId from the response to monitor progress.\nRequest ID format: Hex string starting with "0x" (e.g., "0x1234abcd...")\nStatus values: "pending", "success", "failed", "insufficient-balance"\n\nExample workflow: relay_get_quote → get requestId → relay_get_execution_status',
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



    relay_get_requests: {
      name: 'relay_get_requests',
      description: 'Get all cross-chain transactions with advanced filtering and pagination.\n\nUse Cases:\n• List all transactions for a specific user\n• Find transactions by hash, chain IDs, or time range\n• Monitor transaction history with pagination\n• Filter by request status and referrer\n\nPagination: Use limit (max 50) and continuation token for large result sets.\nSorting: Sort by createdAt or updatedAt in asc/desc order.',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            minimum: 1,
            maximum: 50,
            description: 'Limit the number of results (1-50, default: 20)'
          },
          continuation: {
            type: 'string',
            description: 'Continuation token for pagination'
          },
          user: {
            type: 'string',
            description: 'Filter by user address'
          },
          hash: {
            type: 'string',
            description: 'Filter by transaction hash'
          },
          originChainId: {
            type: 'number',
            description: 'Filter by origin chain ID'
          },
          destinationChainId: {
            type: 'number',
            description: 'Filter by destination chain ID'
          },
          privateChainsToInclude: {
            type: 'string',
            description: 'Private chains to include'
          },
          id: {
            type: 'string',
            description: 'Filter by request ID'
          },
          startTimestamp: {
            type: 'number',
            description: 'Start timestamp filter (Unix timestamp)'
          },
          endTimestamp: {
            type: 'number',
            description: 'End timestamp filter (Unix timestamp)'
          },
          startBlock: {
            type: 'number',
            description: 'Start block filter'
          },
          endBlock: {
            type: 'number',
            description: 'End block filter'
          },
          chainId: {
            type: 'string',
            description: 'Filter by chain ID (either direction, overrides origin/destination filters)'
          },
          referrer: {
            type: 'string',
            description: 'Filter by referrer address'
          },
          sortBy: {
            type: 'string',
            enum: ['createdAt', 'updatedAt'],
            description: 'Sort field (default: createdAt)'
          },
          sortDirection: {
            type: 'string',
            enum: ['asc', 'desc'],
            description: 'Sort direction'
          }
        },
        additionalProperties: false
      },
      handler: async (args: unknown) => {
        const params = getRequestsSchema.parse(args);
        return await client.getRequests(params);
      },
    },
  };
}
