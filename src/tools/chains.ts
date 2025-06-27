/**
 * MCP Tools for Blockchain Chain Information
 * 
 * This module provides tools for querying information about supported blockchain networks
 * in the Relay Protocol ecosystem. It includes comprehensive chain metadata, supported
 * tokens, contract addresses, and network configuration details.
 * 
 * @module tools/chains
 */

import { z } from 'zod';
import { RelayClient } from '../client/RelayClient.js';

/**
 * Zod schema for validating chain query parameters.
 * Ensures that the includeChains parameter, if provided, is a valid string.
 */
const getChainsSchema = z.object({
  includeChains: z.string().optional().describe('Comma-separated list of chain IDs to include'),
});

/**
 * Creates MCP tools for querying blockchain chain information.
 * 
 * This function returns a collection of tools that provide access to comprehensive
 * blockchain network information including supported tokens, RPC endpoints,
 * block explorers, and contract addresses.
 * 
 * @param {RelayClient} client - Configured Relay Protocol API client
 * @returns {Object} Object containing chain-related MCP tools
 * 
 * @example
 * ```typescript
 * const client = new RelayClient('https://api.relay.link');
 * const chainTools = createChainTools(client);
 * 
 * // Get all supported chains
 * const allChains = await chainTools.relay_get_chains.handler({});
 * 
 * // Get specific chains only
 * const ethAndBsc = await chainTools.relay_get_chains.handler({
 *   includeChains: '1,56'
 * });
 * ```
 */
export function createChainTools(client: RelayClient) {
  return {
    /**
     * MCP Tool: Get supported blockchain chains
     * 
     * Retrieves detailed information about all blockchain networks supported by
     * Relay Protocol for cross-chain operations. This includes major networks
     * like Ethereum, Polygon, Arbitrum, Optimism, Base, and many others.
     * 
     * Features:
     * - Complete chain metadata (name, RPC URLs, explorers)
     * - Supported token lists with contract addresses
     * - Network-specific configuration and capabilities
     * - Optional filtering by specific chain IDs
     * 
     * Common Chain IDs:
     * - Ethereum: 1
     * - Optimism: 10  
     * - BNB Chain: 56
     * - Polygon: 137
     * - Base: 8453
     * - Arbitrum: 42161
     */
    relay_get_chains: {
      name: 'relay_get_chains',
      description: 'Get all supported chains for cross-chain operations. Returns detailed information about each chain including RPC URLs, explorers, currencies, and supported tokens.\n\nCommon Chain IDs:\n• Ethereum: 1\n• Optimism: 10\n• Polygon: 137\n• Arbitrum: 42161\n• Base: 8453\n• BNB Chain: 56\n\nOptional: Use includeChains parameter to filter specific chains (comma-separated chain IDs).',
      inputSchema: {
        type: 'object',
        properties: {
          includeChains: {
            type: 'string',
            description: 'Comma-separated list of chain IDs to include'
          }
        },
        additionalProperties: false
      },
      /**
       * Handler function for the relay_get_chains tool.
       * 
       * @param {unknown} args - Raw arguments from MCP client
       * @returns {Promise<ChainsResponse>} Chain information data
       * @throws {ZodError} When arguments don't match the expected schema
       */
      handler: async (args: unknown) => {
        const { includeChains } = getChainsSchema.parse(args);
        return await client.getChains(includeChains);
      },
    },
  };
}
