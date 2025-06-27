import { z } from 'zod';
import { RelayClient } from '../client/RelayClient.js';

const transactionIndexSchema = z.object({
  txHash: z.string().describe('Transaction hash to index'),
  chainId: z.number().describe('Chain ID where the transaction occurred'),
  requestId: z.string().optional().describe('Optional request ID to associate with the transaction'),
});

export function createTransactionTools(client: RelayClient) {
  return {
    relay_transactions_index: {
      name: 'relay_transactions_index',
      description: 'Notify the Relay backend about a transaction. This is used to index and track transactions for cross-chain operations.',
      inputSchema: {
        type: 'object',
        properties: {
          txHash: {
            type: 'string',
            description: 'Transaction hash to index'
          },
          chainId: {
            type: 'number',
            description: 'Chain ID where the transaction occurred'
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
  };
}
