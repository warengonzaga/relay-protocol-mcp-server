import { RelayClient } from '../client/RelayClient.js';
import { createChainTools } from './chains.js';
import { createPriceTools } from './price.js';
import { createQuoteTools } from './quotes.js';
import { createRequestTools } from './requests.js';
import { createTransactionTools } from './transactions.js';
import { createCurrencyTools } from './currencies.js';
import { createSwapTools } from './swap.js';

interface Tool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (args: unknown) => Promise<any>;
}

export function createAllTools(client: RelayClient): Record<string, Tool> {
  return {
    ...createChainTools(client),
    ...createPriceTools(client),
    ...createQuoteTools(client),
    ...createRequestTools(client),
    ...createTransactionTools(client),
    ...createCurrencyTools(client),
    ...createSwapTools(client),
  };
}

export { 
  createChainTools, 
  createPriceTools, 
  createQuoteTools, 
  createRequestTools, 
  createTransactionTools,
  createCurrencyTools,
  createSwapTools 
};
