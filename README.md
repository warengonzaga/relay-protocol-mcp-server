# Relay Protocol MCP Server

Model Context Protocol (MCP) server for interacting with the [Relay Protocol REST API](https://docs.relay.link/references/api/) for cross-chain bridging and token swapping.

## Features

- **Complete API Coverage** - All 9 Relay Protocol REST API endpoints implemented
- **Cross-Chain Bridging** - Bridge tokens between supported blockchain networks
- **Token Price Queries** - Get real-time token prices across chains
- **Multi-Chain Swaps** - Execute complex swaps across multiple chains
- **Transaction Monitoring** - Track execution status and request details
- **Currency Discovery** - Browse supported tokens and chains
- **Type Safety** - Full TypeScript support with Zod validation schemas
- **Error Handling** - Comprehensive error reporting and debugging
- **Zero Configuration** - No API keys or environment setup required

## Installation

```bash
yarn install
yarn build
```

## Configuration

No configuration required! The server uses the public Relay Protocol API:

- **API URL**: `https://api.relay.link`
- **Timeout**: 30 seconds
- **Authentication**: None (Relay Protocol is free and public)

## Usage

### Running the MCP Server

```bash
# Development with auto-reload
yarn dev

# Production
yarn start
```

### Integrating with Claude Desktop

Add to your Claude Desktop configuration file:

**Configuration File Locations:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Configuration:**

```json
{
  "mcpServers": {
    "relay-protocol": {
      "command": "node",
      "args": ["/path/to/relay-protocol-mcp-server/dist/index.js"]
    }
  }
}
```

## Available Tools

### Chain Information

- **`relay_get_chains`** - Get all supported chains for cross-chain operations
  - Returns detailed chain information including RPC URLs, explorers, currencies, and supported tokens
  - Optional filtering by specific chains

### Token Pricing

- **`relay_get_token_price`** - Get current token price on a specific chain
  - Real-time pricing data for supported tokens
  - Useful for checking values before bridging or swapping

### Currency Discovery

- **`relay_get_currencies`** - Get curated currency metadata with advanced filtering
  - Filter by chain IDs, search terms, contract addresses
  - Support for verified tokens, native currencies, and external search
  - Configurable limits and deposit address filtering

### Quote Generation

- **`relay_get_quote`** - Get executable quote for bridging or swapping tokens
  - Bridge tokens between different chains
  - Swap tokens within the same chain
  - Returns transaction steps, fees, and execution details

- **`relay_get_multi_input_quote`** - Get quote for multi-chain token aggregation
  - Aggregate tokens from multiple chains into a single destination
  - Useful for consolidating holdings across chains

### Execution & Swapping

- **`relay_swap_multi_input`** - Execute multi-chain token swaps
  - Swap tokens from multiple origin chains to single destination
  - Returns executable transaction steps and comprehensive fee breakdown
  - Supports partial fills and custom transaction parameters

### Request Monitoring

- **`relay_get_execution_status`** - Get current execution status of a cross-chain request
  - Track transaction progress and status
  - Returns transaction hashes and execution details

- **`relay_get_request`** - Get detailed information about a specific cross-chain request
  - Includes origin/destination chains, currencies, amounts, and status
  - Can query by request ID or transaction hash

### Transaction Management

- **`relay_transactions_index`** - Notify Relay backend about a transaction
  - Index transactions for cross-chain operation tracking
  - Required for monitoring and status updates
## Development

```bash
# Run type checking
yarn typecheck

# Development with auto-reload
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

## Project Structure

```
src/
├── client/           # HTTP client and error handling
│   ├── RelayClient.ts    # Main API client with all endpoints
│   └── errors.ts         # Custom error classes
├── tools/            # MCP tool implementations
│   ├── chains.ts         # Chain information tools
│   ├── price.ts          # Token pricing tools
│   ├── quotes.ts         # Quote generation tools
│   ├── requests.ts       # Request monitoring tools
│   ├── transactions.ts   # Transaction indexing tools
│   ├── currencies.ts     # Currency discovery tools
│   ├── swap.ts          # Multi-chain swap tools
│   └── index.ts         # Tool aggregation
├── types/
│   └── relay.ts         # Complete TypeScript definitions
├── config.ts            # Configuration settings
└── index.ts             # MCP server entry point
```

## Error Handling & Debugging

The MCP server provides detailed error information for debugging:

- **API Errors** - Include HTTP status codes and response data from Relay Protocol
- **Connection Errors** - Indicate network connectivity issues
- **Validation Errors** - Show which fields failed Zod schema validation with detailed messages
- **Tool Errors** - Comprehensive error context for MCP tool failures

All API requests are logged for debugging purposes.

## Requirements

- **Node.js** >= 18.0.0
- **yarn** package manager
- **TypeScript** for development

## Quick Start

1. **Clone and install**:

   ```bash
   git clone <repository-url>
   cd relay-protocol-mcp-server
   yarn install
   ```

2. **Build the project**:

   ```bash
   yarn build
   ```

3. **Test the server**:

   ```bash
   yarn dev
   ```

4. **Configure Claude Desktop** (see Integration section above)

5. **Restart Claude Desktop** after configuration changes

## Troubleshooting

### "No available tools" in Claude Desktop

If Claude Desktop shows "no available tools", try these steps:

1. **Verify the path** in your configuration is correct and absolute:

   ```bash
   # Check if the built file exists
   ls -la /path/to/relay-protocol-mcp-server/dist/index.js
   ```

2. **Test the MCP server directly**:

   ```bash
   echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node dist/index.js
   ```

   Should return a list of 9 tools.

3. **Check Claude Desktop logs** (if available) for error messages

4. **Restart Claude Desktop** completely after configuration changes

5. **Verify JSON syntax** in your `claude_desktop_config.json` file

### Connection Issues

- Ensure Node.js >= 18.0.0 is installed
- Run `yarn build` to ensure the latest version is built
- Check that the MCP server starts without errors: `yarn dev`

## API Reference

This MCP server provides access to the complete [Relay Protocol REST API](https://docs.relay.link/references/api/). All endpoints are wrapped as MCP tools with proper TypeScript types and validation.

### Example Usage in Claude

**Get supported chains:**
```
Show me all blockchain networks supported by Relay Protocol
```

**Check token price:**
```
What's the current price of USDC on Ethereum (chain ID 1)?
```

**Get a bridge quote:**
```
I want to bridge 100 USDC from Ethereum to Polygon. What would that cost?
```

**Find currencies:**
```
Show me all verified tokens available on Arbitrum
```

**Execute multi-chain swap:**
```
I want to swap tokens from multiple chains into USDC on Base
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with proper TypeScript types
4. Add tests for new functionality
5. Run `yarn typecheck && yarn build`
6. Submit a pull request

## License

MIT
