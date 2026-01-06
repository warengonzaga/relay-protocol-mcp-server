/**
 * MCP Tools for Currency Discovery and Metadata
 * 
 * This module provides tools for discovering and querying supported tokens (currencies)
 * across all blockchain networks in the Relay Protocol ecosystem. It enables comprehensive
 * token search, filtering, and metadata retrieval with advanced filtering capabilities.
 * 
 * @module tools/currencies
 */

import { z } from 'zod';
import type { RelayClient } from '../client/RelayClient.js';

/**
 * Zod schema for validating currency search and filtering parameters.
 * Supports comprehensive filtering options for finding specific tokens.
 */
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
 * Handler function for currency discovery.
 * 
 * This function implements comprehensive error handling for currency queries,
 * transforming Zod validation errors into user-friendly messages and
 * passing through API errors from the RelayClient.
 * 
 * @param {RelayClient} client - Configured Relay Protocol API client
 * @returns {Function} Async handler function for currency queries
 */
function handleGetCurrencies(client: RelayClient) {
  return async (args: unknown) => {
    try {
      const validated = getCurrenciesSchema.parse(args);
      return await client.getCurrencies(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid arguments: ${error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
      }
      throw error;
    }
  };
}

/**
 * Creates MCP tools for currency discovery and metadata queries.
 * 
 * This function returns tools that provide comprehensive token discovery
 * capabilities across all supported blockchain networks, with powerful
 * filtering options for finding specific tokens by various criteria.
 * 
 * @param {RelayClient} client - Configured Relay Protocol API client
 * @returns {Object} Object containing currency discovery MCP tools
 * 
 * @example
 * ```typescript
 * const client = new RelayClient('https://api.relay.link');
 * const currencyTools = createCurrencyTools(client);
 * 
 * // Find USDC on all supported chains
 * const usdcTokens = await currencyTools.relay_get_currencies.handler({
 *   term: 'usdc',
 *   verified: true,
 *   limit: 10
 * });
 * 
 * // Get verified tokens on Ethereum
 * const ethTokens = await currencyTools.relay_get_currencies.handler({
 *   chainIds: [1],
 *   verified: true,
 *   defaultList: true
 * });
 * ```
 */
export function createCurrencyTools(client: RelayClient) {
  return {
    /**
     * MCP Tool: Get currency metadata from curated token list
     * 
     * Provides comprehensive token discovery across all supported blockchain networks
     * with advanced filtering capabilities. This tool is essential for finding
     * token contract addresses needed for quotes, price queries, and swaps.
     * 
     * Key Features:
     * - Search by token symbol, name, or contract address
     * - Filter by blockchain networks (chain IDs)
     * - Verified token filtering to avoid scams/fakes
     * - Default curated token lists for major tokens
     * - External search capabilities for unlisted tokens
     * - Deposit address bridging support filtering
     * - Comprehensive metadata including decimals, logos, verification status
     * 
     * Search Capabilities:
     * - Text Search: Find tokens by symbol (e.g., "USDC", "ETH", "WBTC")
     * - Address Search: Look up tokens by contract address
     * - Chain Filtering: Limit results to specific blockchain networks
     * - Verification: Filter for verified/trusted tokens only
     * - Cross-Chain: Find the same token across multiple chains
     * 
     * Common Use Cases:
     * - Find token contract addresses for quote generation
     * - Discover available tokens on specific chains
     * - Verify token authenticity and metadata
     * - Search for bridgeable tokens between chains
     * - Find tokens that support deposit address bridging
     * 
     * Security Best Practices:
     * - Always use verified=true to avoid scam tokens
     * - Cross-reference contract addresses from official sources
     * - Use defaultList=true for major, well-known tokens
     * - Verify token symbols match expected tokens
     */
    relay_get_currencies: {
      name: 'relay_get_currencies',
      description: 'Get currencies metadata from a curated list. Supports filtering by chain IDs, search terms, addresses, and other criteria.\n\nCommon Examples:\n• Find USDC on specific chains: {"chainIds": [1, 10, 8453], "term": "usdc", "verified": true, "limit": 10}\n• All major tokens on Ethereum: {"chainIds": [1], "defaultList": true, "limit": 20}\n• Search by contract address: {"address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "includeAllChains": true}\n• Verified tokens only: {"verified": true, "limit": 50}\n• Deposit-address supported tokens: {"depositAddressOnly": true}\n\nTip: Use verified=true to avoid scam/fake tokens. Use term to search by symbol/name.',
      inputSchema: {
        type: 'object',
        properties: {
          defaultList: {
            type: 'boolean',
            description: 'Return default currencies from curated list'
          },
          chainIds: {
            type: 'array',
            items: { type: 'number' },
            description: 'Chain IDs to search for currencies (e.g., [1, 10, 137] for Ethereum, Optimism, Polygon)'
          },
          term: {
            type: 'string',
            description: 'Search term for currencies (symbol, name, or partial match)'
          },
          address: {
            type: 'string',
            description: 'Token contract address to search for'
          },
          currencyId: {
            type: 'string',
            description: 'Specific currency ID to retrieve'
          },
          tokens: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of token identifiers in format chainId:address (e.g., ["1:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"])'
          },
          verified: {
            type: 'boolean',
            description: 'Filter for verified currencies only (recommended to avoid scam tokens)'
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
            description: 'Use 3rd party APIs to search for tokens not indexed by Relay'
          },
          depositAddressOnly: {
            type: 'boolean',
            description: 'Return only currencies supported with deposit address bridging'
          }
        },
        additionalProperties: false
      },
      handler: handleGetCurrencies(client)
    }
  };
}
