import { z } from 'zod';
import { RelayClient } from '../client/RelayClient.js';

const getTokenPriceSchema = z.object({
  chainId: z.number().describe('The chain ID where the token exists'),
  currency: z.string().describe('The currency/token symbol (e.g., "usdc", "eth", "wbtc")'),
});

export function createPriceTools(client: RelayClient) {
  return {
    relay_get_token_price: {
      name: 'relay_get_token_price',
      description: 'Get the current price of a token on a specific chain. Useful for checking token values before bridging or swapping.',
      inputSchema: {
        type: 'object',
        properties: {
          chainId: {
            type: 'number',
            description: 'The chain ID where the token exists'
          },
          currency: {
            type: 'string',
            description: 'The currency/token symbol (e.g., "usdc", "eth", "wbtc")'
          }
        },
        required: ['chainId', 'currency'],
        additionalProperties: false
      },
      handler: async (args: unknown) => {
        const { chainId, currency } = getTokenPriceSchema.parse(args);
        return await client.getTokenPrice(chainId, currency);
      },
    },
  };
}
