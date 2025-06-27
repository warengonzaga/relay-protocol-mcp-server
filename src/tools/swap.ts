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
      description: 'Get an executable quote for swapping tokens from multiple origin chains to a single destination chain. Returns transaction steps and fee breakdown.',
      inputSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'string',
            description: 'User address that will make the deposit on a given origin chain'
          },
          origins: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                chainId: {
                  type: 'number',
                  description: 'Origin chain ID'
                },
                currency: {
                  type: 'string',
                  description: 'Currency address or symbol'
                },
                amount: {
                  type: 'string',
                  description: 'Amount to swap from this origin'
                },
                user: {
                  type: 'string',
                  description: 'Optional user address for this origin'
                }
              },
              required: ['chainId', 'currency', 'amount'],
              additionalProperties: false
            },
            description: 'Array of origin chains, currencies, and amounts to swap from'
          },
          destinationCurrency: {
            type: 'string',
            description: 'Destination currency address or symbol'
          },
          destinationChainId: {
            type: 'number',
            description: 'Destination chain ID'
          },
          tradeType: {
            type: 'string',
            enum: ['EXACT_INPUT', 'EXACT_OUTPUT'],
            description: 'Type of trade - exact input or exact output'
          },
          recipient: {
            type: 'string',
            description: 'Optional recipient address (defaults to user)'
          },
          refundTo: {
            type: 'string',
            description: 'Optional refund address'
          },
          amount: {
            type: 'string',
            description: 'Optional total amount (for EXACT_OUTPUT)'
          },
          txs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                to: { type: 'string' },
                value: { type: 'string' },
                data: { type: 'string' }
              },
              required: ['to', 'value', 'data'],
              additionalProperties: false
            },
            description: 'Optional array of additional transactions'
          },
          txsGasLimit: {
            type: 'number',
            description: 'Gas limit for additional transactions'
          },
          partial: {
            type: 'boolean',
            description: 'Allow partial fills'
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
