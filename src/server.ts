#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { config } from './config.js';
import {
  createRetirementStatusResult,
  retirementStatusTool,
  RETIREMENT_NOTICE,
} from './retirement.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function main() {
  const app = express();
  app.use(express.json());

  const server = new Server(
    {
      name: config.mcp.serverName,
      version: '0.1.0',
      icons: [{ src: config.mcp.serverIcon }],
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [retirementStatusTool],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === retirementStatusTool.name) {
      return createRetirementStatusResult();
    }

    return {
      content: [{ type: 'text', text: RETIREMENT_NOTICE }],
      isError: true,
    };
  });

  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      projectStatus: 'discontinued',
      server: config.mcp.serverName,
      version: '0.1.0',
      transport: 'sse',
    });
  });

  app.get('/', (_req, res) => {
    res.json({
      name: config.mcp.serverName,
      version: '0.1.0',
      description: RETIREMENT_NOTICE,
      transport: 'sse',
      endpoints: {
        health: '/health',
        sse: '/sse',
        message: '/message',
      },
      tools: 1,
      documentation: 'https://github.com/warengonzaga/relay-protocol-mcp-server',
    });
  });

  const transports = new Map<string, SSEServerTransport>();

  app.get('/sse', async (req, res) => {
    try {
      const transport = new SSEServerTransport('/message', res);
      const sessionId = transport.sessionId;
      transports.set(sessionId, transport);
      await server.connect(transport);

      req.on('close', () => {
        transports.delete(sessionId);
      });
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Failed to establish SSE connection',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    }
  });

  app.post('/message', async (req, res) => {
    const sessionIdParam = req.query.sessionId;
    const sessionId = Array.isArray(sessionIdParam)
      ? sessionIdParam[0]
      : sessionIdParam;

    if (!sessionId || typeof sessionId !== 'string') {
      res.status(400).json({ error: 'Missing sessionId query parameter' });
      return;
    }

    const transport = transports.get(sessionId);
    if (!transport) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    await transport.handlePostMessage(req, res);
  });

  app.listen(PORT, () => {
    console.log(`Relay Protocol MCP retirement status server listening on port ${PORT}`);
  });
}

main().catch((error) => {
  console.error('Failed to start status server:', error);
  process.exit(1);
});
