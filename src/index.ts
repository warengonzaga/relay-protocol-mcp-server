#!/usr/bin/env node

/**
 * Relay Protocol MCP Server
 * 
 * This is the main entry point for the Model Context Protocol (MCP) server that provides
 * access to the Relay Protocol REST API for cross-chain bridging and token swapping.
 * 
 * The server implements all 9 Relay Protocol API endpoints as MCP tools:
 * - Chain information queries
 * - Token price lookups
 * - Currency discovery
 * - Quote generation for bridging/swapping
 * - Multi-chain swap execution
 * - Request monitoring and status tracking
 * - Transaction indexing
 * 
 * Features:
 * - Zero configuration (no API keys required)
 * - Comprehensive error handling with detailed debugging information
 * - Full TypeScript support with runtime validation
 * - Compatible with Claude Desktop and other MCP clients
 * 
 * @author Relay Protocol MCP Server Team
 * @version 0.1.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { RelayClient } from './client/RelayClient.js';
import { createAllTools } from './tools/index.js';
import { config } from './config.js';
import {
  RelayAPIError,
  RelayConnectionError,
} from './client/errors.js';

/**
 * Main function that initializes and starts the MCP server.
 * 
 * This function:
 * 1. Creates a new MCP server instance with tool capabilities
 * 2. Initializes the Relay Protocol API client
 * 3. Registers all available tools
 * 4. Sets up request handlers for tool listing and execution
 * 5. Implements comprehensive error handling
 * 6. Starts the server with stdio transport
 * 
 * @throws {Error} If server initialization fails
 */
async function main() {
  // Create MCP server instance with tool capabilities
  const server = new Server(
    {
      name: config.mcp.serverName,
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Initialize Relay Protocol API client with configured settings
  const relayClient = new RelayClient(config.relay.baseUrl, config.relay.timeout);

  // Create and register all available MCP tools
  const tools = createAllTools(relayClient);

  /**
   * Handler for listing all available tools.
   * Returns metadata for each tool including name, description, and input schema.
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Object.values(tools).map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  }));

  /**
   * Handler for executing tool calls.
   * 
   * This handler:
   * 1. Validates that the requested tool exists
   * 2. Executes the tool with provided arguments
   * 3. Returns results as formatted JSON text
   * 4. Implements comprehensive error handling for different error types
   * 
   * @param request - The tool call request containing tool name and arguments
   * @returns Tool execution result or structured error response
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = tools[name];

    // Validate tool exists
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    try {
      // Execute the tool and return formatted results
      const result = await tool.handler(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      // Handle Relay API errors (HTTP status codes, API responses)
      if (error instanceof RelayAPIError) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: error.message,
                  details: {
                    statusCode: error.statusCode,
                    response: error.responseData,
                    request: error.requestData,
                  },
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }

      // Handle connection errors (network issues, timeouts)
      if (error instanceof RelayConnectionError) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: 'Connection error',
                  details: {
                    message: error.message,
                    originalError: error.originalError?.message,
                  },
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }

      // Handle all other unexpected errors
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: 'Unexpected error',
                details: {
                  message: error instanceof Error ? error.message : String(error),
                  stack: error instanceof Error ? error.stack : undefined,
                },
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  });

  // Start the MCP server with stdio transport for communication
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Server is now running and listening for MCP requests via stdio
  // No console output to avoid interfering with MCP protocol communication
}

/**
 * Application entry point.
 * 
 * Starts the MCP server and handles any startup errors gracefully.
 * MCP servers should not output to console to avoid protocol interference,
 * so errors are handled silently with appropriate exit codes.
 */
main().catch(() => {
  // Silent failure - MCP servers should not output to console
  // Exit code 1 indicates startup failure to the MCP client
  process.exit(1);
});
