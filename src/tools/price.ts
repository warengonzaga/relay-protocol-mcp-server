/**
 * MCP Tools for Token Price Queries
 * 
 * This module provides tools for retrieving real-time token prices across supported
 * blockchain networks. It enables price discovery for any supported token using
 * contract addresses and chain IDs.
 * 
 * @module tools/price
 */

import { z } from 'zod';
import { RelayClient } from '../client/RelayClient.js';

/**
 * Zod schema for validating token price query parameters.
 * Ensures chain ID is a number and address is a valid string.
 */
const getTokenPriceSchema = z.object({
  chainId: z.number().describe('The chain ID where the token exists'),
  address: z.string().describe('The token contract address (e.g., "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" for USDC)'),
});

/**
 * Creates MCP tools for querying real-time token prices.
 * 
 * This function returns tools that provide access to current market prices
 * for any supported token on any supported blockchain network. Prices are
 * returned with timestamps for freshness validation.
 * 
 * @param {RelayClient} client - Configured Relay Protocol API client
 * @returns {Object} Object containing price-related MCP tools
 * 
 * @example
 * ```typescript
 * const client = new RelayClient('https://api.relay.link');
 * const priceTools = createPriceTools(client);
 * 
 * // Get USDC price on Ethereum
 * const usdcPrice = await priceTools.relay_get_token_price.handler({
 *   chainId: 1,
 *   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
 * });
 * ```
 */
export function createPriceTools(client: RelayClient) {
  return {
    /**
     * MCP Tool: Get real-time token price
     * 
     * Retrieves the current market price for any supported token on a specific
     * blockchain network. This tool requires the token's contract address
     * (not symbol) and returns price data with timestamps.
     * 
     * Key Features:
     * - Real-time price data from multiple sources
     * - Support for all major tokens across supported chains
     * - Price data includes currency and timestamp
     * - Essential for calculating transaction values
     * 
     * Important Notes:
     * - Always use contract addresses, not token symbols
     * - Use relay_get_currencies to find token addresses
     * - Addresses should be checksummed for best results
     * 
     * Common Token Examples:
     * - USDC on Ethereum: 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
     * - WETH on Optimism: 0x4200000000000000000000000000000000000006
     * - USDC on Base: 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913
     */
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
      /**
       * Handler function for the relay_get_token_price tool.
       * 
       * @param {unknown} args - Raw arguments from MCP client
       * @returns {Promise<TokenPrice>} Current price data with timestamp
       * @throws {ZodError} When arguments don't match the expected schema
       * @throws {RelayAPIError} When token is not found or invalid parameters
       */
      handler: async (args: unknown) => {
        const { chainId, address } = getTokenPriceSchema.parse(args);
        return await client.getTokenPrice(chainId, address);
      },
    },
  };
}
