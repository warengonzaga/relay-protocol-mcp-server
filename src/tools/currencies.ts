import { z } from 'zod';
import type { RelayClient } from '../client/RelayClient.js';

// Schema for currencies v2 request
const getCurrenciesSchema = z.object({
  defaultList: z.boolean().optional(),
  chainIds: z.array(z.number()).optional(),
  term: z.string().optional(),
  address: z.string().optional(),
  currencyId: z.string().optional(),
  tokens: z.array(z.string()).optional(),
  verified: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional(),
  includeAllChains: z.boolean().optional(),
  useExternalSearch: z.boolean().optional(),
  depositAddressOnly: z.boolean().optional(),
});

/**
 * Get currencies metadata from curated list
 */
function handleGetCurrencies(client: RelayClient) {
  return async (args: unknown) => {
    try {
      const validated = getCurrenciesSchema.parse(args);
      return await client.getCurrencies(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid arguments: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
      }
      throw error;
    }
  };
}

export function createCurrencyTools(client: RelayClient) {
  return {
    relay_get_currencies: {
      name: 'relay_get_currencies',
      description: 'Get currencies metadata from a curated list. Supports filtering by chain IDs, search terms, addresses, and other criteria.\n\nCommon Examples:\n• Find USDC on specific chains: {"chainIds": [1, 10, 8453], "term": "usdc", "verified": true, "limit": 10}\n• All major tokens on Ethereum: {"chainIds": [1], "defaultList": true, "limit": 20}\n• Search by contract address: {"address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "includeAllChains": true}\n• Verified tokens only: {"verified": true, "limit": 50}\n• Deposit-address supported tokens: {"depositAddressOnly": true}\n\nTip: Use verified=true to avoid scam/fake tokens. Use term to search by symbol/name.',
      inputSchema: {
        type: 'object',
        properties: {
          defaultList: {
            type: 'boolean',
            description: 'Return default currencies'
          },
          chainIds: {
            type: 'array',
            items: { type: 'number' },
            description: 'Chain IDs to search for currencies'
          },
          term: {
            type: 'string',
            description: 'Search term for currencies'
          },
          address: {
            type: 'string',
            description: 'Address of the currency contract'
          },
          currencyId: {
            type: 'string',
            description: 'ID to search for a currency'
          },
          tokens: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of token addresses, like: chainId:address'
          },
          verified: {
            type: 'boolean',
            description: 'Filter verified currencies'
          },
          limit: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            description: 'Limit the number of results (default: 20, max: 100)'
          },
          includeAllChains: {
            type: 'boolean',
            description: 'Include all chains for a currency when filtering by chainId and address'
          },
          useExternalSearch: {
            type: 'boolean',
            description: 'Uses 3rd party APIs to search for a token, in case relay does not have it indexed'
          },
          depositAddressOnly: {
            type: 'boolean',
            description: 'Returns only currencies supported with deposit address bridging'
          }
        },
        additionalProperties: false
      },
      handler: handleGetCurrencies(client)
    }
  };
}
