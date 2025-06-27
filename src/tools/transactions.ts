import { z } from 'zod';
import { RelayClient } from '../client/RelayClient.js';

const transactionIndexSchema = z.object({
  txHash: z.string().describe('Transaction hash to index'),
  chainId: z.string().describe('Chain ID where the transaction occurred'),
  requestId: z.string().optional().describe('Optional request ID to associate with the transaction'),
});

const transactionSingleSchema = z.object({
  requestId: z.string().describe('Request ID to associate with the transaction'),
  chainId: z.string().describe('Chain ID where the transaction occurred'),
  tx: z.string().describe('Transaction hash or transaction data'),
});

export function createTransactionTools(client: RelayClient) {
  return {
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
      handler: async (args: unknown) => {
        const params = transactionIndexSchema.parse(args);
        return await client.indexTransaction(params);
      },
    },

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
      handler: async (args: unknown) => {
        const params = transactionSingleSchema.parse(args);
        return await client.indexTransactionSingle(params);
      },
    },
  };
}
