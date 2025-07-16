# Relay Protocol MCP Server

Model Context Protocol (MCP) server for the [Relay Protocol REST API](https://docs.relay.link/references/api/) enabling cross-chain bridging and token swapping operations.

## Features

- **Cross-Chain Bridging** - Bridge tokens between 50+ blockchain networks
- **Multi-Chain Swaps** - Aggregate tokens from multiple chains into single destination
- **Real-Time Pricing** - Get current token prices across all supported chains
- **Request Monitoring** - Track execution status and transaction details
- **Currency Discovery** - Browse 1000+ supported tokens with filtering
- **Zero Configuration** - No API keys required (free public API)
- **Type Safety** - Full TypeScript support with comprehensive validation

## Quick Start

```bash
# Install and build
yarn install && yarn build

# Run development server
yarn dev

# Run production server
yarn start
```

## MCP Integration

Add to your Claude Desktop configuration file:

**Config Location:**

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "Relay Protocol": {
      "command": "node",
      "args": ["/absolute/path/to/relay-protocol-mcp-server/dist/index.js"]
    }
  }
}
```

## Available Tools (9 total)

| Tool | Purpose | Example Use Case |
|------|---------|------------------|
| `relay_get_chains` | List supported blockchain networks | "Show me all chains Relay supports" |
| `relay_get_token_price` | Get real-time token prices | "What's the price of USDC on Ethereum?" |
| `relay_get_currencies` | Discover tokens with advanced filtering | "Show verified tokens on Arbitrum" |
| `relay_get_quote` | Generate bridging/swap quotes | "Quote bridging 100 USDC from Ethereum to Polygon" |
| `relay_swap_multi_input` | Execute multi-chain swaps | "Swap ETH + USDC from multiple chains to USDC on Base" |
| `relay_get_execution_status` | Track request progress | "Check status of my bridge transaction" |
| `relay_get_requests` | Monitor request history | "Show my recent cross-chain transactions" |
| `relay_transactions_index` | Index transactions for tracking | "Register this transaction for monitoring" |
| `relay_transactions_single` | Index specific transfers/wraps | "Track this specific transfer operation" |

## Example Prompts

```text
# Bridge tokens
"Bridge 100 USDC from Ethereum to Polygon"
"What chains can I bridge USDC between?"

# Multi-chain swaps
"Swap all my USDC from Ethereum and Polygon to ETH on Arbitrum"
"Consolidate my tokens from multiple chains into USDC on Base"

# Price discovery
"Show current ETH prices across all chains"
"What's the cheapest way to get USDC on Optimism?"

# Currency discovery  
"Find all stablecoins available on Polygon"
"Show me verified tokens with bridging support"
```

## Development

```bash
yarn typecheck    # Type checking
yarn dev         # Development with auto-reload
yarn build       # Production build
yarn start       # Start production server
```

## Project Structure

```text
src/
├── client/           # HTTP client and error handling
├── tools/            # 9 MCP tool implementations  
├── types/relay.ts    # Complete TypeScript definitions
├── config.ts         # API configuration
└── index.ts          # MCP server entry point
```

## Troubleshooting

**"No available tools" in Claude:**

1. Verify absolute path in config is correct
2. Test server: `echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node dist/index.js`
3. Restart Claude Desktop after config changes
4. Ensure Node.js >= 20.0.0 and `yarn build` completed

**Connection issues:**

- Run `yarn build` before starting
- Check server starts without errors: `yarn dev`
- Verify JSON syntax in Claude config file

## Requirements

- Node.js >= 20.0.0
- yarn package manager

## API Reference

Full access to [Relay Protocol REST API](https://docs.relay.link/references/api/) with TypeScript types and validation. The Relay Protocol supports:

- **50+ Blockchain Networks** including Ethereum, Polygon, Arbitrum, Optimism, Base, etc.
- **1000+ Tokens** with real-time pricing and bridging support
- **Free Public API** with no rate limits or authentication required
- **Production-Ready** infrastructure handling millions in daily volume

## License

MIT
