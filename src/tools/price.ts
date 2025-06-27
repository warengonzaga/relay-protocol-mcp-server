import { z } from 'zod';
import { RelayClient } from '../client/RelayClient.js';

const getTokenPriceSchema = z.object({
  chainId: z.number().describe('The chain ID where the token exists'),
  address: z.string().describe('The token contract address (e.g., "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" for USDC)'),
});

export function createPriceTools(client: RelayClient) {
  return {
    relay_get_token_price: {
      name: 'relay_get_token_price',
      description: 'Get the current price of a token on a specific chain. Requires the token contract address, not symbol. Use relay_get_currencies to find token addresses.\n\nExamples:\n• USDC on Ethereum: chainId=1, address="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"\n• WETH on Optimism: chainId=10, address="0x4200000000000000000000000000000000000006"\n• USDC on Base: chainId=8453, address="0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"',
      inputSchema: {
        type: 'object',
        properties: {
          chainId: {
            type: 'number',
            description: 'The chain ID where the token exists (e.g., 1 for Ethereum, 10 for Optimism)'
          },
          address: {
            type: 'string',
            description: 'The token contract address (e.g., "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" for USDC on Ethereum)'
          }
        },
        required: ['chainId', 'address'],
        additionalProperties: false
      },
      handler: async (args: unknown) => {
        const { chainId, address } = getTokenPriceSchema.parse(args);
        return await client.getTokenPrice(chainId, address);
      },
    },
  };
}
