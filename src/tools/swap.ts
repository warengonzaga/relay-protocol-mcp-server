import { z } from 'zod';
import type { RelayClient } from '../client/RelayClient.js';

// Schema for swap transaction
const swapTxSchema = z.object({
  to: z.string(),
  value: z.string(),
  data: z.string(),
});

// Schema for swap origin
const swapOriginSchema = z.object({
  chainId: z.number(),
  currency: z.string(),
  amount: z.string(),
  user: z.string().optional(),
});

// Schema for swap multi-input request
const swapMultiInputSchema = z.object({
  user: z.string(),
  origins: z.array(swapOriginSchema),
  destinationCurrency: z.string(),
  destinationChainId: z.number(),
  tradeType: z.enum(['EXACT_INPUT', 'EXACT_OUTPUT']),
  recipient: z.string().optional(),
  refundTo: z.string().optional(),
  amount: z.string().optional(),
  txs: z.array(swapTxSchema).optional(),
  txsGasLimit: z.number().optional(),
  partial: z.boolean().optional(),
  referrer: z.string().optional(),
  gasLimitForDepositSpecifiedTxs: z.number().optional(),
});

/**
 * Get executable quote for swapping tokens from multiple origin chains
 */
function handleSwapMultiInput(client: RelayClient) {
  return async (args: unknown) => {
    try {
      const validated = swapMultiInputSchema.parse(args);
      return await client.swapMultiInput(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid arguments: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
      }
      throw error;
    }
  };
}

export function createSwapTools(client: RelayClient) {
  return {
    relay_swap_multi_input: {
      name: 'relay_swap_multi_input',
      description: 'Execute multi-chain token swaps. IMPORTANT: For EXACT_INPUT, do NOT include "amount" at root level - only in origins array. For EXACT_OUTPUT, include "amount" at root level. Always use TOKEN CONTRACT ADDRESSES. Examples:\n\nEXACT_INPUT (Bridge 1 USDC from Ethereum to Optimism): {"user": "0x123...", "origins": [{"chainId": 1, "currency": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "amount": "1000000"}], "destinationChainId": 10, "destinationCurrency": "0x0b2c639c533813f4aa9d7837caf62653d097ff85", "tradeType": "EXACT_INPUT"}\n\nEXACT_OUTPUT (Get exactly 100 USDC on Base): {"user": "0x123...", "amount": "100000000", "origins": [{"chainId": 1, "currency": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "amount": "50000000"}], "destinationChainId": 8453, "destinationCurrency": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", "tradeType": "EXACT_OUTPUT"}',
      inputSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'string',
            description: 'User wallet address that will make deposits and receive tokens'
          },
          origins: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                chainId: {
                  type: 'number',
                  description: 'Origin chain ID (e.g., 1 for Ethereum, 10 for Optimism, 137 for Polygon)'
                },
                currency: {
                  type: 'string',
                  description: 'Token contract address (e.g., "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" for USDC on Ethereum)'
                },
                amount: {
                  type: 'string',
                  description: 'Amount in smallest unit (e.g., "1000000" = 1 USDC with 6 decimals)'
                },
                user: {
                  type: 'string',
                  description: 'Optional: different user address for this specific origin'
                }
              },
              required: ['chainId', 'currency', 'amount'],
              additionalProperties: false
            },
            description: 'Array of origin tokens to swap from multiple chains'
          },
          destinationCurrency: {
            type: 'string',
            description: 'Destination token contract address (e.g., "0x0b2c639c533813f4aa9d7837caf62653d097ff85" for USDC on Optimism)'
          },
          destinationChainId: {
            type: 'number',
            description: 'Destination chain ID (e.g., 10 for Optimism, 8453 for Base, 42161 for Arbitrum)'
          },
          tradeType: {
            type: 'string',
            enum: ['EXACT_INPUT', 'EXACT_OUTPUT'],
            description: 'EXACT_INPUT: Use exact amounts from origins. EXACT_OUTPUT: Get exact amount at destination (requires "amount" field)'
          },
          recipient: {
            type: 'string',
            description: 'Optional: recipient address (defaults to user address)'
          },
          refundTo: {
            type: 'string',
            description: 'Optional: refund address in case of failure'
          },
          amount: {
            type: 'string',
            description: 'ONLY for EXACT_OUTPUT: exact amount to receive at destination (in smallest unit)'
          },
          txs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                to: { type: 'string', description: 'Transaction recipient address' },
                value: { type: 'string', description: 'ETH value to send' },
                data: { type: 'string', description: 'Transaction calldata' }
              },
              required: ['to', 'value', 'data'],
              additionalProperties: false
            },
            description: 'Optional: additional transactions to execute'
          },
          txsGasLimit: {
            type: 'number',
            description: 'Gas limit for additional transactions'
          },
          partial: {
            type: 'boolean',
            description: 'Allow partial fills if full amount not available'
          },
          referrer: {
            type: 'string',
            description: 'Referrer address for fee sharing'
          },
          gasLimitForDepositSpecifiedTxs: {
            type: 'number',
            description: 'Gas limit for deposit-specified transactions'
          }
        },
        required: ['user', 'origins', 'destinationCurrency', 'destinationChainId', 'tradeType'],
        additionalProperties: false
      },
      handler: handleSwapMultiInput(client)
    }
  };
}
