/**
 * MCP Tools for Request Monitoring and Status Tracking
 * 
 * This module provides tools for monitoring cross-chain requests, tracking execution
 * status, and querying historical transaction data. It enables comprehensive
 * oversight of cross-chain operations from initiation to completion.
 * 
 * @module tools/requests
 */

import { z } from 'zod';
import { RelayClient } from '../client/RelayClient.js';

/**
 * Zod schema for validating execution status query parameters.
 */
const getExecutionStatusSchema = z.object({
  requestId: z.string().describe('The ID of the cross-chain request to check status for'),
});

/**
 * Zod schema for validating request listing and filtering parameters.
 * Supports comprehensive filtering options for querying historical requests.
 */
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

/**
 * Creates MCP tools for monitoring and tracking cross-chain requests.
 * 
 * This function returns tools that provide comprehensive monitoring capabilities
 * for cross-chain operations, including real-time status tracking and historical
 * transaction querying with advanced filtering options.
 * 
 * @param {RelayClient} client - Configured Relay Protocol API client
 * @returns {Object} Object containing request monitoring MCP tools
 * 
 * @example
 * ```typescript
 * const client = new RelayClient('https://api.relay.link');
 * const requestTools = createRequestTools(client);
 * 
 * // Check status of a specific request
 * const status = await requestTools.relay_get_execution_status.handler({
 *   requestId: '0x1234567890abcdef...'
 * });
 * 
 * // Get recent requests for a user
 * const userRequests = await requestTools.relay_get_requests.handler({
 *   user: '0x742d35Cc6AbC5A1c7F2Cb4a5c5b3Bc1234567890',
 *   limit: 10
 * });
 * ```
 */
export function createRequestTools(client: RelayClient) {
  return {
    /**
     * MCP Tool: Get execution status of cross-chain request
     * 
     * Monitors the real-time execution status of a specific cross-chain request,
     * providing detailed progress information, transaction hashes, and completion status.
     * 
     * Key Features:
     * - Real-time status monitoring (pending, success, failed, etc.)
     * - Transaction hash tracking for both origin and destination
     * - Execution time and progress details
     * - Error information when failures occur
     * - Chain-specific transaction details
     * 
     * Status Values:
     * - 'pending': Request is being processed
     * - 'success': Request completed successfully
     * - 'failed': Request failed during execution
     * - 'insufficient-balance': Insufficient funds for execution
     * - 'refund': Funds were refunded due to failure
     * - 'delayed': Request is delayed but still processing
     * - 'waiting': Waiting for user action or confirmation
     * 
     * Workflow:
     * 1. Execute quote using relay_get_quote
     * 2. Get requestId from quote response
     * 3. Use this tool to monitor progress
     * 4. Track until status shows 'success' or 'failed'
     */
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
      /**
       * Handler function for the relay_get_execution_status tool.
       * 
       * @param {unknown} args - Raw arguments from MCP client
       * @returns {Promise<ExecutionStatus>} Current execution status and details
       * @throws {ZodError} When arguments don't match the expected schema
       * @throws {RelayAPIError} When request ID is invalid or not found
       */
      handler: async (args: unknown) => {
        const { requestId } = getExecutionStatusSchema.parse(args);
        return await client.getExecutionStatus(requestId);
      },
    },

    /**
     * MCP Tool: Query historical cross-chain requests
     * 
     * Retrieves paginated lists of cross-chain requests with comprehensive filtering
     * options. Enables analysis of transaction history, user activity patterns,
     * and cross-chain flow monitoring.
     * 
     * Key Features:
     * - Advanced filtering by user, chains, time ranges, transaction hashes
     * - Pagination support for large datasets (max 50 per request)
     * - Sorting by creation or update time
     * - Request status and referrer filtering
     * - Block number range filtering
     * - Continuation tokens for efficient pagination
     * 
     * Common Use Cases:
     * - Monitor all transactions for a specific user address
     * - Track activity between specific chain pairs
     * - Analyze transaction volumes over time periods
     * - Debug specific transactions by hash
     * - Monitor referrer activity and commissions
     * 
     * Pagination Best Practices:
     * - Start with reasonable limit (10-20 items)
     * - Use continuation tokens for next pages
     * - Apply filters to reduce result sets
     * - Sort by timestamp for chronological analysis
     */

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
      /**
       * Handler function for the relay_get_requests tool.
       * 
       * @param {unknown} args - Raw arguments from MCP client
       * @returns {Promise<GetRequestsResponse>} Paginated list of cross-chain requests
       * @throws {ZodError} When arguments don't match the expected schema
       * @throws {RelayAPIError} When filter parameters are invalid
       */
      handler: async (args: unknown) => {
        const params = getRequestsSchema.parse(args);
        return await client.getRequests(params);
      },
    },
  };
}
