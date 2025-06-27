import { z } from 'zod';
import { RelayClient } from '../client/RelayClient.js';

const getQuoteSchema = z.object({
  user: z.string().describe('User wallet address'),
  recipient: z.string().optional().describe('Recipient wallet address (defaults to user address)'),
  originChainId: z.number().describe('Source chain ID'),
  destinationChainId: z.number().describe('Destination chain ID'),
  originCurrency: z.string().describe('Source token contract address (use relay_get_currencies to find addresses)'),
  destinationCurrency: z.string().describe('Destination token contract address (use relay_get_currencies to find addresses)'),
  amount: z.string().describe('Amount in smallest unit (e.g., wei for ETH, 6 decimals for USDC)'),
  tradeType: z.enum(['EXACT_INPUT', 'EXACT_OUTPUT', 'EXPECTED_OUTPUT']).optional().describe('Trade type for the quote'),
});

export function createQuoteTools(client: RelayClient) {
  return {
    relay_get_quote: {
      name: 'relay_get_quote',
      description: 'Get an executable quote for bridging tokens between chains or swapping within a chain. Always use TOKEN CONTRACT ADDRESSES, not symbols. Use relay_get_currencies to find token addresses.\n\nCommon Examples:\n• Bridge USDC Ethereum→Optimism: user="0x123...", originChainId=1, destinationChainId=10, originCurrency="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", destinationCurrency="0x0b2c639c533813f4aa9d7837caf62653d097ff85", amount="1000000", tradeType="EXACT_INPUT"\n• Bridge USDC Ethereum→Base: originChainId=1, destinationChainId=8453, destinationCurrency="0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"\n• Same-chain swap on Ethereum: originChainId=1, destinationChainId=1, different token addresses\n\nToken Format: Always use contract addresses (checksummed preferred)\nAmount Format: Smallest unit - "1000000"=1 USDC, "1000000000000000000"=1 ETH',
      inputSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'string',
            description: 'User wallet address'
          },
          recipient: {
            type: 'string',
            description: 'Recipient wallet address (defaults to user address)'
          },
          originChainId: {
            type: 'number',
            description: 'Source chain ID (e.g., 1 for Ethereum, 10 for Optimism, 8453 for Base)'
          },
          destinationChainId: {
            type: 'number',
            description: 'Destination chain ID'
          },
          originCurrency: {
            type: 'string',
            description: 'Source token contract address (e.g., "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" for USDC on Ethereum)'
          },
          destinationCurrency: {
            type: 'string',
            description: 'Destination token contract address (e.g., "0x0b2c639c533813f4aa9d7837caf62653d097ff85" for USDC on Optimism)'
          },
          amount: {
            type: 'string',
            description: 'Amount in smallest unit (e.g., "1000000" = 1 USDC with 6 decimals, "1000000000000000000" = 1 ETH)'
          },
          tradeType: {
            type: 'string',
            enum: ['EXACT_INPUT', 'EXACT_OUTPUT', 'EXPECTED_OUTPUT'],
            description: 'Trade type: EXACT_INPUT (specify input amount), EXACT_OUTPUT (specify exact output), EXPECTED_OUTPUT (expected output)'
          }
        },
        required: ['user', 'originChainId', 'destinationChainId', 'originCurrency', 'destinationCurrency', 'amount'],
        additionalProperties: false
      },
      handler: async (args: unknown) => {
        const params = getQuoteSchema.parse(args);
        return await client.getQuote(params);
      },
    },

  };
}
