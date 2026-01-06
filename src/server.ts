#!/usr/bin/env node

/**
 * Relay Protocol MCP Server - HTTP/SSE Transport
 * 
 * This is an alternative entry point for the MCP server that uses HTTP with Server-Sent Events (SSE)
 * transport instead of stdio. This allows the server to be deployed to cloud platforms like Railway,
 * Heroku, Render, or any other hosting service that supports HTTP servers.
 * 
 * The server exposes two endpoints:
 * - GET /sse - SSE endpoint for MCP protocol communication
 * - POST /message - HTTP endpoint for sending messages to the MCP server
 * 
 * Environment Variables:
 * - PORT: Port number to listen on (default: 3000)
 * 
 * @author Relay Protocol MCP Server Team
 * @version 0.1.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { RelayClient } from './client/RelayClient.js';
import { createAllTools } from './tools/index.js';
import { config } from './config.js';
import {
  RelayAPIError,
  RelayConnectionError,
} from './client/errors.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

/**
 * Main function that initializes and starts the HTTP/SSE MCP server.
 * 
 * This function:
 * 1. Creates an Express HTTP server
 * 2. Creates a new MCP server instance with tool capabilities
 * 3. Initializes the Relay Protocol API client
 * 4. Registers all available tools
 * 5. Sets up request handlers for tool listing and execution
 * 6. Exposes SSE endpoint for MCP communication
 * 7. Starts the HTTP server
 * 
 * @throws {Error} If server initialization fails
 */
async function main() {
  const app = express();
  app.use(express.json());

  // Create MCP server instance with tool capabilities
  const server = new Server(
    {
      name: config.mcp.serverName,
      version: '0.1.0',
      icon: config.mcp.serverIcon,
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
      // Log stack trace server-side for debugging
      console.error('Unexpected tool error:', error);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: 'Unexpected error',
                details: {
                  message: error instanceof Error ? error.message : String(error),
                  // Stack traces logged server-side only
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

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ 
      status: 'healthy',
      server: config.mcp.serverName,
      version: '0.1.0',
      transport: 'sse'
    });
  });

  // Root endpoint with server info
  app.get('/', (_req, res) => {
    res.json({
      name: config.mcp.serverName,
      version: '0.1.0',
      description: 'Model Context Protocol server for Relay Protocol REST API',
      transport: 'sse',
      endpoints: {
        health: '/health',
        sse: '/sse',
        message: '/message'
      },
      tools: Object.keys(tools).length,
      documentation: 'https://github.com/warengonzaga/relay-protocol-mcp-server'
    });
  });

  // Store active transports for message routing
  const transports = new Map<string, SSEServerTransport>();

  // SSE endpoint for MCP communication
  app.get('/sse', async (req, res) => {
    console.log('New SSE connection established');
    
    const transport = new SSEServerTransport('/message', res);
    const sessionId = transport.sessionId;
    
    // Store transport for message routing
    transports.set(sessionId, transport);
    
    // Connect the transport to the MCP server
    await server.connect(transport);
    
    // Handle client disconnect
    req.on('close', () => {
      console.log(`SSE connection closed for session: ${sessionId}`);
      transports.delete(sessionId);
    });
  });

  // Message endpoint for receiving client messages
  app.post('/message', async (req, res) => {
    const sessionId = req.query.sessionId as string;
    
    if (!sessionId) {
      res.status(400).json({ error: 'Missing sessionId query parameter' });
      return;
    }
    
    const transport = transports.get(sessionId);
    
    if (!transport) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    
    try {
      await transport.handlePostMessage(req, res);
    } catch (error) {
      console.error('Error handling POST message:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Failed to process message',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });

  // Start the HTTP server
  app.listen(PORT, () => {
    console.log(`🚀 Relay Protocol MCP Server running on port ${PORT}`);
    console.log(`📡 SSE endpoint: http://localhost:${PORT}/sse`);
    console.log(`💬 Message endpoint: http://localhost:${PORT}/message`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    console.log(`\n🔧 Available tools: ${Object.keys(tools).length}`);
  });
}

/**
 * Application entry point.
 * 
 * Starts the HTTP/SSE MCP server and handles any startup errors gracefully.
 */
main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
