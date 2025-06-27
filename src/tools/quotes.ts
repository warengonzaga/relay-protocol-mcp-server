/**
 * MCP Tools for Quote Generation
 * 
 * This module provides tools for generating executable quotes for cross-chain bridging
 * and token swapping operations. Quotes include detailed transaction steps, fee breakdowns,
 * and all necessary data for execution.
 * 
 * @module tools/quotes
 */

import { z } from 'zod';
import { RelayClient } from '../client/RelayClient.js';

/**
 * Zod schema for validating quote request parameters.
 * Defines all required and optional parameters for generating bridge/swap quotes.
 */
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

/**
 * Creates MCP tools for generating executable quotes.
 * 
 * This function returns tools that provide comprehensive quote generation
 * for both cross-chain bridging and same-chain swapping operations.
 * 
 * @param {RelayClient} client - Configured Relay Protocol API client
 * @returns {Object} Object containing quote-related MCP tools
 * 
 * @example
 * ```typescript
 * const client = new RelayClient('https://api.relay.link');
 * const quoteTools = createQuoteTools(client);
 * 
 * // Get bridge quote from Ethereum to Optimism
 * const quote = await quoteTools.relay_get_quote.handler({
 *   user: '0x742d35Cc6AbC5A1c7F2Cb4a5c5b3Bc1234567890',
 *   originChainId: 1,
 *   destinationChainId: 10,
 *   originCurrency: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
 *   destinationCurrency: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
 *   amount: '1000000'
 * });
 * ```
 */
export function createQuoteTools(client: RelayClient) {
  return {
    /**
     * MCP Tool: Generate executable bridge/swap quote
     * 
     * Creates comprehensive quotes for bridging tokens between different blockchains
     * or swapping tokens within the same chain. Returns executable transaction steps,
     * detailed fee breakdowns, and timing estimates.
     * 
     * Key Features:
     * - Cross-chain bridging between any supported networks
     * - Same-chain token swapping capabilities
     * - Detailed fee breakdown (gas, relayer, service fees)
     * - Time estimates for completion
     * - Balance validation and requirements
     * - Complete transaction data for execution
     * 
     * Trade Types:
     * - EXACT_INPUT: Specify exact input amount, get estimated output
     * - EXACT_OUTPUT: Specify exact output amount, get required input
     * - EXPECTED_OUTPUT: Get expected output for given input
     * 
     * Important Notes:
     * - Always use token CONTRACT ADDRESSES, never symbols
     * - Use relay_get_currencies to find correct token addresses
     * - Amount must be in smallest unit (wei for ETH, 6 decimals for USDC)
     * - Same origin/destination chain IDs = swap, different = bridge
     * 
     * Common Use Cases:
     * - Bridge USDC Ethereum → Optimism
     * - Bridge USDC Ethereum → Base  
     * - Swap USDC → WETH on Ethereum
     * - Bridge ETH Ethereum → Polygon
     */
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
      /**
       * Handler function for the relay_get_quote tool.
       * 
       * @param {unknown} args - Raw arguments from MCP client
       * @returns {Promise<Quote>} Executable quote with transaction steps and fees
       * @throws {ZodError} When arguments don't match the expected schema
       * @throws {RelayAPIError} When quote cannot be generated or parameters are invalid
       */
      handler: async (args: unknown) => {
        const params = getQuoteSchema.parse(args);
        return await client.getQuote(params);
      },
    },

  };
}
