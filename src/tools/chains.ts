import { z } from 'zod';
import { RelayClient } from '../client/RelayClient.js';

const getChainsSchema = z.object({
  includeChains: z.string().optional().describe('Comma-separated list of chain IDs to include'),
});

export function createChainTools(client: RelayClient) {
  return {
    relay_get_chains: {
      name: 'relay_get_chains',
      description: 'Get all supported chains for cross-chain operations. Returns detailed information about each chain including RPC URLs, explorers, currencies, and supported tokens.\n\nCommon Chain IDs:\n• Ethereum: 1\n• Optimism: 10\n• Polygon: 137\n• Arbitrum: 42161\n• Base: 8453\n• BNB Chain: 56\n\nOptional: Use includeChains parameter to filter specific chains (comma-separated chain IDs).',
      inputSchema: {
        type: 'object',
        properties: {
          includeChains: {
            type: 'string',
            description: 'Comma-separated list of chain IDs to include'
          }
        },
        additionalProperties: false
      },
      handler: async (args: unknown) => {
        const { includeChains } = getChainsSchema.parse(args);
        return await client.getChains(includeChains);
      },
    },
  };
}
