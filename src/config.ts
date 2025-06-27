/**
 * Configuration settings for the Relay Protocol MCP Server.
 * 
 * This configuration is intentionally hard-coded to provide a zero-configuration
 * experience for users. The Relay Protocol API is free and public, requiring no
 * authentication or environment setup.
 * 
 * @constant {Object} config - Application configuration object
 */
export const config = {
  /** Relay Protocol API configuration */
  relay: {
    /** Base URL for the Relay Protocol REST API */
    baseUrl: 'https://api.relay.link',
    /** Request timeout in milliseconds (30 seconds) */
    timeout: 30000,
  },
  /** MCP server configuration */
  mcp: {
    /** Server name identifier for MCP protocol */
    serverName: 'relay-protocol-mcp',
  },
} as const;
