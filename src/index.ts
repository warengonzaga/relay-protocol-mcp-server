#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { config } from './config.js';
import {
  createRetirementStatusResult,
  retirementStatusTool,
  RETIREMENT_NOTICE,
} from './retirement.js';

async function main() {
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

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(() => {
  process.exit(1);
});
