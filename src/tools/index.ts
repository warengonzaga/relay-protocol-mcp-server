import { RelayClient } from '../client/RelayClient.js';
import { createJobTools } from './jobs.js';
import { createWorkflowTools } from './workflows.js';
import { createCallbackTools } from './callbacks.js';

interface Tool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (args: unknown) => Promise<any>;
}

export function createAllTools(client: RelayClient): Record<string, Tool> {
  return {
    ...createJobTools(client),
    ...createWorkflowTools(client),
    ...createCallbackTools(client),
  };
}

export { createJobTools, createWorkflowTools, createCallbackTools };
