/**
 * MCP Tools for Transaction Indexing and Notification
 * 
 * This module provides tools for notifying the Relay Protocol backend about
 * transactions to enable proper indexing, tracking, and status monitoring.
 * These tools are essential for linking executed transactions with cross-chain requests.
 * 
 * @module tools/transactions
 */

import { z } from 'zod';
import { RelayClient } from '../client/RelayClient.js';

/**
 * Zod schema for validating transaction indexing parameters.
 * Used for general transaction notification and indexing.
 */
const transactionIndexSchema = z.object({
  txHash: z.string().describe('Transaction hash to index'),
  chainId: z.string().describe('Chain ID where the transaction occurred'),
  requestId: z.string().optional().describe('Optional request ID to associate with the transaction'),
});

/**
 * Zod schema for validating single transaction indexing parameters.
 * Used for indexing specific transfers, wraps, and unwraps within transactions.
 */
const transactionSingleSchema = z.object({
  requestId: z.string().describe('Request ID to associate with the transaction'),
  chainId: z.string().describe('Chain ID where the transaction occurred'),
  tx: z.string().describe('Transaction hash or transaction data'),
});

/**
 * Creates MCP tools for transaction indexing and notification.
 * 
 * This function returns tools that enable proper transaction tracking by
 * notifying the Relay Protocol backend about executed transactions. This
 * is essential for status monitoring and request lifecycle management.
 * 
 * @param {RelayClient} client - Configured Relay Protocol API client
 * @returns {Object} Object containing transaction indexing MCP tools
 * 
 * @example
 * ```typescript
 * const client = new RelayClient('https://api.relay.link');
 * const txTools = createTransactionTools(client);
 * 
 * // Index a transaction after execution
 * await txTools.relay_transactions_index.handler({
 *   txHash: '0xabcdef1234567890...',
 *   chainId: '1',
 *   requestId: '0x1234567890abcdef...'
 * });
 * 
 * // Index specific transfers within a transaction
 * await txTools.relay_transactions_single.handler({
 *   requestId: '0x1234567890abcdef...',
 *   chainId: '1',
 *   tx: '0xabcdef1234567890...'
 * });
 * ```
 */
export function createTransactionTools(client: RelayClient) {
  return {
    /**
     * MCP Tool: Index transaction for cross-chain operation tracking
     * 
     * Notifies the Relay Protocol backend about a transaction to enable proper
     * indexing and status monitoring. This tool should be called after executing
     * transactions returned from quote responses to ensure proper tracking.
     * 
     * Key Features:
     * - Links transactions to cross-chain requests
     * - Enables status monitoring via relay_get_execution_status
     * - Required for proper transaction lifecycle tracking
     * - Supports both origin and destination chain transactions
     * 
     * When to Use:
     * - After executing the deposit transaction from a quote response
     * - When you want Relay to track a specific transaction
     * - To enable proper status monitoring and notifications
     * - For linking transactions to request IDs for analytics
     * 
     * Workflow:
     * 1. Get quote using relay_get_quote
     * 2. Execute the transaction steps from the quote
     * 3. Call this tool with the transaction hash and chain ID
     * 4. Optionally include request ID for proper linking
     * 5. Monitor progress using relay_get_execution_status
     */
    relay_transactions_index: {
      name: 'relay_transactions_index',
      description: 'Notify the Relay backend about a transaction. This is used to index and track transactions for cross-chain operations.\n\nWhen to use:\n• After executing a transaction from a quote response\n• When you want Relay to track a specific transaction\n• For proper status monitoring and request linking\n\nExample: After sending the deposit transaction from relay_get_quote response, call this tool with the transaction hash and chain ID to enable proper tracking.\n\nRequired: txHash (0x...), chainId (number)\nOptional: requestId (from quote response for linking)',
      inputSchema: {
        type: 'object',
        properties: {
          txHash: {
            type: 'string',
            description: 'Transaction hash to index'
          },
          chainId: {
            type: 'string',
            description: 'Chain ID where the transaction occurred (as string, e.g., "1" for Ethereum, "10" for Optimism)'
          },
          requestId: {
            type: 'string',
            description: 'Optional request ID to associate with the transaction'
          }
        },
        required: ['txHash', 'chainId'],
        additionalProperties: false
      },
      /**
       * Handler function for the relay_transactions_index tool.
       * 
       * @param {unknown} args - Raw arguments from MCP client
       * @returns {Promise<{message: string}>} Confirmation message from the backend
       * @throws {ZodError} When arguments don't match the expected schema
       * @throws {RelayAPIError} When transaction data is invalid or backend error occurs
       */
      handler: async (args: unknown) => {
        const params = transactionIndexSchema.parse(args);
        return await client.indexTransaction(params);
      },
    },

    /**
     * MCP Tool: Index specific transfers, wraps, and unwraps
     * 
     * Notifies the Relay Protocol backend to index specific operations within
     * a transaction, particularly transfers, wrap operations, and unwrap operations.
     * This provides more granular tracking than the general transaction indexing.
     * 
     * Key Features:
     * - Indexes specific transfer events within transactions
     * - Tracks wrap/unwrap operations (e.g., ETH ↔ WETH)
     * - Associates specific transaction data with request IDs
     * - Enables detailed operation-level monitoring
     * 
     * When to Use:
     * - Index specific transfers within a complex transaction
     * - Track wrap/unwrap operations separately
     * - Associate detailed transaction data with request IDs
     * - Monitor specific operation types within broader transactions
     * 
     * Difference from relay_transactions_index:
     * - This tool is for specific operation indexing (transfers, wraps, unwraps)
     * - relay_transactions_index is for general transaction tracking
     * - This requires a request ID, while the other makes it optional
     * - This is more granular and operation-specific
     */
    relay_transactions_single: {
      name: 'relay_transactions_single',
      description: 'Notify the Relay backend to index transfers, wraps and unwraps for a specific transaction.\n\nWhen to use:\n• Index specific transfers within a transaction\n• Track wrap/unwrap operations\n• Associate transaction data with a request ID\n\nDifference from relay_transactions_index:\n• This is for indexing specific transfers/wraps/unwraps\n• relay_transactions_index is for general transaction tracking\n\nRequired: requestId, chainId (string), tx (transaction hash)',
      inputSchema: {
        type: 'object',
        properties: {
          requestId: {
            type: 'string',
            description: 'Request ID to associate with the transaction'
          },
          chainId: {
            type: 'string',
            description: 'Chain ID where the transaction occurred (as string, e.g., "1" for Ethereum, "10" for Optimism)'
          },
          tx: {
            type: 'string',
            description: 'Transaction hash to index (0x...)'
          }
        },
        required: ['requestId', 'chainId', 'tx'],
        additionalProperties: false
      },
      /**
       * Handler function for the relay_transactions_single tool.
       * 
       * @param {unknown} args - Raw arguments from MCP client
       * @returns {Promise<{message: string}>} Confirmation message from the backend
       * @throws {ZodError} When arguments don't match the expected schema
       * @throws {RelayAPIError} When transaction data is invalid or backend error occurs
       */
      handler: async (args: unknown) => {
        const params = transactionSingleSchema.parse(args);
        return await client.indexTransactionSingle(params);
      },
    },
  };
}
