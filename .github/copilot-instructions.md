# Relay Protocol MCP Project Guidelines

You are working on a Model Context Protocol (MCP) server for the Relay Protocol API. This document outlines the project specifications and coding standards.

## Project Overview

- **Purpose**: MCP server providing access to Relay Protocol REST API
- **Language**: TypeScript with Node.js
- **Framework**: Official MCP SDK (@modelcontextprotocol/sdk)
- **API Client**: Axios for HTTP requests
- **Validation**: Zod for schema validation

## Architecture Principles

### 1. Separation of Concerns
- Keep API client logic separate from MCP tool handlers
- Use dedicated schema files for validation
- Separate types from implementation

### 2. Error Handling
- Always wrap tool handlers in try-catch blocks
- Return structured error responses with debugging details
- Distinguish between API errors, connection errors, and validation errors

### 3. Type Safety
- Use TypeScript strict mode
- Define all API types explicitly
- Use Zod for runtime validation matching TypeScript types

### 4. Tool Design
- Tools are grouped by resource (jobs, workflows, callbacks)
- All tools prefixed with `relay_` to avoid conflicts
- Tool descriptions include examples
- Direct data return (no success/data wrapping)

## Code Standards

### File Organization
```
src/
├── client/       # HTTP client and error handling
├── tools/        # MCP tool implementations
├── schemas/      # Zod validation schemas
├── types/        # TypeScript type definitions
├── utils/        # Helper functions
└── index.ts      # MCP server entry point
```

### Naming Conventions
- Files: kebab-case (e.g., `relay-client.ts`)
- Classes: PascalCase (e.g., `RelayClient`)
- Functions: camelCase (e.g., `createJob`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- MCP tools: snake_case with prefix (e.g., `relay_create_job`)

### Error Response Format
```typescript
{
  error: string,       // Simple message for LLM
  details: {          // Full details for debugging
    message: string,
    statusCode?: number,
    response?: any,
    request?: any
  }
}
```

### Pagination Pattern
- Default pagination with page/limit
- Optional `fetchAll` flag for auto-pagination
- Return pagination metadata with results
- Safety limit of 10,000 items for fetchAll

### Import Style
- Use ES modules with .js extensions
- Use type imports where applicable
- Group imports: external, internal, types

### Testing Guidelines
- Test error scenarios
- Mock HTTP requests
- Validate schema parsing
- Test pagination logic

## Key Decisions

1. **No Authentication**: Relay API is free, no API keys needed
2. **Hard-coded Configuration**: Fixed API URL and settings in config.ts
3. **No Caching**: Adds complexity without clear benefit
4. **Hybrid Pagination**: Manual control with auto-fetch option
5. **Direct Returns**: MCP SDK handles success/error states

## Common Patterns

### Tool Handler Template
```typescript
async function handleToolName(args: unknown) {
  const validated = toolSchema.parse(args);
  return await client.apiMethod(validated);
}
```

### Error Handling in Tools
```typescript
try {
  const result = await operation();
  return result;
} catch (error) {
  if (error instanceof SpecificError) {
    // Handle specific error type
  }
  throw error; // Let MCP SDK handle
}
```

## Development Workflow

1. Run `yarn dev` for development
2. Use `yarn typecheck` before committing
3. Run `yarn test` for test suite
4. Use `yarn build` for production build

## Debugging Tips

- Check console output for API request logs
- Error details include full request/response data
- Use fetchAll sparingly to avoid large responses
- Test with small datasets first

Remember: The goal is to provide a clean, type-safe interface to Relay Protocol through MCP tools while maintaining excellent developer experience.
