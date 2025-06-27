import { z } from 'zod';
import { RelayClient } from '../client/RelayClient.js';

const getQuoteSchema = z.object({
  user: z.string().describe('User wallet address'),
  recipient: z.string().optional().describe('Recipient wallet address (defaults to user address)'),
  originChainId: z.number().describe('Source chain ID'),
  destinationChainId: z.number().describe('Destination chain ID'),
  originCurrency: z.string().describe('Source currency/token symbol'),
  destinationCurrency: z.string().describe('Destination currency/token symbol'),
  amount: z.string().describe('Amount to bridge/swap (in token units)'),
  tradeType: z.enum(['EXACT_INPUT', 'EXACT_OUTPUT']).optional().describe('Trade type for the quote'),
});

const getMultiInputQuoteSchema = z.object({
  user: z.string().describe('User wallet address'),
  recipient: z.string().optional().describe('Recipient wallet address (defaults to user address)'),
  destinationChainId: z.number().describe('Destination chain ID'),
  destinationCurrency: z.string().describe('Destination currency/token symbol'),
  amount: z.string().describe('Total amount to receive on destination'),
  originTokens: z.array(z.object({
    chainId: z.number().describe('Chain ID for this origin token'),
    currency: z.string().describe('Currency/token symbol'),
    amount: z.string().describe('Amount of this token to use'),
  })).describe('Array of origin tokens from different chains'),
});

export function createQuoteTools(client: RelayClient) {
  return {
    relay_get_quote: {
      name: 'relay_get_quote',
      description: 'Get an executable quote for bridging tokens between chains or swapping within a chain. Returns transaction steps, fees, and execution details.',
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
            description: 'Source chain ID'
          },
          destinationChainId: {
            type: 'number',
            description: 'Destination chain ID'
          },
          originCurrency: {
            type: 'string',
            description: 'Source currency/token symbol'
          },
          destinationCurrency: {
            type: 'string',
            description: 'Destination currency/token symbol'
          },
          amount: {
            type: 'string',
            description: 'Amount to bridge/swap (in token units)'
          },
          tradeType: {
            type: 'string',
            enum: ['EXACT_INPUT', 'EXACT_OUTPUT'],
            description: 'Trade type for the quote'
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

    relay_get_multi_input_quote: {
      name: 'relay_get_multi_input_quote',
      description: 'Get a quote for swapping tokens from multiple origin chains to a single destination chain. Useful for aggregating tokens across chains.',
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
          destinationChainId: {
            type: 'number',
            description: 'Destination chain ID'
          },
          destinationCurrency: {
            type: 'string',
            description: 'Destination currency/token symbol'
          },
          amount: {
            type: 'string',
            description: 'Total amount to receive on destination'
          },
          originTokens: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                chainId: {
                  type: 'number',
                  description: 'Chain ID for this origin token'
                },
                currency: {
                  type: 'string',
                  description: 'Currency/token symbol'
                },
                amount: {
                  type: 'string',
                  description: 'Amount of this token to use'
                }
              },
              required: ['chainId', 'currency', 'amount'],
              additionalProperties: false
            },
            description: 'Array of origin tokens from different chains'
          }
        },
        required: ['user', 'destinationChainId', 'destinationCurrency', 'amount', 'originTokens'],
        additionalProperties: false
      },
      handler: async (args: unknown) => {
        const params = getMultiInputQuoteSchema.parse(args);
        return await client.getMultiInputQuote(params);
      },
    },
  };
}
