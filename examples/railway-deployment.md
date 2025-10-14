# Railway Deployment Example

This directory contains examples and configurations for deploying the Relay Protocol MCP Server to Railway.

## Quick Start

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Railway deployment"
   git push origin main
   ```

2. **Deploy to Railway**
   - Visit [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect the configuration and deploy

3. **Get Your URL**
   - Once deployed, Railway will provide a public URL
   - Use it in your MCP client configuration

## Testing Your Deployment

### Using curl
```bash
# Health check
curl https://your-app.railway.app/health

# Server info
curl https://your-app.railway.app/

# Test SSE connection (will hang waiting for events)
curl -N https://your-app.railway.app/sse
```

### Using MCP Client

**Claude Desktop Configuration:**
```json
{
  "mcpServers": {
    "Relay Protocol (Railway)": {
      "transport": "sse",
      "url": "https://your-app.railway.app/sse"
    }
  }
}
```

**Custom MCP Client (TypeScript):**
```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const transport = new SSEClientTransport(
  new URL('https://your-app.railway.app/sse')
);

const client = new Client({
  name: 'my-relay-client',
  version: '1.0.0',
}, {
  capabilities: {}
});

await client.connect(transport);

// List available tools
const tools = await client.listTools();
console.log('Available tools:', tools.tools.length);

// Call a tool
const result = await client.callTool({
  name: 'relay_get_chains',
  arguments: {}
});

console.log('Chains:', result);
```

## Environment Variables

Railway automatically provides:
- `PORT` - The port your server listens on (auto-configured)
- `RAILWAY_ENVIRONMENT` - Current environment name
- `RAILWAY_PUBLIC_DOMAIN` - Your public URL

No custom environment variables are needed for basic deployment.

## Monitoring

### View Logs in Railway Dashboard
```bash
# Or use Railway CLI
railway logs --follow
```

### Check Server Status
```bash
curl https://your-app.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "server": "Relay Protocol",
  "version": "0.1.0",
  "transport": "sse"
}
```

## Local Testing Before Deployment

Test the SSE server locally:

```bash
# Build the project
yarn build

# Start the SSE server
yarn start:sse

# Or use development mode with auto-reload
yarn dev:sse
```

Then test locally:
```bash
# Health check
curl http://localhost:3000/health

# Server info
curl http://localhost:3000/

# Test with MCP client pointing to http://localhost:3000/sse
```

## Troubleshooting

### Deployment Fails
- Check Railway logs for errors
- Verify `railway.json` configuration is valid
- Ensure all dependencies are in `package.json`
- Check Node.js version in `package.json` engines field

### SSE Connection Issues
- Verify the URL is correct (should end with `/sse`)
- Check if Railway assigned the PORT correctly
- Ensure your firewall allows outbound SSE connections
- Test with curl first before trying MCP clients

### Tools Not Working
- Check Railway logs for API errors
- Verify Relay Protocol API is accessible from Railway's network
- Test individual tool calls with curl

### High Costs
- Railway free tier includes $5 in credits
- This server uses minimal resources (< 100MB RAM)
- Should easily fit within free tier for personal use
- Sleep after 30 minutes of inactivity (wakes automatically)

## Advanced Configuration

### Custom Domain
1. Go to Railway project → Settings
2. Click "Generate Domain" or add custom domain
3. Update your MCP client configuration

### Multiple Environments
```bash
# Create staging environment
railway environment create staging

# Deploy to specific environment
railway up --environment production
railway up --environment staging
```

### Automatic Deployments
- Connect your GitHub repository to Railway
- Every push to configured branch triggers deployment
- Configure in Railway project settings

## Performance Tips

1. **Railway Region**: Choose region closest to your users
2. **Health Checks**: Railway uses `/health` for service health monitoring
3. **Logs**: Keep logs concise to reduce storage costs
4. **Caching**: Consider adding Redis for production (optional)

## Security Considerations

- Railway provides HTTPS by default (free SSL certificates)
- No authentication needed (Relay Protocol API is public)
- Consider rate limiting for production use
- Monitor usage in Railway dashboard

## Cost Estimation

For typical personal use:
- **Memory**: ~50-100MB
- **CPU**: Minimal (event-driven)
- **Network**: < 1GB/month for personal use
- **Cost**: Usually within free tier ($5/month credit)

For production use:
- Consider Railway's Pro plan ($20/month)
- Add rate limiting and monitoring
- Scale as needed based on usage

## Support

- **Railway Documentation**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Project Issues**: https://github.com/warengonzaga/relay-protocol-mcp-server/issues
- **MCP SDK Docs**: https://modelcontextprotocol.io

## Example Queries After Deployment

Once deployed and configured in your MCP client:

```text
"Show me all supported blockchain networks"
"What's the current price of USDC on Ethereum?"
"Generate a quote to bridge 100 USDC from Ethereum to Polygon"
"Find all verified stablecoins on Arbitrum"
```

All 9 tools work identically whether using stdio or SSE transport!
