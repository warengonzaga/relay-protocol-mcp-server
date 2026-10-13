# Relay Protocol MCP Server

A community-built MCP integration for the Relay Protocol API.

## Project status

**Discontinued.** Relay Protocol is not discontinued. This community project is being retired because the API is changing and responses are no longer available publicly outside the authorized integration scope. Relay's team has also created its own MCP server, so this project will not be maintained.

Read Relay's [Requests v3 migration guide](https://docs.relay.link/references/api/api_guides/migrating-to-requests-v3).

This repository no longer makes Relay API requests. Its MCP entry points expose only a static retirement notice. The original client and tool source remains here for reference.

## Run the status server locally

Requires Node.js 20 or newer and pnpm.

```sh
pnpm install
pnpm build
pnpm start
```

The server provides the `relay_project_status` MCP tool. The optional SSE entry point can be started with `pnpm start:sse`; it also exposes `/health` and `/` status endpoints.

## License

MIT. See [LICENSE](LICENSE).
