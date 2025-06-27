#!/usr/bin/env node
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
  RelayValidationError,
} from './client/errors.js';

async function main() {
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

  // Initialize Relay client
  const relayClient = new RelayClient(config.relay.baseUrl, config.relay.timeout);

  // Create and register all tools
  const tools = createAllTools(relayClient);

  // Register tools with MCP server
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Object.values(tools).map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = tools[name];

    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    try {
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
      // Handle different error types
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

      if (error instanceof RelayValidationError) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: 'Validation error',
                  details: {
                    message: error.message,
                    validationErrors: error.validationErrors,
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

      // Unknown error
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

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Server is now running silently on stdio
}

// Run the server
main().catch(() => {
  // Silent failure - MCP servers should not output to console
  process.exit(1);
});
