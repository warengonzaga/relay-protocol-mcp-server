# Relay Protocol MCP Server

Model Context Protocol (MCP) server for interacting with the Relay Protocol REST API (relay.link).

## Features

- **Complete API Coverage** - All Relay Protocol REST API endpoints
- **Job Management** - Create, query, update, cancel, and restart jobs
- **Workflow Discovery** - List and inspect available workflows
- **Callback Management** - Register and manage webhook callbacks
- **Smart Pagination** - Manual control with optional auto-fetch
- **Type Safety** - Full TypeScript support with Zod validation
- **Error Handling** - Comprehensive error reporting and debugging
- **Zero Configuration** - No API keys or environment setup required

## Installation

```bash
yarn install
yarn build
```

## Configuration

No configuration required! The server uses hard-coded settings for the public Relay Protocol API:

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

**Configuration Options:**

Option 1 - Using Node command:
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

Option 2 - Direct binary execution:
```json
{
  "mcpServers": {
    "relay-protocol": {
      "command": "/path/to/relay-protocol-mcp-server/dist/index.js"
    }
  }
}
```

## Available Tools

### Jobs

- `relay_create_job` - Create a new job
- `relay_get_job` - Get job details by ID
- `relay_update_job` - Update job status and outputs
- `relay_list_jobs` - List jobs with optional filters
- `relay_cancel_job` - Cancel a running job
- `relay_restart_job` - Restart a failed job

### Workflows

- `relay_create_workflow` - Create a new workflow
- `relay_get_workflow` - Get workflow details by ID
- `relay_list_workflows` - List available workflows
- `relay_update_workflow` - Update workflow configuration
- `relay_delete_workflow` - Delete a workflow

### Callbacks

- `relay_create_callback` - Register a new webhook callback
- `relay_get_callback` - Get callback details by ID
- `relay_list_callbacks` - List registered callbacks
- `relay_update_callback` - Update callback configuration
- `relay_delete_callback` - Delete a callback

## Development

```bash
# Run tests
yarn test

# Run tests in watch mode
yarn test:watch

# Type checking
yarn typecheck

# Linting
yarn lint

# Format code
yarn format

# Development with auto-reload
yarn dev
```

## Project Structure

```
src/
├── client/       # HTTP client and error handling
├── tools/        # MCP tool implementations
├── schemas/      # Zod validation schemas
├── types/        # TypeScript type definitions
├── utils/        # Helper functions
├── config.ts     # Hard-coded configuration
└── index.ts      # MCP server entry point
```

## Error Handling & Debugging

The MCP server provides detailed error information for debugging:

## Error Handling

The MCP server provides detailed error information for debugging:

- **API Errors** - Include HTTP status codes and response data
- **Connection Errors** - Indicate network connectivity issues
- **Validation Errors** - Show which fields failed Zod schema validation
- **Tool Errors** - Comprehensive error context for MCP tool failures

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

## API Reference

This MCP server provides access to the complete [Relay Protocol REST API](https://relay.link). All endpoints are wrapped as MCP tools with proper TypeScript types and validation.

### Pagination

List operations support pagination with these parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `fetchAll` - Auto-fetch all pages (default: false, safety limit: 10,000 items)

### Example Usage in Claude

```
Create a new job with workflow "example-workflow" and input data {"key": "value"}
```

```
List all workflows available in the system
```

```
Get details for job with ID "job-123"
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with proper TypeScript types
4. Add tests for new functionality
5. Run `yarn typecheck && yarn test && yarn lint`
6. Submit a pull request

## License

MIT
