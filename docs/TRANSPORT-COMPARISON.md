# Transport Comparison: Stdio vs SSE

This document explains the differences between the two transport methods supported by the Relay Protocol MCP Server.

## Overview

| Feature | Stdio Transport | SSE Transport |
|---------|----------------|---------------|
| **File** | `src/index.ts` | `src/server.ts` |
| **Protocol** | Standard I/O (stdin/stdout) | HTTP with Server-Sent Events |
| **Use Case** | Local development, Claude Desktop | Cloud hosting, web clients |
| **Deployment** | Local machine only | Railway, Heroku, Render, etc. |
| **Port** | Not applicable | Configurable (default: 3000) |
| **Command** | `pnpm start` | `pnpm start:sse` |
| **Network** | None (local process) | HTTP server (public/private) |

## Stdio Transport

### How It Works
- Uses Node.js standard input/output streams
- Direct process-to-process communication
- MCP client spawns the server as a child process
- No network traffic involved

### Configuration Example
```json
{
  "mcpServers": {
    "Relay Protocol": {
      "command": "node",
      "args": ["/path/to/dist/index.js"]
    }
  }
}
```

### Pros
- ✅ Simple setup
- ✅ No network configuration needed
- ✅ Zero latency (local process)
- ✅ More secure (no network exposure)
- ✅ Perfect for Claude Desktop

### Cons
- ❌ Local machine only
- ❌ Cannot share across network
- ❌ Requires local installation
- ❌ One instance per client

### When to Use
- Running Claude Desktop locally
- Development and testing
- Single-user personal use
- No need for remote access

## SSE (Server-Sent Events) Transport

### How It Works
- HTTP server listening on a port
- Server-Sent Events for real-time communication
- Clients connect via HTTP(S) URL
- Can serve multiple clients simultaneously

### Configuration Example
```json
{
  "mcpServers": {
    "Relay Protocol": {
      "transport": "sse",
      "url": "https://your-app.railway.app/sse"
    }
  }
}
```

### Pros
- ✅ Cloud deployment (Railway, Heroku, etc.)
- ✅ Accessible from anywhere
- ✅ Can serve multiple clients
- ✅ HTTPS support (secure)
- ✅ Professional deployment

### Cons
- ❌ Requires hosting setup
- ❌ Network latency
- ❌ Potential hosting costs
- ❌ More complex configuration

### When to Use
- Multiple users/teams
- Remote access needed
- Production deployments
- Integration with web apps
- Shared infrastructure

## Technical Details

### Stdio Implementation
```typescript
// src/index.ts
const transport = new StdioServerTransport();
await server.connect(transport);
// No console output (interferes with protocol)
```

### SSE Implementation
```typescript
// src/server.ts
const app = express();
app.get('/sse', async (req, res) => {
  const transport = new SSEServerTransport('/message', res);
  await server.connect(transport);
});
app.listen(PORT);
```

## Endpoints (SSE Only)

The SSE server exposes these HTTP endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Server information and metadata |
| `/health` | GET | Health check for monitoring |
| `/sse` | GET | SSE connection for MCP protocol |
| `/message` | POST | Message endpoint (used by SSE transport) |

## Security Considerations

### Stdio
- **Isolation**: Each client has its own server instance
- **Access**: Only local user can access
- **Authentication**: Not needed (OS-level security)

### SSE
- **Exposure**: Publicly accessible if deployed to cloud
- **Authentication**: Consider adding for production
- **Rate Limiting**: Recommended for public deployments
- **HTTPS**: Provided by Railway/most hosts

## Performance

### Stdio
- **Latency**: < 1ms (local process)
- **Throughput**: Limited by CPU/memory
- **Scalability**: One instance per client

### SSE
- **Latency**: 10-100ms (depends on network)
- **Throughput**: Limited by network and server
- **Scalability**: Multiple clients, one server

## Development Workflow

### Local Development
```bash
# Test stdio transport
pnpm dev

# Test SSE transport
pnpm dev:sse
```

### Production Build
```bash
# Build both
pnpm build

# Run stdio version
pnpm start

# Run SSE version
pnpm start:sse
```

## Choosing the Right Transport

### Use Stdio If:
- ✓ Using Claude Desktop
- ✓ Single user, local machine
- ✓ Development/testing
- ✓ Security is critical
- ✓ No remote access needed

### Use SSE If:
- ✓ Need cloud deployment
- ✓ Multiple users/teams
- ✓ Remote access required
- ✓ Web application integration
- ✓ Professional/production use

## Migration

### From Stdio to SSE
1. Deploy SSE version to Railway/cloud
2. Update client configuration with URL
3. Change transport type to "sse"
4. Test connection to cloud endpoint

### From SSE to Stdio
1. Build project locally
2. Update client configuration with command
3. Remove transport type (defaults to stdio)
4. Restart MCP client

## Both Transports Support

✅ All 9 MCP tools (identical functionality)
✅ Same error handling
✅ Same API client (Relay Protocol)
✅ Same TypeScript types
✅ Same validation schemas

The only difference is **how** the client communicates with the server, not **what** the server can do.

## Example: Same Query, Different Transports

### Stdio
```bash
# Client spawns: node dist/index.js
# Communication via stdin/stdout
```

### SSE
```bash
# Client connects to: https://your-app.railway.app/sse
# Communication via HTTP/SSE
```

**Same query in both:**
```text
"Show me all supported blockchains"
```

**Same response from both:**
```json
{
  "chains": [
    { "id": 1, "name": "Ethereum", "vmType": "evm" },
    { "id": 137, "name": "Polygon", "vmType": "evm" },
    ...
  ]
}
```

## Conclusion

- **Stdio** is perfect for local, single-user scenarios
- **SSE** enables cloud deployment and multi-user access
- Both provide identical functionality
- Choose based on deployment needs, not features
