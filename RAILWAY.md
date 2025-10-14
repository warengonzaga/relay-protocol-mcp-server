# Deploying Relay Protocol MCP Server to Railway

This guide explains how to deploy the Relay Protocol MCP Server to [Railway](https://railway.app) for cloud hosting with HTTP/SSE transport.

## Prerequisites

- [Railway account](https://railway.app) (free tier available)
- [Railway CLI](https://docs.railway.app/develop/cli) (optional, for CLI deployment)
- GitHub account (for automatic deployments)

## Deployment Methods

### Method 1: Deploy from GitHub (Recommended)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Add Railway deployment support"
   git push origin main
   ```

2. **Create a new Railway project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect the configuration from `railway.json`

3. **Configure environment variables** (optional)
   - Go to your project settings
   - Add `PORT` if you want a custom port (Railway sets this automatically)
   - Add any other environment variables you need

4. **Deploy**
   - Railway will automatically build and deploy your server
   - You'll get a public URL like `https://your-app.railway.app`

### Method 2: Deploy with Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize and deploy**
   ```bash
   railway init
   railway up
   ```

4. **Get your deployment URL**
   ```bash
   railway domain
   ```

## Configuration

The server uses `railway.json` for deployment configuration:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm build"
  },
  "deploy": {
    "startCommand": "node dist/server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Environment Variables

Railway automatically provides:
- `PORT` - The port your server should listen on
- `RAILWAY_ENVIRONMENT` - Current environment (production, staging, etc.)
- `RAILWAY_PUBLIC_DOMAIN` - Your public deployment URL

## Using the Deployed Server

### Health Check

Test your deployment:
```bash
curl https://your-app.railway.app/health
```

### MCP Client Configuration

Configure your MCP client to use the SSE transport:

**Example for Claude Desktop:**
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

**Example for custom MCP clients:**
```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const transport = new SSEClientTransport(
  new URL('https://your-app.railway.app/sse')
);

const client = new Client({
  name: 'my-client',
  version: '1.0.0',
}, {
  capabilities: {}
});

await client.connect(transport);
```

## Testing Your Deployment

### 1. Check Server Info
```bash
curl https://your-app.railway.app/
```

Response:
```json
{
  "name": "relay-protocol",
  "version": "0.1.0",
  "description": "Model Context Protocol server for Relay Protocol REST API",
  "transport": "sse",
  "endpoints": {
    "health": "/health",
    "sse": "/sse",
    "message": "/message"
  },
  "tools": 9,
  "documentation": "https://github.com/warengonzaga/relay-protocol-mcp-server"
}
```

### 2. Test SSE Connection
```bash
curl -N https://your-app.railway.app/sse
```

### 3. Monitor Logs
```bash
railway logs
```

## Local Testing

Test the SSE server locally before deploying:

```bash
# Build the project
pnpm build

# Start the SSE server
node dist/server.js

# In another terminal, test it
curl http://localhost:3000/health
curl -N http://localhost:3000/sse
```

Or add to `package.json`:
```json
{
  "scripts": {
    "start:sse": "node dist/server.js",
    "dev:sse": "tsx src/server.ts"
  }
}
```

Then run:
```bash
pnpm dev:sse  # Development mode
pnpm build && pnpm start:sse  # Production mode
```

## Monitoring & Debugging

### View Logs
```bash
railway logs --follow
```

### View Metrics
Go to your Railway dashboard to see:
- CPU usage
- Memory usage
- Network traffic
- HTTP request metrics

### Common Issues

**Issue: Server not starting**
- Check logs: `railway logs`
- Verify build succeeded in Railway dashboard
- Ensure `dist/server.js` exists after build

**Issue: SSE connection fails**
- Check if Railway assigned the PORT correctly
- Verify your domain is accessible
- Check for CORS issues if accessing from browser

**Issue: Tools not working**
- Verify Relay Protocol API is accessible from Railway's servers
- Check error messages in Railway logs
- Test API endpoints directly with curl

## Costs

Railway pricing (as of 2024):
- **Hobby Plan**: $5/month for 500 hours + $0.000231/GB-hour RAM
- **Free Trial**: $5 in credits to start
- Sleep after 30 minutes of inactivity (wakes on request)

For this MCP server:
- Minimal resource usage (typically < 100MB RAM)
- Low request volume for personal use
- Should easily fit within free trial limits

## Advanced Configuration

### Custom Domain

1. Go to Railway project settings
2. Click "Generate Domain" or add custom domain
3. Update your MCP client configuration with new URL

### Multiple Environments

Deploy to staging and production:
```bash
# Create staging environment
railway environment staging

# Deploy to staging
railway up --environment staging

# Deploy to production
railway up --environment production
```

### Automatic Deployments

Railway automatically deploys when you push to your connected GitHub branch:
- Push to `main` → deploys to production
- Configure branch-specific deployments in Railway settings

## Security Considerations

1. **No authentication required** - Relay Protocol API is free and public
2. **Rate limiting** - Consider adding rate limiting for production use
3. **CORS** - Configure CORS if accessing from web browsers
4. **HTTPS** - Railway provides HTTPS by default

## Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Project Issues**: https://github.com/warengonzaga/relay-protocol-mcp-server/issues

## Next Steps

1. Deploy to Railway using one of the methods above
2. Test your deployment with health check and SSE endpoint
3. Configure your MCP client to use the deployed URL
4. Monitor logs and metrics in Railway dashboard
5. Set up automatic deployments from GitHub

Happy deploying! 🚀
