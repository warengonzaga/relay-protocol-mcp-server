/**
 * MCP Tools Registry for Relay Protocol API
 * 
 * This module aggregates all available MCP tools that provide access to the
 * Relay Protocol REST API functionality. Each tool is implemented as a separate
 * module and registered here for use by the MCP server.
 * 
 * Tool Categories:
 * - Chain Tools: Blockchain network information and metadata
 * - Price Tools: Real-time token pricing across chains
 * - Quote Tools: Bridge and swap quote generation
 * - Request Tools: Transaction monitoring and status tracking
 * - Transaction Tools: Transaction indexing and notification
 * - Currency Tools: Token discovery and metadata
 * - Swap Tools: Multi-chain swap execution
 * 
 * @module tools
 */

import { RelayClient } from '../client/RelayClient.js';
import { createChainTools } from './chains.js';
import { createPriceTools } from './price.js';
import { createQuoteTools } from './quotes.js';
import { createRequestTools } from './requests.js';
import { createTransactionTools } from './transactions.js';
import { createCurrencyTools } from './currencies.js';
import { createSwapTools } from './swap.js';

/**
 * Interface defining the structure of an MCP tool.
 * 
 * Each tool must implement this interface to be compatible with the MCP server.
 * The handler function receives validated arguments and returns the tool result.
 */
interface Tool {
  /** Unique identifier for the tool (prefixed with 'relay_') */
  name: string;
  /** Human-readable description with usage examples */
  description: string;
  /** JSON schema defining the tool's input parameters */
  inputSchema: any;
  /** Async function that executes the tool logic */
  handler: (args: unknown) => Promise<any>;
}

/**
 * Creates and aggregates all available MCP tools for the Relay Protocol API.
 * 
 * This function initializes all tool categories and combines them into a single
 * registry that can be used by the MCP server. Each tool is configured with
 * the provided RelayClient instance for API communication.
 * 
 * @param {RelayClient} client - Configured Relay Protocol API client
 * @returns {Record<string, Tool>} Complete registry of all available tools
 * 
 * @example
 * ```typescript
 * const client = new RelayClient('https://api.relay.link');
 * const tools = createAllTools(client);
 * console.log(Object.keys(tools)); // Lists all 9 available tools
 * ```
 */
export function createAllTools(client: RelayClient): Record<string, Tool> {
  return {
    ...createChainTools(client),
    ...createPriceTools(client),
    ...createQuoteTools(client),
    ...createRequestTools(client),
    ...createTransactionTools(client),
    ...createCurrencyTools(client),
    ...createSwapTools(client),
  };
}

// Export individual tool creators for testing and modular usage
export { 
  createChainTools, 
  createPriceTools, 
  createQuoteTools, 
  createRequestTools, 
  createTransactionTools,
  createCurrencyTools,
  createSwapTools 
};
