# Project Status

This community MCP integration is discontinued. Relay Protocol is not discontinued. Its API is changing, and responses are no longer publicly available outside the authorized integration scope. Relay's team has its own MCP server. See the [Requests v3 migration guide](https://docs.relay.link/references/api/api_guides/migrating-to-requests-v3).

Do not restore API requests or the retired tools. The stdio and SSE entry points should expose only the static `relay_project_status` tool and status endpoints. Keep the original client, tool implementations, and types for reference unless the owner requests otherwise.

## Checks

- `pnpm typecheck`
- `pnpm build`
