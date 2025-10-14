# Railway Deployment - Quick Reference

## What Was Added

✅ **SSE Server** (`src/server.ts`) - HTTP/SSE transport for cloud deployment
✅ **Railway Config** (`railway.json`) - Deployment configuration
✅ **Railway Ignore** (`.railwayignore`) - Build optimization
✅ **Documentation** - Complete deployment guides
✅ **Express Dependency** - HTTP server support

## File Changes

### New Files
- `src/server.ts` - SSE transport server implementation
- `railway.json` - Railway deployment configuration
- `.railwayignore` - Deployment exclusions
- `RAILWAY.md` - Comprehensive Railway deployment guide
- `examples/railway-deployment.md` - Deployment examples
- `docs/TRANSPORT-COMPARISON.md` - Stdio vs SSE comparison

### Modified Files
- `package.json` - Added Express, new scripts (`dev:sse`, `start:sse`)
- `README.md` - Updated with both transport methods

## Available Commands

```bash
# Local Development (Stdio)
pnpm dev              # Development with auto-reload
pnpm start            # Production stdio server

# Cloud Deployment (SSE)
pnpm dev:sse          # Development SSE server with auto-reload
pnpm start:sse        # Production SSE server

# Build
pnpm build            # Build both servers
```

## Quick Deploy to Railway

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Railway deployment support"
   git push origin main
   ```

2. **Deploy on Railway**
   - Visit [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects configuration from `railway.json`

3. **Configure MCP Client**
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

## Testing SSE Server Locally

```bash
# Build and start
pnpm build && pnpm start:sse

# Test endpoints
curl http://localhost:3000/health
curl http://localhost:3000/
```

Expected health check response:
```json
{
  "status": "healthy",
  "server": "Relay Protocol",
  "version": "0.1.0",
  "transport": "sse"
}
```

## Key Features

### Both Transports Support
- ✅ All 9 MCP tools (identical functionality)
- ✅ Same error handling
- ✅ Same Relay Protocol API access
- ✅ Same TypeScript types

### SSE-Specific Features
- 🌐 HTTP endpoints (/, /health, /sse, /message)
- 📊 Health monitoring
- 🔒 HTTPS support (via Railway)
- 🌍 Public/private deployment options
- 📈 Multi-client support

## Documentation

- **[RAILWAY.md](../RAILWAY.md)** - Complete Railway deployment guide
- **[examples/railway-deployment.md](../examples/railway-deployment.md)** - Deployment examples
- **[docs/TRANSPORT-COMPARISON.md](../docs/TRANSPORT-COMPARISON.md)** - Stdio vs SSE comparison

## Cost Estimate

Railway pricing:
- Free tier: $5/month in credits
- This server: ~50-100MB RAM, minimal CPU
- Typical cost: Within free tier for personal use
- Sleeps after 30min inactivity (wakes on request)

## Support

- **Railway Docs**: https://docs.railway.app
- **MCP SDK**: https://modelcontextprotocol.io
- **Project Issues**: https://github.com/warengonzaga/relay-protocol-mcp-server/issues

---

**Ready to deploy!** 🚀 Choose stdio for local use or SSE for cloud deployment.
